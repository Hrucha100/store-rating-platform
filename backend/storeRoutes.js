const express = require('express');
const router = express.Router();
const db = require('./db');

// Normal User List Feed
router.get('/', (req, res) => {
  const userId = req.query.user_id || 0;
  const sql = `
    SELECT s.id, s.name, s.address, 
           IFNULL(AVG(r.rating_value), 0) AS overall_rating,
           MAX(CASE WHEN r.user_id = ? THEN r.rating_value END) AS user_submitted_rating,
           MAX(CASE WHEN r.user_id = ? THEN r.review_text END) AS user_review_text
    FROM stores s
    LEFT JOIN ratings r ON s.id = r.store_id
    GROUP BY s.id, s.name, s.address
  `;
  db.query(sql, [userId, userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed store matrices fetch.' });
    return res.status(200).json(results);
  });
});

// Admin Dashboard Analytics Indicators
router.get('/admin-dashboard', (req, res) => {
  const queries = {
    usersCount: "SELECT COUNT(*) AS total FROM users",
    storesCount: "SELECT COUNT(*) AS total FROM stores",
    ratingsCount: "SELECT COUNT(*) AS total FROM ratings",
    storesList: `
      SELECT s.name, s.address, IFNULL(AVG(r.rating_value), 0) AS overall_rating, u.email AS owner_email
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id, s.name, s.address, u.email
    `,
    usersList: `
      SELECT u.name, u.email, u.address, u.role, IFNULL(AVG(r.rating_value), 0) AS owner_avg_rating
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY u.id, u.name, u.email, u.address, u.role
    `
  };

  db.query(queries.usersCount, (err, uCount) => {
    db.query(queries.storesCount, (err, sCount) => {
      db.query(queries.ratingsCount, (err, rCount) => {
        db.query(queries.storesList, (err, sList) => {
          db.query(queries.usersList, (err, uList) => {
            if (err) return res.status(500).json({ error: 'Error compounding dashboard records.' });
            return res.status(200).json({
              metrics: {
                totalUsers: uCount[0].total,
                totalStores: sCount[0].total,
                totalRatings: rCount[0].total
              },
              stores: sList,
              users: uList
            });
          });
        });
      });
    });
  });
});


router.post('/admin-add-store', (req, res) => {
  const { name, address, owner_email } = req.body;
  if (!name || !address || !owner_email) return res.status(400).json({ error: 'All fields required.' });

  
  db.query("SELECT id FROM users WHERE email = ? AND role = 'Store Owner'", [owner_email], (err, users) => {
    if (err || users.length === 0) return res.status(400).json({ error: 'Valid matching Store Owner email not found.' });
    
    db.query("INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)", [name, address, users[0].id], (err) => {
      if (err) return res.status(500).json({ error: 'Failed inserting store.' });
      return res.status(201).json({ message: 'Store created successfully!' });
    });
  });
});

// Store Owner Analytic Dashboard View
router.get('/owner-dashboard', (req, res) => {
  const ownerId = req.query.owner_id;
  db.query("SELECT id, name, address FROM stores WHERE owner_id = ? LIMIT 1", [ownerId], (err, storeRes) => {
    if (err) return res.status(500).json({ error: 'Database execution crash.' });
    if (storeRes.length === 0) return res.status(200).json({ hasStore: false });

    const store = storeRes[0];
    const reviewsSql = `
      SELECT r.rating_value, r.review_text, u.name AS user_name, u.address AS user_address
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;
    db.query(reviewsSql, [store.id], (err, reviewRes) => {
      if (err) return res.status(500).json({ error: 'Failed reading metrics log.' });
      let total = 0;
      reviewRes.forEach(r => total += r.rating_value);
      const avg = reviewRes.length > 0 ? (total / reviewRes.length).toFixed(1) : "0.0";
      return res.status(200).json({ hasStore: true, store, averageRating: avg, reviewersList: reviewRes });
    });
  });
});


router.post('/rate', (req, res) => {
  const { user_id, store_id, rating, review_text } = req.body;
  const sql = `
    INSERT INTO ratings (user_id, store_id, rating_value, review_text) VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE rating_value = ?, review_text = ?
  `;
  db.query(sql, [user_id, store_id, rating, review_text, rating, review_text], (err) => {
    if (err) return res.status(500).json({ error: 'Failed transactional query write.' });
    return res.status(201).json({ message: 'Review data submitted!' });
  });
});

module.exports = router;
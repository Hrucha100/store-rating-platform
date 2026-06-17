const express = require('express');
const router = express.Router();
const db = require('./db');

// Registration Helper Validation Functions
const validateFormInput = (name, address, password) => {
  if (!name || name.length < 20 || name.length > 60) {
    return "Name must be between 20 and 60 characters long.";
  }
  if (!address || address.length > 400) {
    return "Address must not exceed 400 characters.";
  }
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
  if (!password || !passwordRegex.test(password)) {
    return "Password must be 8-16 characters and contain at least one uppercase letter and one special character.";
  }
  return null;
};

// Sign Up / Inject User Endpoint (Handles matching store injection automatically)
router.post('/register', (req, res) => {
  const { name, email, password, address, role, storeName, storeAddress } = req.body;
  
  console.log("📥 RECEIVED REGISTRATION PAYLOAD:");
  console.log({ name, email, role, storeName, storeAddress });

  const validationError = validateFormInput(name, address, password);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // 1. Insert User Account Profile Row First
  const userSql = "INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)";
  db.query(userSql, [name, email, password, address, role || 'Normal User'], (err, result) => {
    if (err) {
      console.error("❌ SQL USER TABLE INSERTION FAILED:", err);
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists.' });
      return res.status(500).json({ error: 'Database signup routine failure.' });
    }

    const newUserId = result.insertId;
    console.log(`✅ USER CREATED SUCCESSFULLY WITH ID: ${newUserId}`);

    // 2. Cascade Step: Auto-create store profile if role matches
    if (role === 'Store Owner') {
      console.log("🚀 ROLE CONFIRMED: 'Store Owner'. Attempting auto-store creation...");
      
      if (!storeName || !storeAddress) {
        console.error("⚠️ STORE CREATION ABORTED: Missing storeName or storeAddress values.");
        return res.status(400).json({ error: "Store Name and Store Address fields are mandatory for Store Owners." });
      }

      const storeSql = "INSERT INTO stores (name, address, owner_id) VALUES (?, ?, ?)";
      db.query(storeSql, [storeName, storeAddress, newUserId], (storeErr) => {
        if (storeErr) {
          console.error("❌ CRITICAL: DATABASE REJECTED STORES TABLE INSERTION:", storeErr);
          return res.status(500).json({ 
            error: `User created, but database rejected store configuration: ${storeErr.message}` 
          });
        }
        console.log("🎉 SUCCESS: Store entry mapped and created in database perfectly.");
        return res.status(201).json({ message: 'Store Owner and Store registered together successfully!' });
      });
    } else {
      console.log(`ℹ️ Registration finalized. No store added because role was '${role}'.`);
      return res.status(201).json({ message: 'Registration complete!' });
    }
  });
});

// Login Endpoint
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials.' });

  const sql = "SELECT id, name, email, address, role FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server database lookup failure.' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid email or password parameters.' });
    return res.status(200).json({ user: results[0] });
  });
});

// Password Update Endpoint
router.post('/update-password', (req, res) => {
  const { user_id, newPassword } = req.body;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;
  if (!newPassword || !passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: "Password must be 8-16 characters long." });
  }
  const sql = "UPDATE users SET password = ? WHERE id = ?";
  db.query(sql, [newPassword, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed modification payload execution.' });
    return res.status(200).json({ message: 'Password adjusted successfully!' });
  });
});

module.exports = router;
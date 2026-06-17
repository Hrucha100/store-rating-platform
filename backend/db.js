const mysql = require('mysql2');

// 1. Setup connection configurations
const dbConfig = {
  host: 'localhost',
  user: 'root',          
  password: 'sql123', // 🛠️ Ensure your real local MySQL root password is here
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 2. Create an initial connection to make sure the database exists
const initialPool = mysql.createPool(dbConfig);
initialPool.query("CREATE DATABASE IF NOT EXISTS rating_platform", (err) => {
  if (err) {
    console.error("❌ Failed to automatically verify or create rating_platform:", err);
  } else {
    console.log("🗄️ Database 'rating_platform' verified/created successfully.");
  }
});

// 3. Create and export the final operational pool that uses the database
const pool = mysql.createPool({
  ...dbConfig,
  database: 'rating_platform'
});

module.exports = pool;

//rating_platform
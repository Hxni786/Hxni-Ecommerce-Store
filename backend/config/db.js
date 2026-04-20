/**
 * config/db.js
 *
 * MySQL Database connection pool.
 */

'use strict';

const mysql = require('mysql2/promise');

const isLocal = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST || '127.0.0.1');

const pool = mysql.createPool({
  // Favoring URI if provided (common on Railway/Aiven)
  uri: process.env.DB_URL,
  
  // Standard parameters as fallback
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'hxni_store',
  
  ssl: isLocal ? null : { rejectUnauthorized: false }, // Required for many remote providers
  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection immediately on module load
pool
  .getConnection()
  .then((conn) => {
    console.log(`[db] Connected to MySQL database: ${process.env.DB_NAME || 'hxni_store'}`);
    conn.release();
  })
  .catch((err) => {
    console.error('[db] MySQL connection failed. Error:', err.message);
  });

module.exports = pool;

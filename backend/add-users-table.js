const mysql = require('mysql2/promise');
require('dotenv').config();

async function addUsersTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id            INT           NOT NULL AUTO_INCREMENT,
        email         VARCHAR(255)  NOT NULL UNIQUE,
        password_hash VARCHAR(255)  NOT NULL,
        created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    await connection.execute(query);
    console.log('SUCCESS: Users table created or already exists.');
    await connection.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

addUsersTable();

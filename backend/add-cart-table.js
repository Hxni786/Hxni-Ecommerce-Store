const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCartTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const query = `
      CREATE TABLE IF NOT EXISTS cart_items (
        id          INT       NOT NULL AUTO_INCREMENT,
        user_id     INT       NOT NULL,
        product_id  INT       NOT NULL,
        quantity    INT       NOT NULL DEFAULT 1,
        created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        PRIMARY KEY (id),
        UNIQUE KEY uq_user_product (user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(query);
    console.log('SUCCESS: cart_items table created or already exists.');
    await connection.end();
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

addCartTable();

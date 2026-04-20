/**
 * backend/seed-online.js
 * 
 * USE THIS TO POPULATE YOUR AIVEN DATABASE.
 * Run with: node seed-online.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
  console.log('🚀 Starting Aiven Database Seeding...');

  // Use the connection details from your .env
  const connectionConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    ssl: { rejectUnauthorized: false }, // Essential for Aiven
    multipleStatements: true            // Allows running the whole schema file at once
  };

  if (!connectionConfig.host || !connectionConfig.password) {
    console.error('❌ Error: Missing DB_HOST or DB_PASSWORD in your .env file!');
    process.exit(1);
  }

  const connection = await mysql.createConnection(connectionConfig);

  try {
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // IMPORTANT: Remove 'CREATE DATABASE' and 'USE' lines because Aiven provides the DB name (defaultdb)
    schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS hxni_store;/g, '');
    schemaSql = schemaSql.replace(/USE hxni_store;/g, '');

    console.log(`📡 Connected to ${connectionConfig.host}. Running schema...`);

    // Run the massive SQL script
    await connection.query(schemaSql);

    console.log('✅ Success! Your database is seeded and ready for the world.');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    await connection.end();
  }
}

seed();

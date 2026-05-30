const { Pool } = require('pg');
require('dotenv').config();

// Parse URL and strip unsupported params for pg library
const rawUrl = process.env.DATABASE_URL || '';
let connectionString = rawUrl;

// The pg library doesn't support channel_binding - we strip it
if (connectionString.includes('channel_binding')) {
  const url = new URL(connectionString);
  url.searchParams.delete('channel_binding');
  connectionString = url.toString();
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
    // Neon requires SSL
    require: true,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  console.error('DB Pool error:', err.message);
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id SERIAL PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        telephone VARCHAR(25),
        email VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);
    console.log('✅ Base de données initialisée avec succès');
  } catch (err) {
    console.error('❌ Erreur init DB:', err.message);
    console.error('   Vérifiez la variable DATABASE_URL dans .env');
  }
};

initDB();

module.exports = pool;

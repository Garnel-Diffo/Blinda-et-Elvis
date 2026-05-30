const { Pool } = require('pg');

let pool = null;
let tablesReady = false;

function getPool() {
  if (pool) return pool;
  let cs = process.env.DATABASE_URL || '';
  if (cs.includes('channel_binding')) {
    try { const u = new URL(cs); u.searchParams.delete('channel_binding'); cs = u.toString(); } catch {}
  }
  pool = new Pool({
    connectionString: cs,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 8000,
  });
  pool.on('error', (e) => console.error('Pool error:', e.message));
  return pool;
}

async function query(sql, params) {
  return getPool().query(sql, params);
}

async function ensureTables() {
  if (tablesReady) return;
  const db = getPool();
  await db.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100) NOT NULL,
      prenom VARCHAR(100) NOT NULL,
      telephone VARCHAR(25),
      email VARCHAR(150),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS ticket_config (
      id INTEGER PRIMARY KEY DEFAULT 1,
      template_data TEXT,
      template_mime VARCHAR(30) DEFAULT 'image/jpeg',
      name_rect JSONB,
      font_size INTEGER DEFAULT 32,
      font_color VARCHAR(10) DEFAULT '#000000',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);
  tablesReady = true;
}

module.exports = { getPool, query, ensureTables };

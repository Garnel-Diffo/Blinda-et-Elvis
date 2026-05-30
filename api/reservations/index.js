const { query, ensureTables } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  if (req.method === 'GET') {
    try {
      await ensureTables();
      const { search } = req.query;
      let sql = 'SELECT * FROM reservations';
      let params = [];

      if (search?.trim()) {
        sql += ` WHERE LOWER(nom) LIKE $1 OR LOWER(prenom) LIKE $1
                 OR LOWER(COALESCE(email,'')) LIKE $1
                 OR LOWER(COALESCE(telephone,'')) LIKE $1`;
        params = [`%${search.toLowerCase().trim()}%`];
      }

      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, params);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).end();
  }
};

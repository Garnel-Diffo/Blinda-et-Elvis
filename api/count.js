const { query, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    await ensureTables();
    const result = await query('SELECT COUNT(*) FROM reservations');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

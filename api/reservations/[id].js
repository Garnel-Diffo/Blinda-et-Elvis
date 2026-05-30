const { query } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      const result = await query(
        'DELETE FROM reservations WHERE id = $1 RETURNING id', [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invité non trouvé' });
      }
      res.json({ success: true, id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  } else {
    res.status(405).end();
  }
};

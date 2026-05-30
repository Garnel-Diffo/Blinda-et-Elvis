const { query } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const result = await query(
      'SELECT template_data, template_mime FROM ticket_config WHERE id = 1'
    );

    if (result.rows.length === 0 || !result.rows[0].template_data) {
      return res.status(404).json({ error: 'Aucun template enregistré' });
    }

    const { template_data, template_mime } = result.rows[0];
    const buffer = Buffer.from(template_data, 'base64');

    res.setHeader('Content-Type', template_mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: 'Erreur' });
  }
};

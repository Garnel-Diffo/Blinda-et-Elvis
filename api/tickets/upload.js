const { query, ensureTables } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  try {
    await ensureTables();
    const { base64, mime } = req.body || {};

    if (!base64 || !mime) {
      return res.status(400).json({ error: 'Données manquantes (base64 + mime requis)' });
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
      return res.status(400).json({ error: 'Format non supporté. Utilisez JPG ou PNG.' });
    }

    await query(`
      INSERT INTO ticket_config (id, template_data, template_mime)
      VALUES (1, $1, $2)
      ON CONFLICT (id) DO UPDATE
        SET template_data = $1, template_mime = $2, updated_at = NOW()
    `, [base64, mime]);

    res.json({ success: true, url: '/api/tickets/template' });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
};

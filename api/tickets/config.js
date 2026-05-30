const { query, ensureTables } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  await ensureTables();

  if (req.method === 'GET') {
    try {
      const result = await query('SELECT * FROM ticket_config WHERE id = 1');
      if (result.rows.length === 0) return res.json({});
      const row = result.rows[0];
      res.json({
        hasTemplate: !!row.template_data,
        templateMime: row.template_mime,
        nameRect: row.name_rect,
        fontSize: row.font_size,
        fontColor: row.font_color,
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur' });
    }
  } else if (req.method === 'POST') {
    try {
      const { nameRect, fontSize, fontColor } = req.body || {};
      if (!nameRect) return res.status(400).json({ error: 'Configuration incomplète' });

      await query(`
        INSERT INTO ticket_config (id, name_rect, font_size, font_color)
        VALUES (1, $1, $2, $3)
        ON CONFLICT (id) DO UPDATE
          SET name_rect = $1, font_size = $2, font_color = $3, updated_at = NOW()
      `, [JSON.stringify(nameRect), fontSize || 32, fontColor || '#000000']);

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur sauvegarde' });
    }
  } else {
    res.status(405).end();
  }
};

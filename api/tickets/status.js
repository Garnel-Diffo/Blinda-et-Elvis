const { query, ensureTables } = require('../_db');
const { requireAuth } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    await ensureTables();

    const [cfgRes, guestRes] = await Promise.all([
      query(`
        SELECT
          (template_data IS NOT NULL) AS has_template,
          template_mime,
          length(template_data)       AS template_size,
          (name_rect IS NOT NULL)     AS has_rect,
          name_rect,
          font_size,
          font_color
        FROM ticket_config WHERE id = 1
      `),
      query('SELECT COUNT(*) AS count FROM reservations'),
    ]);

    const cfg = cfgRes.rows[0] || null;
    const guestCount = parseInt(guestRes.rows[0].count, 10);

    res.json({
      dbConfigured: !!cfg,
      hasTemplate: !!(cfg?.has_template),
      templateSize: cfg?.template_size ? parseInt(cfg.template_size, 10) : 0,
      templateMime: cfg?.template_mime || null,
      hasRect: !!(cfg?.has_rect),
      nameRect: cfg?.name_rect || null,
      fontSize: cfg?.font_size || 32,
      fontColor: cfg?.font_color || '#000000',
      guestCount,
      ready: !!(cfg?.has_template && cfg?.has_rect && guestCount > 0),
    });
  } catch (err) {
    console.error('[status]', err.message);
    res.status(500).json({ error: err.message });
  }
};

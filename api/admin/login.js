const { getToken } = require('../_auth');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body || {};
  const adminPassword = process.env.ADMIN_PASSWORD || 'BlindaElvis2026';

  if (password === adminPassword) {
    res.json({ success: true, token: getToken() });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
};

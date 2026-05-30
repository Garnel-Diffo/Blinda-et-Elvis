function getToken() {
  const pw = process.env.ADMIN_PASSWORD || 'BlindaElvis2026';
  return Buffer.from(pw).toString('base64');
}

function requireAuth(req, res) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ') || auth.slice(7) !== getToken()) {
    res.status(401).json({ error: 'Non autorisé' });
    return false;
  }
  return true;
}

module.exports = { getToken, requireAuth };

const { query, ensureTables } = require('./_db');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    await ensureTables();
    const { nom, prenom, telephone, email } = req.body || {};

    if (!nom?.trim() || !prenom?.trim()) {
      return res.status(400).json({ error: 'Nom et prénom sont requis' });
    }

    const result = await query(
      `INSERT INTO reservations (nom, prenom, telephone, email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nom.trim(), prenom.trim(), telephone?.trim() || null, email?.trim().toLowerCase() || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('RSVP error:', err.message);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
  }
};

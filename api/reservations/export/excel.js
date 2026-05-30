const { query } = require('../../_db');
const { requireAuth } = require('../../_auth');
const xlsx = require('xlsx');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const result = await query('SELECT * FROM reservations ORDER BY nom, prenom');

    const data = result.rows.map((r, i) => ({
      'N°': i + 1,
      'Nom': r.nom,
      'Prénom': r.prenom,
      'Téléphone': r.telephone || '',
      'Email': r.email || '',
      'Date d\'inscription': new Date(r.created_at).toLocaleString('fr-FR'),
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 20 },
      { wch: 18 }, { wch: 30 }, { wch: 22 },
    ];
    xlsx.utils.book_append_sheet(wb, ws, 'Invités Mariage');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const now = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="invites-blinda-elvis-${now}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur export' });
  }
};

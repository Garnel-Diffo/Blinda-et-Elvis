const express = require('express');
const router = express.Router();
const pool = require('../db');
const xlsx = require('xlsx');

// GET all reservations (with optional search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM reservations';
    let params = [];

    if (search && search.trim()) {
      query += ` WHERE LOWER(nom) LIKE $1 OR LOWER(prenom) LIKE $1
                 OR LOWER(COALESCE(email, '')) LIKE $1
                 OR LOWER(COALESCE(telephone, '')) LIKE $1`;
      params = [`%${search.toLowerCase().trim()}%`];
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET count
router.get('/count', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM reservations');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST create reservation
router.post('/', async (req, res) => {
  try {
    const { nom, prenom, telephone, email } = req.body;

    if (!nom || !nom.trim() || !prenom || !prenom.trim()) {
      return res.status(400).json({ error: 'Nom et prénom sont requis' });
    }

    const result = await pool.query(
      `INSERT INTO reservations (nom, prenom, telephone, email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        nom.trim(),
        prenom.trim(),
        telephone ? telephone.trim() : null,
        email ? email.trim().toLowerCase() : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
  }
});

// DELETE reservation
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM reservations WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invité non trouvé' });
    }
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET export to Excel
router.get('/export/excel', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reservations ORDER BY nom, prenom'
    );

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

    // Column widths
    ws['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 20 },
      { wch: 18 }, { wch: 30 }, { wch: 22 },
    ];

    xlsx.utils.book_append_sheet(wb, ws, 'Invités Mariage');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const now = new Date().toISOString().slice(0, 10);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invites-blinda-elvis-${now}.xlsx`
    );
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'export' });
  }
});

module.exports = router;

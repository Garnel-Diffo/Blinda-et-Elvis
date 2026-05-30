const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ── Admin Auth Middleware ────────────────────────────────────────────────────
const requireAdmin = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }
  const token = auth.slice(7);
  const adminPassword = process.env.ADMIN_PASSWORD || 'BlindaElvis2026';
  const expected = Buffer.from(adminPassword).toString('base64');
  if (token !== expected) return res.status(401).json({ error: 'Token invalide' });
  next();
};

// ── Public Routes ────────────────────────────────────────────────────────────

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || 'BlindaElvis2026';
  if (password === adminPassword) {
    res.json({ success: true, token: Buffer.from(adminPassword).toString('base64') });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

app.get('/api/admin/verify', requireAdmin, (_req, res) => res.json({ valid: true }));

// Public RSVP submission (no auth)
app.post('/api/rsvp', async (req, res) => {
  const pool = require('./db');
  try {
    const { nom, prenom, telephone, email } = req.body;
    if (!nom?.trim() || !prenom?.trim()) {
      return res.status(400).json({ error: 'Nom et prénom sont requis' });
    }
    const result = await pool.query(
      `INSERT INTO reservations (nom, prenom, telephone, email)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nom.trim(), prenom.trim(), telephone?.trim() || null, email?.trim().toLowerCase() || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement' });
  }
});

// Public guest count
app.get('/api/count', async (_req, res) => {
  const pool = require('./db');
  try {
    const result = await pool.query('SELECT COUNT(*) FROM reservations');
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ── Protected Admin Routes ───────────────────────────────────────────────────
const reservationsRouter = require('./routes/reservations');
const ticketsRouter = require('./routes/tickets');

app.use('/api/reservations', requireAdmin, reservationsRouter);
app.use('/api/tickets', requireAdmin, ticketsRouter);

// ── Production: Serve React build ────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n🌿 ═══════════════════════════════════════`);
  console.log(`   Serveur Blinda & Elvis - Port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Admin password: ${process.env.ADMIN_PASSWORD || 'BlindaElvis2026'}`);
  console.log(`🌿 ═══════════════════════════════════════\n`);
});

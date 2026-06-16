/**
 * Single Vercel Serverless Function — handles all /api/* routes.
 * Counts as 1 function (Hobby plan = max 12).
 */
'use strict';

const express = require('express');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');
const xlsx = require('xlsx');
require('dotenv').config();

const { getPool, ensureTables } = require('./_db');
const { getToken, requireAuth } = require('./_auth');

// ── Express app ───────────────────────────────────────────────────────────
const router = express.Router();

const auth = (req, res, next) => {
  if (!requireAuth(req, res)) return;
  next();
};

// ══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════════

router.post('/admin/login', (req, res) => {
  const { password } = req.body || {};
  const adminPw = process.env.ADMIN_PASSWORD || 'BlindaElvis2026';
  if (password === adminPw) {
    res.json({ success: true, token: getToken() });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

router.get('/admin/verify', auth, (_req, res) => res.json({ valid: true }));

router.post('/rsvp', async (req, res) => {
  try {
    await ensureTables();
    const { nom, prenom, telephone, email } = req.body || {};
    if (!nom?.trim() || !prenom?.trim()) {
      return res.status(400).json({ error: 'Nom et prénom sont requis' });
    }
    const db = getPool();
    const r = await db.query(
      `INSERT INTO reservations (nom, prenom, telephone, email)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [nom.trim(), prenom.trim(), telephone?.trim()||null, email?.trim().toLowerCase()||null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error('[rsvp]', err.message);
    res.status(500).json({ error: "Erreur lors de l'enregistrement" });
  }
});

router.get('/count', async (_req, res) => {
  try {
    await ensureTables();
    const r = await getPool().query('SELECT COUNT(*) FROM reservations');
    res.json({ count: parseInt(r.rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN — RESERVATIONS
//  IMPORTANT: specific routes BEFORE parameterized ones
// ══════════════════════════════════════════════════════════════

router.get('/reservations/export/excel', auth, async (_req, res) => {
  try {
    const db = getPool();
    const result = await db.query('SELECT * FROM reservations ORDER BY nom, prenom');
    const data = result.rows.map((r, i) => ({
      'N°': i + 1, Nom: r.nom, 'Prénom': r.prenom,
      Téléphone: r.telephone || '', Email: r.email || '',
      "Date d'inscription": new Date(r.created_at).toLocaleString('fr-FR'),
    }));
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    ws['!cols'] = [{wch:5},{wch:20},{wch:20},{wch:18},{wch:30},{wch:22}];
    xlsx.utils.book_append_sheet(wb, ws, 'Invités Mariage');
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const now = new Date().toISOString().slice(0,10);
    res.setHeader('Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition',
      `attachment; filename="invites-blinda-elvis-${now}.xlsx"`);
    res.send(buf);
  } catch (err) {
    console.error('[excel]', err.message);
    res.status(500).json({ error: 'Erreur export' });
  }
});

router.get('/reservations', auth, async (req, res) => {
  try {
    await ensureTables();
    const { search } = req.query;
    let sql = 'SELECT * FROM reservations';
    let params = [];
    if (search?.trim()) {
      sql += ` WHERE LOWER(nom) LIKE $1 OR LOWER(prenom) LIKE $1
               OR LOWER(COALESCE(email,'')) LIKE $1
               OR LOWER(COALESCE(telephone,'')) LIKE $1`;
      params = [`%${search.toLowerCase().trim()}%`];
    }
    sql += ' ORDER BY created_at DESC';
    const result = await getPool().query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[reservations]', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/reservations/:id', auth, async (req, res) => {
  try {
    const r = await getPool().query(
      'DELETE FROM reservations WHERE id=$1 RETURNING id', [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Invité non trouvé' });
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('[delete reservation]', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ══════════════════════════════════════════════════════════════
//  ADMIN — TICKETS
//  IMPORTANT: /tickets/generate-all BEFORE /tickets/generate/:id
// ══════════════════════════════════════════════════════════════

router.post('/tickets/upload', auth, async (req, res) => {
  try {
    await ensureTables();
    const { base64, mime } = req.body || {};
    if (!base64 || !mime) return res.status(400).json({ error: 'base64 et mime requis' });
    if (!['image/jpeg','image/jpg','image/png'].includes(mime)) {
      return res.status(400).json({ error: 'Format non supporté (JPG/PNG)' });
    }
    await getPool().query(
      `INSERT INTO ticket_config (id, template_data, template_mime) VALUES (1,$1,$2)
       ON CONFLICT (id) DO UPDATE SET template_data=$1, template_mime=$2, updated_at=NOW()`,
      [base64, mime]
    );
    res.json({ success: true, url: '/api/tickets/template' });
  } catch (err) {
    console.error('[upload]', err.message);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

router.get('/tickets/status', auth, async (_req, res) => {
  try {
    await ensureTables();
    const db = getPool();
    const [cfgR, gR] = await Promise.all([
      db.query(`SELECT (template_data IS NOT NULL) AS has_template, template_mime,
                length(template_data) AS template_size, (name_rect IS NOT NULL) AS has_rect,
                name_rect, font_size, font_color FROM ticket_config WHERE id=1`),
      db.query('SELECT COUNT(*) AS count FROM reservations'),
    ]);
    const cfg = cfgR.rows[0] || null;
    const guestCount = parseInt(gR.rows[0].count, 10);
    res.json({
      dbConfigured: !!cfg,
      hasTemplate: !!(cfg?.has_template),
      templateSize: cfg?.template_size ? parseInt(cfg.template_size,10) : 0,
      templateMime: cfg?.template_mime || null,
      hasRect: !!(cfg?.has_rect),
      nameRect: cfg?.name_rect || null,
      fontSize: cfg?.font_size || 32,
      fontColor: cfg?.font_color || '#000000',
      guestCount,
      ready: !!(cfg?.has_template && cfg?.has_rect && guestCount > 0),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tickets/template', auth, async (_req, res) => {
  try {
    const r = await getPool().query(
      'SELECT template_data, template_mime FROM ticket_config WHERE id=1'
    );
    if (!r.rows.length || !r.rows[0].template_data) {
      return res.status(404).json({ error: 'Template non trouvé' });
    }
    const { template_data, template_mime } = r.rows[0];
    const buf = Buffer.from(String(template_data).replace(/[\s\r\n\t]/g,''), 'base64');
    res.setHeader('Content-Type', template_mime || 'image/jpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(buf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tickets/config', auth, async (_req, res) => {
  try {
    await ensureTables();
    const r = await getPool().query('SELECT * FROM ticket_config WHERE id=1');
    if (!r.rows.length) return res.json({});
    const row = r.rows[0];
    res.json({
      hasTemplate: !!row.template_data,
      templateMime: row.template_mime,
      nameRect: row.name_rect,
      fontSize: row.font_size,
      fontColor: row.font_color,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tickets/config', auth, async (req, res) => {
  try {
    await ensureTables();
    const { nameRect, fontSize, fontColor } = req.body || {};
    if (!nameRect) return res.status(400).json({ error: 'nameRect requis' });
    await getPool().query(
      `INSERT INTO ticket_config (id, name_rect, font_size, font_color) VALUES (1,$1,$2,$3)
       ON CONFLICT (id) DO UPDATE SET name_rect=$1, font_size=$2, font_color=$3, updated_at=NOW()`,
      [JSON.stringify(nameRect), fontSize||32, fontColor||'#000000']
    );
    res.json({ success: true });
  } catch (err) {
    console.error('[tickets config POST]', err.message);
    res.status(500).json({ error: 'Erreur sauvegarde' });
  }
});

// ── PDF helper ─────────────────────────────────────────────────────────────
async function buildPDF(person, config) {
  const nameRect = typeof config.name_rect === 'string'
    ? JSON.parse(config.name_rect) : config.name_rect;
  const fontSize = Number(config.font_size) || 32;
  const fontColor = config.font_color || '#000000';

  if (!config.template_data) {
    const e = new Error('Template non uploadé. Uploadez le billet dans l\'espace admin.');
    e.status = 400; throw e;
  }
  if (!nameRect || typeof nameRect !== 'object') {
    const e = new Error('Zone du nom non définie. Dessinez le cadre et sauvegardez.');
    e.status = 400; throw e;
  }
  const { xPercent, yPercent, widthPercent, heightPercent } = nameRect;
  if ([xPercent,yPercent,widthPercent,heightPercent].some(v => v == null)) {
    const e = new Error('Coordonnées invalides. Redessinez et sauvegardez.');
    e.status = 400; throw e;
  }

  const cleanB64 = String(config.template_data).replace(/[\s\r\n\t]/g,'');
  const imgBytes = Buffer.from(cleanB64, 'base64');
  if (imgBytes.length < 100) {
    const e = new Error('Template corrompu. Uploadez à nouveau.');
    e.status = 400; throw e;
  }

  const pdfDoc = await PDFDocument.create();
  let img;
  try {
    img = config.template_mime === 'image/png'
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes);
  } catch (ex) {
    throw new Error(`Impossible d'intégrer l'image: ${ex.message}`);
  }

  const { width: imgW, height: imgH } = img;
  const page = pdfDoc.addPage([imgW, imgH]);
  page.drawImage(img, { x:0, y:0, width:imgW, height:imgH });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fullName = `${person.prenom} ${person.nom}`;

  const rectX = xPercent * imgW;
  const rectW = widthPercent * imgW;
  const rectH = heightPercent * imgH;
  const rectYtop = yPercent * imgH;

  const fs = Math.max(8, Math.min(fontSize, rectH * 0.9));
  const tw = font.widthOfTextAtSize(fullName, fs);
  const pdfX = Math.max(rectX, Math.min(rectX + (rectW - tw) / 2, imgW - tw - 2));
  const rectCenterPdf = imgH - rectYtop - rectH / 2;
  const pdfY = Math.max(2, Math.min(rectCenterPdf - fs * 0.35, imgH - fs - 2));

  const hex = fontColor.replace('#','').padEnd(6,'0');
  const r = Math.max(0, Math.min(1, parseInt(hex.slice(0,2),16)/255));
  const g = Math.max(0, Math.min(1, parseInt(hex.slice(2,4),16)/255));
  const b = Math.max(0, Math.min(1, parseInt(hex.slice(4,6),16)/255));

  page.drawText(fullName, { x:pdfX, y:pdfY, size:fs, font, color:rgb(r,g,b) });
  return pdfDoc.save();
}

function sanitizeFilename(name) {
  return name.normalize('NFD').replace(/[̀-ͯ]/g,'')
             .replace(/[^a-z0-9-_.]/gi,'-').replace(/-+/g,'-');
}

// GET generate single ticket — MUST be after generate-all
router.get('/tickets/generate-all', auth, async (_req, res) => {
  try {
    const db = getPool();
    const [cfgR, gR] = await Promise.all([
      db.query('SELECT * FROM ticket_config WHERE id=1'),
      db.query('SELECT * FROM reservations ORDER BY nom, prenom'),
    ]);
    if (!cfgR.rows.length) return res.status(400).json({ error: 'Configuration introuvable.' });
    const config = cfgR.rows[0];
    if (!config.template_data) return res.status(400).json({ error: 'Template non uploadé.' });
    if (!config.name_rect) return res.status(400).json({
      error: 'Zone du nom non définie. Dessinez le cadre et sauvegardez la configuration.',
    });
    if (!gR.rows.length) return res.status(400).json({ error: 'Aucun invité.' });

    const zip = new JSZip();
    const folder = zip.folder('billets-blinda-elvis');
    let count = 0;
    const errs = [];

    for (const person of gR.rows) {
      try {
        const pdfBytes = await buildPDF(person, config);
        const fn = sanitizeFilename(`billet-${person.prenom}-${person.nom}.pdf`);
        folder.file(fn, Buffer.from(pdfBytes));
        count++;
      } catch (ex) {
        errs.push(`${person.prenom} ${person.nom}: ${ex.message}`);
      }
    }

    if (count === 0) {
      return res.status(500).json({ error: `Aucun billet généré. ${errs[0]||''}` });
    }

    const zipBuf = await zip.generateAsync({
      type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level:6 },
    });
    const now = new Date().toISOString().slice(0,10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition',
      `attachment; filename="billets-mariage-blinda-elvis-${now}.zip"`);
    res.send(zipBuf);
  } catch (err) {
    console.error('[generate-all]', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

router.get('/tickets/generate/:id', auth, async (req, res) => {
  try {
    const db = getPool();
    const [cfgR, paxR] = await Promise.all([
      db.query('SELECT * FROM ticket_config WHERE id=1'),
      db.query('SELECT * FROM reservations WHERE id=$1', [req.params.id]),
    ]);
    if (!cfgR.rows.length) return res.status(400).json({ error: 'Configuration introuvable.' });
    if (!paxR.rows.length) return res.status(404).json({ error: 'Invité introuvable.' });

    const config = cfgR.rows[0];
    if (!config.template_data) return res.status(400).json({ error: 'Template non uploadé.' });
    if (!config.name_rect) return res.status(400).json({
      error: 'Zone du nom non définie. Dessinez le cadre et sauvegardez.',
    });

    const pdfBytes = await buildPDF(paxR.rows[0], config);
    const p = paxR.rows[0];
    const fn = sanitizeFilename(`billet-${p.prenom}-${p.nom}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fn}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[generate/:id]', err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// ── Mount & export ────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', router);

// Catch-all 404 for unmatched API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Route non trouvée' }));

module.exports = (req, res) => app(req, res);

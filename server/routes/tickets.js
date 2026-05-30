const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');
const pool = require('../db');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const configPath = path.join(uploadsDir, 'ticket-config.json');

const getConfig = () => {
  if (!fs.existsSync(configPath)) return null;
  try { return JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { return null; }
};

// POST upload — accepts base64 JSON (compatible with Vercel functions)
router.post('/upload', (req, res) => {
  try {
    const { base64, mime } = req.body || {};
    if (!base64 || !mime) return res.status(400).json({ error: 'Données manquantes' });

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(mime)) {
      return res.status(400).json({ error: 'Format non supporté (JPG/PNG requis)' });
    }

    const ext = mime.includes('png') ? '.png' : '.jpg';
    const filename = 'ticket-template' + ext;
    const templatePath = path.join(uploadsDir, filename);

    // Remove old templates
    ['.jpg', '.jpeg', '.png'].forEach(e => {
      const old = path.join(uploadsDir, 'ticket-template' + e);
      if (old !== templatePath && fs.existsSync(old)) fs.unlinkSync(old);
    });

    fs.writeFileSync(templatePath, Buffer.from(base64, 'base64'));

    const cfg = getConfig() || {};
    cfg.templateFile = filename;
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

    res.json({ success: true, filename, url: `/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur upload' });
  }
});

// GET config
router.get('/config', (req, res) => {
  const cfg = getConfig();
  if (!cfg) return res.json({});
  const tplPath = cfg.templateFile ? path.join(uploadsDir, cfg.templateFile) : null;
  const hasTemplate = !!(tplPath && fs.existsSync(tplPath));
  res.json({ ...cfg, hasTemplate });
});

// POST save config
router.post('/config', (req, res) => {
  const { nameRect, fontSize, fontColor } = req.body || {};
  if (!nameRect) return res.status(400).json({ error: 'Configuration incomplète' });
  const cfg = { ...(getConfig() || {}), nameRect, fontSize: fontSize || 32, fontColor: fontColor || '#000000' };
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
  res.json({ success: true });
});

// GET template image (authenticated, served from filesystem)
router.get('/template', (req, res) => {
  const cfg = getConfig();
  if (!cfg?.templateFile) return res.status(404).json({ error: 'Template non trouvé' });
  const tplPath = path.join(uploadsDir, cfg.templateFile);
  if (!fs.existsSync(tplPath)) return res.status(404).json({ error: 'Template non trouvé' });
  res.sendFile(path.resolve(tplPath));
});

// GET generate one ticket
router.get('/generate/:id', async (req, res) => {
  try {
    const cfg = getConfig();
    if (!cfg?.nameRect || !cfg?.templateFile) {
      return res.status(400).json({ error: 'Configuration manquante' });
    }
    const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Invité non trouvé' });

    const tplPath = path.join(uploadsDir, cfg.templateFile);
    if (!fs.existsSync(tplPath)) return res.status(400).json({ error: 'Template introuvable' });

    const pdfBytes = await buildPDFFromFile(result.rows[0], cfg, tplPath);
    const person = result.rows[0];
    const fn = `billet-${person.prenom}-${person.nom}.pdf`.replace(/[^a-z0-9-_.]/gi, '-');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fn}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET generate all tickets as ZIP
router.get('/generate-all', async (req, res) => {
  try {
    const cfg = getConfig();
    if (!cfg?.nameRect || !cfg?.templateFile) {
      return res.status(400).json({ error: 'Configuration manquante' });
    }

    const tplPath = path.join(uploadsDir, cfg.templateFile);
    if (!fs.existsSync(tplPath)) return res.status(400).json({ error: 'Template introuvable' });

    const result = await pool.query('SELECT * FROM reservations ORDER BY nom, prenom');
    if (!result.rows.length) return res.status(400).json({ error: 'Aucun invité' });

    const zip = new JSZip();
    const folder = zip.folder('billets-blinda-elvis');

    for (const person of result.rows) {
      try {
        const pdfBytes = await buildPDFFromFile(person, cfg, tplPath);
        const fn = `billet-${person.prenom}-${person.nom}.pdf`.replace(/[^a-z0-9-_.]/gi, '-');
        folder.file(fn, pdfBytes);
      } catch (e) { console.warn(`Skip ${person.prenom}: ${e.message}`); }
    }

    const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const now = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="billets-mariage-blinda-elvis-${now}.zip"`);
    res.send(zipBuf);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

async function buildPDFFromFile(person, cfg, tplPath) {
  const { nameRect, fontSize = 32, fontColor = '#000000', templateFile } = cfg;
  const imgBytes = fs.readFileSync(tplPath);
  const pdfDoc = await PDFDocument.create();
  const ext = path.extname(tplPath).toLowerCase();
  const img = ext === '.png' ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
  const { width: imgW, height: imgH } = img;
  const page = pdfDoc.addPage([imgW, imgH]);
  page.drawImage(img, { x: 0, y: 0, width: imgW, height: imgH });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fullName = `${person.prenom} ${person.nom}`;
  const rectX = nameRect.xPercent * imgW;
  const rectW = nameRect.widthPercent * imgW;
  const rectH = nameRect.heightPercent * imgH;
  const rectYtop = nameRect.yPercent * imgH;
  const fs2 = Math.min(fontSize, rectH * 0.6);
  const tw = font.widthOfTextAtSize(fullName, fs2);
  const pdfX = Math.max(rectX, rectX + (rectW - tw) / 2);
  const pdfY = imgH - rectYtop - rectH / 2 - fs2 / 3;

  const hex = fontColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  page.drawText(fullName, { x: pdfX, y: pdfY, size: fs2, font, color: rgb(r, g, b) });
  return pdfDoc.save();
}

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');
const pool = require('../db');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'ticket-template' + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Format non supporté. Utilisez JPG ou PNG.'));
  },
});

const configPath = path.join(uploadsDir, 'ticket-config.json');

const getConfig = () => {
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
};

// POST upload template
router.post('/upload', upload.single('template'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier reçu' });
  }

  // Remove old template files (different ext)
  const exts = ['.jpg', '.jpeg', '.png'];
  exts.forEach((ext) => {
    const old = path.join(uploadsDir, 'ticket-template' + ext);
    if (old !== req.file.path && fs.existsSync(old)) fs.unlinkSync(old);
  });

  // Update config with new template file
  const existingConfig = getConfig() || {};
  existingConfig.templateFile = req.file.filename;
  fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));

  res.json({
    success: true,
    filename: req.file.filename,
    url: `/uploads/${req.file.filename}`,
  });
});

// GET config
router.get('/config', (req, res) => {
  const config = getConfig();
  res.json(config || {});
});

// POST save config (rectangle + style)
router.post('/config', (req, res) => {
  const { nameRect, fontSize, fontColor, fontWeight, textAlign, templateFile } = req.body;

  if (!nameRect) {
    return res.status(400).json({ error: 'Configuration incomplète' });
  }

  const config = {
    templateFile: templateFile || (getConfig() || {}).templateFile,
    nameRect,
    fontSize: fontSize || 32,
    fontColor: fontColor || '#000000',
    fontWeight: fontWeight || 'bold',
    textAlign: textAlign || 'center',
  };

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  res.json({ success: true });
});

// GET generate ticket for one person
router.get('/generate/:id', async (req, res) => {
  try {
    const config = getConfig();
    if (!config || !config.templateFile || !config.nameRect) {
      return res.status(400).json({ error: 'Template ou configuration manquant' });
    }

    const result = await pool.query(
      'SELECT * FROM reservations WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invité non trouvé' });
    }

    const person = result.rows[0];
    const pdfBytes = await generateTicketPDF(person, config);

    const filename = `billet-${person.prenom}-${person.nom}.pdf`
      .replace(/[^a-z0-9-_.]/gi, '-');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Erreur génération ticket:', err);
    res.status(500).json({ error: err.message || 'Erreur de génération' });
  }
});

// GET preview ticket (inline display)
router.get('/preview/:id', async (req, res) => {
  try {
    const config = getConfig();
    if (!config || !config.templateFile || !config.nameRect) {
      return res.status(400).json({ error: 'Configuration manquante' });
    }

    const result = await pool.query(
      'SELECT * FROM reservations WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invité non trouvé' });
    }

    const person = result.rows[0];
    const pdfBytes = await generateTicketPDF(person, config);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET generate all tickets as ZIP
router.get('/generate-all', async (req, res) => {
  try {
    const config = getConfig();
    if (!config || !config.templateFile || !config.nameRect) {
      return res.status(400).json({ error: 'Template ou configuration manquant' });
    }

    const result = await pool.query(
      'SELECT * FROM reservations ORDER BY nom, prenom'
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Aucun invité dans la base de données' });
    }

    const zip = new JSZip();
    const folder = zip.folder('billets-blinda-elvis');

    for (const person of result.rows) {
      try {
        const pdfBytes = await generateTicketPDF(person, config);
        const filename = `billet-${person.prenom}-${person.nom}.pdf`
          .replace(/[^a-z0-9-_.]/gi, '-');
        folder.file(filename, pdfBytes);
      } catch (err) {
        console.error(`Erreur pour ${person.prenom} ${person.nom}:`, err.message);
      }
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const now = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="billets-mariage-blinda-elvis-${now}.zip"`
    );
    res.send(zipBuffer);
  } catch (err) {
    console.error('Erreur génération ZIP:', err);
    res.status(500).json({ error: err.message || 'Erreur de génération' });
  }
});

async function generateTicketPDF(person, config) {
  const { nameRect, fontSize = 32, fontColor = '#000000', templateFile } = config;

  const templatePath = path.join(uploadsDir, templateFile);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template introuvable: ${templateFile}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.create();

  const ext = path.extname(templatePath).toLowerCase();
  let templateImage;
  if (ext === '.png') {
    templateImage = await pdfDoc.embedPng(templateBytes);
  } else {
    templateImage = await pdfDoc.embedJpg(templateBytes);
  }

  const { width: imgW, height: imgH } = templateImage;
  const page = pdfDoc.addPage([imgW, imgH]);

  page.drawImage(templateImage, { x: 0, y: 0, width: imgW, height: imgH });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fullName = `${person.prenom} ${person.nom}`;

  // nameRect is stored as percentages (0-1) from top-left
  const rectX = nameRect.xPercent * imgW;
  const rectY_top = nameRect.yPercent * imgH;
  const rectW = nameRect.widthPercent * imgW;
  const rectH = nameRect.heightPercent * imgH;

  // Scale font size relative to rect height
  const scaledFontSize = Math.min(
    fontSize,
    rectH * 0.6
  );

  const textWidth = font.widthOfTextAtSize(fullName, scaledFontSize);

  // Center text in rectangle (PDF Y is from bottom)
  const centerX = rectX + (rectW - textWidth) / 2;
  const pdfY = imgH - rectY_top - rectH / 2 - scaledFontSize / 3;

  // Parse hex color
  const hex = fontColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  page.drawText(fullName, {
    x: Math.max(rectX, centerX),
    y: pdfY,
    size: scaledFontSize,
    font,
    color: rgb(r, g, b),
  });

  return await pdfDoc.save();
}

module.exports = router;

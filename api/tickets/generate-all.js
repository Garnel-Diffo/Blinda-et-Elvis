const { query } = require('../_db');
const { requireAuth } = require('../_auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');

async function buildPDF(person, config) {
  const { template_data, template_mime, name_rect: nameRect, font_size: fontSize, font_color: fontColor } = config;
  if (!template_data || !nameRect) throw new Error('Configuration incomplète');

  const imgBytes = Buffer.from(template_data, 'base64');
  const pdfDoc = await PDFDocument.create();

  const img = template_mime === 'image/png'
    ? await pdfDoc.embedPng(imgBytes)
    : await pdfDoc.embedJpg(imgBytes);

  const { width: imgW, height: imgH } = img;
  const page = pdfDoc.addPage([imgW, imgH]);
  page.drawImage(img, { x: 0, y: 0, width: imgW, height: imgH });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fullName = `${person.prenom} ${person.nom}`;

  const rectX = nameRect.xPercent * imgW;
  const rectW = nameRect.widthPercent * imgW;
  const rectH = nameRect.heightPercent * imgH;
  const rectYtop = nameRect.yPercent * imgH;

  const fs = Math.min(fontSize || 32, rectH * 0.6);
  const tw = font.widthOfTextAtSize(fullName, fs);
  const pdfY = imgH - rectYtop - rectH / 2 - fs / 3;
  const pdfX = Math.max(rectX, rectX + (rectW - tw) / 2);

  const hex = (fontColor || '#000000').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  page.drawText(fullName, { x: pdfX, y: pdfY, size: fs, font, color: rgb(r, g, b) });
  return pdfDoc.save();
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const [cfgRes, guestsRes] = await Promise.all([
      query('SELECT * FROM ticket_config WHERE id = 1'),
      query('SELECT * FROM reservations ORDER BY nom, prenom'),
    ]);

    if (!cfgRes.rows.length || !cfgRes.rows[0].template_data) {
      return res.status(400).json({ error: 'Template non configuré' });
    }
    if (!guestsRes.rows.length) {
      return res.status(400).json({ error: 'Aucun invité dans la base de données' });
    }

    const config = cfgRes.rows[0];
    const zip = new JSZip();
    const folder = zip.folder('billets-blinda-elvis');

    for (const person of guestsRes.rows) {
      try {
        const pdfBytes = await buildPDF(person, config);
        const fn = `billet-${person.prenom}-${person.nom}.pdf`.replace(/[^a-z0-9-_.]/gi, '-');
        folder.file(fn, pdfBytes);
      } catch (e) {
        console.warn(`Skip ${person.prenom} ${person.nom}: ${e.message}`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const now = new Date().toISOString().slice(0, 10);

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="billets-mariage-blinda-elvis-${now}.zip"`);
    res.send(zipBuffer);
  } catch (err) {
    console.error('Generate-all error:', err.message);
    res.status(500).json({ error: err.message || 'Erreur de génération' });
  }
};

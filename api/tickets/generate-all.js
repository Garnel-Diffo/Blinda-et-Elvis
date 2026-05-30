const { query } = require('../_db');
const { requireAuth } = require('../_auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const JSZip = require('jszip');

async function buildPDF(person, config) {
  const nameRect = config.name_rect;
  const templateData = config.template_data;
  const templateMime = config.template_mime || 'image/jpeg';
  const fontSize = Number(config.font_size) || 32;
  const fontColor = config.font_color || '#000000';

  if (!templateData) throw new Error('template_data manquant');
  if (!nameRect || typeof nameRect !== 'object') throw new Error('name_rect manquant');

  const { xPercent, yPercent, widthPercent, heightPercent } = nameRect;
  if (xPercent == null || yPercent == null || widthPercent == null || heightPercent == null) {
    throw new Error('Coordonnées invalides');
  }

  const cleanB64 = String(templateData).replace(/[\s\r\n\t]/g, '');
  const imgBytes = Buffer.from(cleanB64, 'base64');
  if (imgBytes.length < 100) throw new Error('Template corrompu');

  const pdfDoc = await PDFDocument.create();

  let img;
  try {
    img = (templateMime === 'image/png')
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes);
  } catch (e) {
    throw new Error(`Embed image: ${e.message}`);
  }

  const { width: imgW, height: imgH } = img;
  const page = pdfDoc.addPage([imgW, imgH]);
  page.drawImage(img, { x: 0, y: 0, width: imgW, height: imgH });

  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fullName = `${person.prenom} ${person.nom}`;

  const rectX = xPercent * imgW;
  const rectW = widthPercent * imgW;
  const rectH = heightPercent * imgH;
  const rectYtop = yPercent * imgH;

  const fs = Math.max(8, Math.min(fontSize, rectH * 0.65));
  const tw = font.widthOfTextAtSize(fullName, fs);
  const pdfX = Math.max(rectX, rectX + (rectW - tw) / 2);
  const pdfY = Math.max(2, Math.min(
    imgH - rectYtop - rectH / 2 - fs / 3,
    imgH - fs - 2
  ));

  const hex = fontColor.replace('#', '').padEnd(6, '0');
  const r = Math.max(0, Math.min(1, parseInt(hex.slice(0, 2), 16) / 255));
  const g = Math.max(0, Math.min(1, parseInt(hex.slice(2, 4), 16) / 255));
  const b = Math.max(0, Math.min(1, parseInt(hex.slice(4, 6), 16) / 255));

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

    // Valider la configuration avant de commencer
    if (!cfgRes.rows.length || !cfgRes.rows[0].template_data) {
      return res.status(400).json({
        error: 'Aucun template configuré. Uploadez un template et sauvegardez la configuration dans l\'admin en ligne.',
      });
    }

    const config = cfgRes.rows[0];

    if (!config.name_rect) {
      return res.status(400).json({
        error: 'Zone de nom non définie. Dessinez le cadre sur le template et sauvegardez la configuration.',
      });
    }

    if (!guestsRes.rows.length) {
      return res.status(400).json({ error: 'Aucun invité dans la base de données.' });
    }

    const zip = new JSZip();
    const folder = zip.folder('billets-blinda-elvis');
    const errors = [];
    let count = 0;

    for (const person of guestsRes.rows) {
      try {
        const pdfBytes = await buildPDF(person, config);
        const fn = `billet-${person.prenom}-${person.nom}.pdf`
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9-_.]/gi, '-')
          .replace(/-+/g, '-');
        folder.file(fn, Buffer.from(pdfBytes));
        count++;
      } catch (e) {
        console.error(`[generate-all] Skip ${person.prenom} ${person.nom}: ${e.message}`);
        errors.push(`${person.prenom} ${person.nom}: ${e.message}`);
      }
    }

    if (count === 0) {
      return res.status(500).json({
        error: `Aucun billet généré. Erreurs: ${errors.slice(0, 3).join(' | ')}`,
      });
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const now = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="billets-mariage-blinda-elvis-${now}.zip"`);
    res.send(zipBuffer);
  } catch (err) {
    console.error('[generate-all] Fatal error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Erreur de génération' });
    }
  }
};

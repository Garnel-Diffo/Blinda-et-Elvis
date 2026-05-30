const { query } = require('../../_db');
const { requireAuth } = require('../../_auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function buildPDF(person, config) {
  const { template_data, template_mime, name_rect: nameRect, font_size: fontSize, font_color: fontColor } = config;
  if (!template_data || !nameRect) throw new Error('Configuration de billet incomplète');

  const imgBytes = Buffer.from(template_data, 'base64');
  const pdfDoc = await PDFDocument.create();

  const templateImage = template_mime === 'image/png'
    ? await pdfDoc.embedPng(imgBytes)
    : await pdfDoc.embedJpg(imgBytes);

  const { width: imgW, height: imgH } = templateImage;
  const page = pdfDoc.addPage([imgW, imgH]);
  page.drawImage(templateImage, { x: 0, y: 0, width: imgW, height: imgH });

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
    const { id } = req.query;
    const [cfgRes, paxRes] = await Promise.all([
      query('SELECT * FROM ticket_config WHERE id = 1'),
      query('SELECT * FROM reservations WHERE id = $1', [id]),
    ]);

    if (!cfgRes.rows.length) return res.status(400).json({ error: 'Configuration manquante' });
    if (!paxRes.rows.length) return res.status(404).json({ error: 'Invité non trouvé' });

    const pdfBytes = await buildPDF(paxRes.rows[0], cfgRes.rows[0]);
    const person = paxRes.rows[0];
    const filename = `billet-${person.prenom}-${person.nom}.pdf`.replace(/[^a-z0-9-_.]/gi, '-');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('Generate PDF error:', err.message);
    res.status(500).json({ error: err.message || 'Erreur de génération' });
  }
};

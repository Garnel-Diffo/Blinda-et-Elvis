const { query } = require('../../_db');
const { requireAuth } = require('../../_auth');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function buildPDF(person, config) {
  const nameRect = config.name_rect;
  const templateData = config.template_data;
  const templateMime = config.template_mime || 'image/jpeg';
  const fontSize = Number(config.font_size) || 32;
  const fontColor = config.font_color || '#000000';

  if (!templateData) {
    throw new Error('Aucun template trouvé. Uploadez un template via le panneau admin en ligne.');
  }
  if (!nameRect || typeof nameRect !== 'object') {
    throw new Error('Zone du nom non configurée. Dessinez le cadre sur le template puis sauvegardez.');
  }

  const { xPercent, yPercent, widthPercent, heightPercent } = nameRect;
  if (xPercent == null || yPercent == null || widthPercent == null || heightPercent == null) {
    throw new Error('Coordonnées de zone invalides. Redessinez et sauvegardez le cadre.');
  }

  // Nettoyer la base64 (PostgreSQL peut y ajouter des espaces/retours)
  const cleanB64 = String(templateData).replace(/[\s\r\n\t]/g, '');
  const imgBytes = Buffer.from(cleanB64, 'base64');

  if (imgBytes.length < 100) {
    throw new Error('Données du template corrompues. Uploadez à nouveau le template.');
  }

  const pdfDoc = await PDFDocument.create();

  let img;
  try {
    img = (templateMime === 'image/png')
      ? await pdfDoc.embedPng(imgBytes)
      : await pdfDoc.embedJpg(imgBytes);
  } catch (e) {
    throw new Error(`Impossible d'intégrer l'image: ${e.message}`);
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

  // Adapter la taille de police à la hauteur du cadre
  const fs = Math.max(8, Math.min(fontSize, rectH * 0.65));
  const tw = font.widthOfTextAtSize(fullName, fs);

  // Centrer horizontalement dans le cadre
  const pdfX = Math.max(rectX, rectX + (rectW - tw) / 2);
  // Position Y en coordonnées PDF (origine bas-gauche)
  const pdfY = Math.max(2, Math.min(
    imgH - rectYtop - rectH / 2 - fs / 3,
    imgH - fs - 2
  ));

  // Parser la couleur hex
  const hex = fontColor.replace('#', '').padEnd(6, '0');
  const r = Math.max(0, Math.min(1, parseInt(hex.slice(0, 2), 16) / 255));
  const g = Math.max(0, Math.min(1, parseInt(hex.slice(2, 4), 16) / 255));
  const b = Math.max(0, Math.min(1, parseInt(hex.slice(4, 6), 16) / 255));

  page.drawText(fullName, {
    x: pdfX,
    y: pdfY,
    size: fs,
    font,
    color: rgb(r, g, b),
  });

  return pdfDoc.save();
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!requireAuth(req, res)) return;
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID manquant' });

    const [cfgRes, paxRes] = await Promise.all([
      query('SELECT * FROM ticket_config WHERE id = 1'),
      query('SELECT * FROM reservations WHERE id = $1', [id]),
    ]);

    if (!cfgRes.rows.length) {
      return res.status(400).json({ error: 'Configuration de billet non trouvée. Configurez le template dans l\'admin.' });
    }
    if (!paxRes.rows.length) {
      return res.status(404).json({ error: 'Invité introuvable' });
    }

    const config = cfgRes.rows[0];
    const person = paxRes.rows[0];

    const pdfBytes = await buildPDF(person, config);

    const filename = `billet-${person.prenom}-${person.nom}.pdf`
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove accents
      .replace(/[^a-z0-9-_.]/gi, '-')
      .replace(/-+/g, '-');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error('[generate/:id] Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Erreur de génération du billet' });
    }
  }
};

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, RefreshCw, CheckCircle, Sliders, Image,
  Users, Info, Trash2, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import {
  uploadTemplate, getTicketConfig, getTicketTemplate, saveTicketConfig,
  generateTicket, generateAllTickets, getReservations, extractError,
} from '../../utils/api';

const FONT_COLORS = [
  { value: '#000000', label: 'Noir' },
  { value: '#FFFFFF', label: 'Blanc' },
  { value: '#F59E0B', label: 'Or' },
  { value: '#0EA5E9', label: 'Bleu ciel' },
  { value: '#1E1B4B', label: 'Marine' },
  { value: '#8B4513', label: 'Marron' },
];

// Convert File → base64 string (without data: prefix)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });
}

export default function TicketGenerator() {
  const [template, setTemplate] = useState(null);   // blob URL for display
  const [rect, setRect] = useState(null);            // { xPercent, yPercent, widthPercent, heightPercent }
  const [drawing, setDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [currentPos, setCurrentPos] = useState(null);
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState('#000000');
  const [guests, setGuests] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingId, setGeneratingId] = useState(null);
  const [configSaved, setConfigSaved] = useState(false);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { loadConfig(); loadGuests(); }, []);

  // Cleanup blob URLs
  useEffect(() => () => { if (template?.startsWith('blob:')) URL.revokeObjectURL(template); }, [template]);

  const loadConfig = async () => {
    try {
      const { data } = await getTicketConfig();
      if (data.hasTemplate) {
        // Charger le template via API authentifiée → blob URL
        try {
          const resp = await getTicketTemplate();
          const blobUrl = URL.createObjectURL(resp.data);
          setTemplate(blobUrl);
        } catch {}
      }
      if (data.nameRect) setRect(data.nameRect);
      if (data.fontSize) setFontSize(data.fontSize);
      if (data.fontColor) setFontColor(data.fontColor);
    } catch {}
  };

  const loadGuests = async () => {
    setLoadingGuests(true);
    try {
      const { data } = await getReservations();
      setGuests(data);
    } catch { toast.error('Impossible de charger les invités'); }
    finally { setLoadingGuests(false); }
  };

  // ── Upload via base64 ─────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG ou PNG.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10 Mo)');
      return;
    }

    setUploading(true);
    try {
      // Créer une URL locale immédiatement pour l'aperçu
      const localUrl = URL.createObjectURL(file);
      setTemplate(localUrl);
      setRect(null);

      const base64 = await fileToBase64(file);
      await uploadTemplate({ base64, mime: file.type });
      toast.success('Template uploadé avec succès !');
    } catch (err) {
      toast.error(extractError(err, 'Erreur lors de l\'upload'));
      setTemplate(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Canvas drawing ────────────────────────────────────────────────────
  const getRelPos = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const b = el.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (cx - b.left) / b.width)),
      y: Math.max(0, Math.min(1, (cy - b.top) / b.height)),
    };
  }, []);

  const onDown = useCallback((e) => {
    if (!template) return;
    e.preventDefault();
    const pos = getRelPos(e);
    setStartPos(pos); setCurrentPos(pos); setDrawing(true); setRect(null);
  }, [template, getRelPos]);

  const onMove = useCallback((e) => {
    if (!drawing || !startPos) return;
    e.preventDefault();
    setCurrentPos(getRelPos(e));
  }, [drawing, startPos, getRelPos]);

  const onUp = useCallback((e) => {
    if (!drawing || !startPos) return;
    e.preventDefault();
    const pos = getRelPos(e);
    const minX = Math.min(startPos.x, pos.x);
    const minY = Math.min(startPos.y, pos.y);
    const w = Math.abs(pos.x - startPos.x);
    const h = Math.abs(pos.y - startPos.y);
    if (w > 0.02 && h > 0.01) {
      setRect({ xPercent: minX, yPercent: minY, widthPercent: w, heightPercent: h });
    }
    setDrawing(false); setStartPos(null); setCurrentPos(null);
  }, [drawing, startPos, getRelPos]);

  const displayRect = drawing && startPos && currentPos ? {
    xPercent: Math.min(startPos.x, currentPos.x),
    yPercent: Math.min(startPos.y, currentPos.y),
    widthPercent: Math.abs(currentPos.x - startPos.x),
    heightPercent: Math.abs(currentPos.y - startPos.y),
  } : rect;

  // ── Save config ────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    if (!rect) { toast.error('Dessinez d\'abord le cadre sur le template'); return; }
    setSaving(true);
    try {
      await saveTicketConfig({ nameRect: rect, fontSize, fontColor });
      setConfigSaved(true);
      toast.success('Configuration sauvegardée !');
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err) {
      toast.error(extractError(err, 'Erreur lors de la sauvegarde'));
    } finally { setSaving(false); }
  };

  // Parse une erreur dont le body est un Blob (réponse 500 en responseType:'blob')
  const parseBlobError = async (err, fallback) => {
    const blobData = err?.response?.data;
    if (blobData instanceof Blob) {
      try {
        const text = await blobData.text();
        const json = JSON.parse(text);
        const raw = json?.error;
        return typeof raw === 'string' ? raw : (raw?.message || fallback);
      } catch { return fallback; }
    }
    return extractError(err, fallback);
  };

  const handleGenerateOne = async (guest) => {
    setGeneratingId(guest.id);
    try {
      const response = await generateTicket(guest.id);
      const ct = response.headers?.['content-type'] || '';
      if (ct.includes('application/pdf')) {
        saveAs(response.data, `billet-${guest.prenom}-${guest.nom}.pdf`);
        toast.success(`Billet généré pour ${guest.prenom} ${guest.nom}`);
      } else {
        // La réponse est un JSON d'erreur enveloppé en Blob
        let msg = 'Erreur de génération';
        try { const t = await response.data.text(); msg = JSON.parse(t).error || msg; } catch {}
        toast.error(msg);
      }
    } catch (err) {
      toast.error(await parseBlobError(err, 'Erreur de génération'));
    } finally { setGeneratingId(null); }
  };

  const handleGenerateAll = async () => {
    if (!guests.length) { toast.error('Aucun invité dans la base de données'); return; }
    setGeneratingAll(true);
    try {
      const response = await generateAllTickets();
      const ct = response.headers?.['content-type'] || '';
      if (ct.includes('application/zip')) {
        const now = new Date().toISOString().slice(0, 10);
        saveAs(response.data, `billets-mariage-blinda-elvis-${now}.zip`);
        toast.success(`${guests.length} billet(s) générés et téléchargés !`);
      } else {
        let msg = 'Erreur lors de la génération';
        try { const t = await response.data.text(); msg = JSON.parse(t).error || msg; } catch {}
        toast.error(msg);
      }
    } catch (err) {
      toast.error(await parseBlobError(err, 'Erreur lors de la génération'));
    } finally { setGeneratingAll(false); }
  };

  const hasConfig = template && rect;

  return (
    <div className="space-y-6">
      {/* Étape 1 — Upload */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-sky-wed/20 flex items-center justify-center">
            <span className="font-body font-bold text-sky-wed-dark text-sm">1</span>
          </div>
          <h2 className="font-heading text-xl text-wed-dark">Upload du Template</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div
              className={`flex-1 border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                uploading ? 'border-sky-wed bg-sky-wed/5' : 'border-gray-200 hover:border-gold-wed hover:bg-gold-wed/3'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw size={32} className="animate-spin text-sky-wed" />
                  <p className="font-body text-sky-wed text-sm">Upload en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gold-wed/10 flex items-center justify-center">
                    <Image size={28} className="text-gold-wed" />
                  </div>
                  <div>
                    <p className="font-body text-wed-text font-medium text-sm">
                      {template ? 'Changer le template' : 'Cliquez pour uploader'}
                    </p>
                    <p className="font-body text-wed-text/40 text-xs mt-0.5">JPG, PNG · Max 10 Mo</p>
                  </div>
                </div>
              )}
            </div>
            {template && (
              <div className="sm:w-48 rounded-xl overflow-hidden border border-gold-wed/30 shadow-sm flex-shrink-0">
                <img src={template} alt="Template" className="w-full h-32 object-cover" />
                <div className="p-2 bg-gold-wed/5 text-center">
                  <p className="font-body text-xs text-gold-wed-dark">Template chargé ✓</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Étape 2 — Placement du nom */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-wed/20 flex items-center justify-center">
              <span className="font-body font-bold text-gold-wed-dark text-sm">2</span>
            </div>
            <h2 className="font-heading text-xl text-wed-dark">Placement du Nom</h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-wed-text/50 font-body">
            <Info size={13} />
            Cliquez-glissez pour définir la zone
          </div>
        </div>
        <div className="p-6">
          {!template ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Image size={40} className="text-gray-300 mb-3" />
              <p className="font-body text-gray-400 text-sm">Uploadez un template d'abord</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                ref={containerRef}
                className="relative select-none rounded-2xl overflow-hidden border-2 border-dashed border-gold-wed/40 cursor-crosshair shadow-lg"
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
              >
                <img src={template} alt="Template" className="w-full h-auto block pointer-events-none" draggable={false} />
                {displayRect && (
                  <div
                    className="absolute border-2 border-gold-wed pointer-events-none"
                    style={{
                      left: `${displayRect.xPercent * 100}%`,
                      top: `${displayRect.yPercent * 100}%`,
                      width: `${displayRect.widthPercent * 100}%`,
                      height: `${displayRect.heightPercent * 100}%`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-body font-bold text-center px-1 truncate"
                        style={{
                          color: fontColor,
                          fontSize: `clamp(10px, ${displayRect.heightPercent * 50}vw, 28px)`,
                          textShadow: fontColor === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                        }}
                      >
                        Prénom NOM
                      </span>
                    </div>
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(p => (
                      <div key={p} className={`absolute w-3 h-3 bg-gold-wed rounded-full -translate-x-1/2 -translate-y-1/2 ${p}`} />
                    ))}
                  </div>
                )}
                {!displayRect && !drawing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-wed-dark/10">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 text-center shadow-lg">
                      <p className="font-body text-wed-text text-sm font-medium">
                        🖱️ Cliquez et faites glisser pour définir la zone du nom
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {rect && (
                <motion.div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="font-body text-emerald-700 text-sm">Zone : {(rect.widthPercent * 100).toFixed(0)}% × {(rect.heightPercent * 100).toFixed(0)}% de l'image</p>
                  <button onClick={() => setRect(null)} className="ml-auto text-emerald-400 hover:text-emerald-600"><Trash2 size={14} /></button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Étape 3 — Style du texte */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-sage/30 flex items-center justify-center">
            <span className="font-body font-bold text-green-700 text-sm">3</span>
          </div>
          <h2 className="font-heading text-xl text-wed-dark">Style du Texte</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block font-body text-sm text-wed-text/80 font-medium">
              Taille: <span className="text-gold-wed font-bold">{fontSize}px</span>
            </label>
            <input type="range" min="12" max="72" value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gold-wed/20 rounded-full appearance-none cursor-pointer accent-gold-wed" />
            <div className="flex justify-between text-xs text-gray-400 font-body"><span>12px</span><span>72px</span></div>
          </div>
          <div className="space-y-3">
            <label className="block font-body text-sm text-wed-text/80 font-medium">Couleur du texte</label>
            <div className="flex flex-wrap gap-2">
              {FONT_COLORS.map(c => (
                <button key={c.value} onClick={() => setFontColor(c.value)} title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${fontColor === c.value ? 'border-gold-wed scale-125 shadow-md' : 'border-gray-200 hover:scale-110'}`}
                  style={{ backgroundColor: c.value }} />
              ))}
              <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)}
                className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer p-0.5" title="Couleur personnalisée" />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6">
          <motion.button onClick={handleSaveConfig} disabled={saving || !rect}
            className="flex items-center gap-2 px-6 py-3 bg-gold-wed hover:bg-gold-wed-dark text-white rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={saving || !rect ? {} : { scale: 1.02 }} whileTap={saving || !rect ? {} : { scale: 0.98 }}
          >
            {saving ? <><RefreshCw size={16} className="animate-spin" /> Sauvegarde...</>
              : configSaved ? <><CheckCircle size={16} /> Sauvegardé !</>
              : <><Sliders size={16} /> Sauvegarder la configuration</>}
          </motion.button>
          {!rect && <p className="mt-2 font-body text-xs text-gray-400">⚠️ Définissez d'abord la zone du nom</p>}
        </div>
      </div>

      {/* Étape 4 — Génération */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-petal/30 flex items-center justify-center">
              <span className="font-body font-bold text-rose-400 text-sm">4</span>
            </div>
            <h2 className="font-heading text-xl text-wed-dark">Générer les Billets</h2>
            <span className="bg-sky-wed/10 text-sky-wed-dark text-xs font-body px-2 py-0.5 rounded-full">
              {guests.length} invité(s)
            </span>
          </div>
          <motion.button onClick={handleGenerateAll} disabled={generatingAll || !hasConfig || !guests.length}
            className="flex items-center gap-2 px-5 py-2.5 bg-wed-dark hover:bg-wed-dark/80 text-white rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={generatingAll || !hasConfig ? {} : { scale: 1.03 }} whileTap={generatingAll || !hasConfig ? {} : { scale: 0.97 }}
          >
            {generatingAll ? <><RefreshCw size={16} className="animate-spin" /> Génération...</>
              : <><Download size={16} /> Tous les billets (ZIP)</>}
          </motion.button>
        </div>

        {!hasConfig && (
          <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-100">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
            <p className="font-body text-amber-700 text-sm">Uploadez un template et définissez la zone du nom pour générer les billets.</p>
          </div>
        )}

        <div className="p-6">
          {loadingGuests ? (
            <div className="flex justify-center py-8"><RefreshCw size={24} className="animate-spin text-gold-wed" /></div>
          ) : guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users size={40} className="text-gray-200 mb-3" />
              <p className="font-body text-gray-400 text-sm">Aucun invité inscrit pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {guests.map((guest, i) => (
                <motion.div key={guest.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gold-wed/30 hover:bg-gold-wed/3 transition-all group"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                >
                  <div className="w-8 h-8 rounded-full bg-gold-wed/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-body text-xs text-gold-wed-dark font-bold">
                      {guest.prenom.charAt(0)}{guest.nom.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-wed-text font-medium text-sm truncate">
                      {guest.prenom} <span className="uppercase">{guest.nom}</span>
                    </p>
                    {guest.telephone && <p className="font-body text-gray-400 text-xs">{guest.telephone}</p>}
                  </div>
                  <motion.button onClick={() => handleGenerateOne(guest)}
                    disabled={!hasConfig || generatingId === guest.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-wed/20 hover:bg-sky-wed/40 text-sky-wed-dark rounded-lg font-body text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  >
                    {generatingId === guest.id ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                    Billet
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

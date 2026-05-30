import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Download, RefreshCw, CheckCircle, Sliders, Image,
  Users, Info, Trash2, Eye, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import {
  uploadTemplate, getTicketConfig, saveTicketConfig,
  generateTicket, generateAllTickets, getReservations,
} from '../../utils/api';

const FONT_COLORS = [
  { value: '#000000', label: 'Noir' },
  { value: '#FFFFFF', label: 'Blanc' },
  { value: '#C9A96E', label: 'Or' },
  { value: '#7EC8E3', label: 'Bleu ciel' },
  { value: '#2C2C3E', label: 'Marine' },
  { value: '#8B4513', label: 'Marron' },
];

export default function TicketGenerator() {
  const [template, setTemplate] = useState(null); // URL of uploaded template
  const [templateFile, setTemplateFile] = useState(null); // filename
  const [rect, setRect] = useState(null); // { xPercent, yPercent, widthPercent, heightPercent }
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

  // Load existing config & guests
  useEffect(() => {
    loadConfig();
    loadGuests();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await getTicketConfig();
      if (data.templateFile) {
        setTemplate(`/uploads/${data.templateFile}`);
        setTemplateFile(data.templateFile);
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
    } catch {
      toast.error('Impossible de charger les invités');
    } finally {
      setLoadingGuests(false);
    }
  };

  // --- File upload ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('template', file);
    try {
      const { data } = await uploadTemplate(formData);
      setTemplate(data.url);
      setTemplateFile(data.filename);
      setRect(null); // reset rectangle on new upload
      toast.success('Template uploadé avec succès !');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Canvas / Drawing ---
  const getRelPos = useCallback((e) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const bounds = el.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width)),
      y: Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height)),
    };
  }, []);

  const onMouseDown = useCallback((e) => {
    if (!template) return;
    e.preventDefault();
    const pos = getRelPos(e);
    setStartPos(pos);
    setCurrentPos(pos);
    setDrawing(true);
    setRect(null);
  }, [template, getRelPos]);

  const onMouseMove = useCallback((e) => {
    if (!drawing || !startPos) return;
    e.preventDefault();
    setCurrentPos(getRelPos(e));
  }, [drawing, startPos, getRelPos]);

  const onMouseUp = useCallback((e) => {
    if (!drawing || !startPos) return;
    e.preventDefault();
    const pos = getRelPos(e);
    const minX = Math.min(startPos.x, pos.x);
    const minY = Math.min(startPos.y, pos.y);
    const maxX = Math.max(startPos.x, pos.x);
    const maxY = Math.max(startPos.y, pos.y);
    const w = maxX - minX;
    const h = maxY - minY;
    if (w > 0.02 && h > 0.01) {
      setRect({ xPercent: minX, yPercent: minY, widthPercent: w, heightPercent: h });
    }
    setDrawing(false);
    setStartPos(null);
    setCurrentPos(null);
  }, [drawing, startPos, getRelPos]);

  // Live rectangle while drawing
  const liveRect = drawing && startPos && currentPos ? {
    xPercent: Math.min(startPos.x, currentPos.x),
    yPercent: Math.min(startPos.y, currentPos.y),
    widthPercent: Math.abs(currentPos.x - startPos.x),
    heightPercent: Math.abs(currentPos.y - startPos.y),
  } : null;

  const displayRect = drawing ? liveRect : rect;

  // --- Save config ---
  const handleSaveConfig = async () => {
    if (!rect) {
      toast.error('Dessinez d\'abord le cadre sur le template');
      return;
    }
    setSaving(true);
    try {
      await saveTicketConfig({ nameRect: rect, fontSize, fontColor, templateFile });
      setConfigSaved(true);
      toast.success('Configuration sauvegardée !');
      setTimeout(() => setConfigSaved(false), 3000);
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // --- Generate individual ---
  const handleGenerateOne = async (guest) => {
    setGeneratingId(guest.id);
    try {
      const { data } = await generateTicket(guest.id);
      const blob = new Blob([data], { type: 'application/pdf' });
      saveAs(blob, `billet-${guest.prenom}-${guest.nom}.pdf`);
      toast.success(`Billet généré pour ${guest.prenom} ${guest.nom}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur de génération';
      toast.error(msg);
    } finally {
      setGeneratingId(null);
    }
  };

  // --- Generate all ---
  const handleGenerateAll = async () => {
    if (guests.length === 0) {
      toast.error('Aucun invité dans la base de données');
      return;
    }
    setGeneratingAll(true);
    try {
      const { data } = await generateAllTickets();
      const blob = new Blob([data], { type: 'application/zip' });
      const now = new Date().toISOString().slice(0, 10);
      saveAs(blob, `billets-mariage-blinda-elvis-${now}.zip`);
      toast.success(`${guests.length} billet(s) générés et téléchargés !`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setGeneratingAll(false);
    }
  };

  const hasConfig = template && rect;

  return (
    <div className="space-y-6">
      {/* Step 1: Upload */}
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
                uploading
                  ? 'border-sky-wed bg-sky-wed/5'
                  : 'border-gray-200 hover:border-gold-wed hover:bg-gold-wed/3'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
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
                      {template ? 'Changer le template' : 'Cliquez pour uploader le billet'}
                    </p>
                    <p className="font-body text-wed-text/40 text-xs mt-0.5">JPG, PNG · Max 15 Mo</p>
                  </div>
                </div>
              )}
            </div>

            {template && (
              <div className="sm:w-48 rounded-xl overflow-hidden border border-gold-wed/30 shadow-sm flex-shrink-0">
                <img
                  src={template}
                  alt="Template"
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 bg-gold-wed/5">
                  <p className="font-body text-xs text-gold-wed-dark truncate">{templateFile}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Define name placement */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gold-wed/20 flex items-center justify-center">
            <span className="font-body font-bold text-gold-wed-dark text-sm">2</span>
          </div>
          <h2 className="font-heading text-xl text-wed-dark">Placement du Nom</h2>
          <div className="ml-auto flex items-center gap-2 text-xs text-wed-text/50 font-body">
            <Info size={13} />
            Cliquez-glissez pour définir la zone
          </div>
        </div>
        <div className="p-6">
          {!template ? (
            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Image size={40} className="text-gray-300 mb-3" />
              <p className="font-body text-gray-400 text-sm">Uploadez un template pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Canvas editor */}
              <div
                ref={containerRef}
                className="relative select-none rounded-2xl overflow-hidden border-2 border-dashed border-gold-wed/40 cursor-crosshair shadow-lg"
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                onTouchStart={onMouseDown}
                onTouchMove={onMouseMove}
                onTouchEnd={onMouseUp}
                style={{ maxHeight: '60vh' }}
              >
                <img
                  src={template}
                  alt="Template"
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />

                {/* Rectangle overlay */}
                {displayRect && (
                  <div
                    className="absolute border-2 border-gold-wed shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] pointer-events-none"
                    style={{
                      left: `${displayRect.xPercent * 100}%`,
                      top: `${displayRect.yPercent * 100}%`,
                      width: `${displayRect.widthPercent * 100}%`,
                      height: `${displayRect.heightPercent * 100}%`,
                    }}
                  >
                    {/* Preview name */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span
                        className="font-body font-bold text-center px-1 truncate"
                        style={{
                          color: fontColor,
                          fontSize: `clamp(10px, ${displayRect.heightPercent * 50}vw, 28px)`,
                          textShadow: fontColor === '#FFFFFF' ? '0 1px 3px rgba(0,0,0,0.5)' : 'none',
                        }}
                      >
                        Prénom NOM
                      </span>
                    </div>
                    {/* Corner handles */}
                    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos) => (
                      <div
                        key={pos}
                        className={`absolute w-3 h-3 bg-gold-wed rounded-full -translate-x-1/2 -translate-y-1/2 ${pos}`}
                      />
                    ))}
                  </div>
                )}

                {/* Instructions overlay when no rect */}
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
                <motion.div
                  className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  <p className="font-body text-emerald-700 text-sm">
                    Zone définie : {(rect.widthPercent * 100).toFixed(0)}% × {(rect.heightPercent * 100).toFixed(0)}% de l'image
                  </p>
                  <button
                    onClick={() => setRect(null)}
                    className="ml-auto text-emerald-400 hover:text-emerald-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Text style */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-sage/30 flex items-center justify-center">
            <span className="font-body font-bold text-green-700 text-sm">3</span>
          </div>
          <h2 className="font-heading text-xl text-wed-dark">Style du Texte</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Font size */}
          <div className="space-y-3">
            <label className="block font-body text-sm text-wed-text/80 font-medium">
              Taille de la police: <span className="text-gold-wed font-bold">{fontSize}px</span>
            </label>
            <input
              type="range"
              min="12"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-gold-wed/20 rounded-full appearance-none cursor-pointer accent-gold-wed"
            />
            <div className="flex justify-between text-xs text-gray-400 font-body">
              <span>12px</span>
              <span>72px</span>
            </div>
          </div>

          {/* Font color */}
          <div className="space-y-3">
            <label className="block font-body text-sm text-wed-text/80 font-medium">
              Couleur du texte
            </label>
            <div className="flex flex-wrap gap-2">
              {FONT_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFontColor(c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    fontColor === c.value
                      ? 'border-gold-wed scale-125 shadow-md'
                      : 'border-gray-200 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fontColor}
                  onChange={(e) => setFontColor(e.target.value)}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer p-0.5"
                  title="Couleur personnalisée"
                />
                <span className="font-body text-xs text-gray-400">{fontColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save config */}
        <div className="px-6 pb-6">
          <motion.button
            onClick={handleSaveConfig}
            disabled={saving || !rect}
            className="flex items-center gap-2 px-6 py-3 bg-gold-wed hover:bg-gold-wed-dark text-white rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={saving || !rect ? {} : { scale: 1.02 }}
            whileTap={saving || !rect ? {} : { scale: 0.98 }}
          >
            {saving ? (
              <><RefreshCw size={16} className="animate-spin" /> Sauvegarde...</>
            ) : configSaved ? (
              <><CheckCircle size={16} /> Configuration sauvegardée !</>
            ) : (
              <><Sliders size={16} /> Sauvegarder la configuration</>
            )}
          </motion.button>
          {!rect && (
            <p className="mt-2 font-body text-xs text-gray-400">
              ⚠️ Définissez d'abord la zone du nom sur le template
            </p>
          )}
        </div>
      </div>

      {/* Step 4: Generate */}
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

          {/* Download all button */}
          <motion.button
            onClick={handleGenerateAll}
            disabled={generatingAll || !hasConfig || guests.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-wed-dark hover:bg-wed-dark/80 text-white rounded-xl font-body font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={generatingAll || !hasConfig ? {} : { scale: 1.03 }}
            whileTap={generatingAll || !hasConfig ? {} : { scale: 0.97 }}
          >
            {generatingAll ? (
              <><RefreshCw size={16} className="animate-spin" /> Génération...</>
            ) : (
              <><Download size={16} /> Tous les billets (ZIP)</>
            )}
          </motion.button>
        </div>

        {!hasConfig && (
          <div className="flex items-center gap-3 px-6 py-4 bg-amber-50 border-b border-amber-100">
            <AlertCircle size={16} className="text-amber-500 flex-shrink-0" />
            <p className="font-body text-amber-700 text-sm">
              Uploadez un template et définissez la zone du nom pour générer les billets.
            </p>
          </div>
        )}

        <div className="p-6">
          {loadingGuests ? (
            <div className="flex justify-center py-8">
              <RefreshCw size={24} className="animate-spin text-gold-wed" />
            </div>
          ) : guests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users size={40} className="text-gray-200 mb-3" />
              <p className="font-body text-gray-400 text-sm">Aucun invité inscrit pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {guests.map((guest, i) => (
                <motion.div
                  key={guest.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gold-wed/30 hover:bg-gold-wed/3 transition-all group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
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
                    {guest.telephone && (
                      <p className="font-body text-gray-400 text-xs">{guest.telephone}</p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => handleGenerateOne(guest)}
                    disabled={!hasConfig || generatingId === guest.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-wed/20 hover:bg-sky-wed/40 text-sky-wed-dark rounded-lg font-body text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {generatingId === guest.id ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : (
                      <Download size={12} />
                    )}
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

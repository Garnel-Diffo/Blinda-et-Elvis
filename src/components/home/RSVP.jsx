import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { User, Phone, Mail, CheckCircle, Loader, ChevronDown, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitRSVP } from '../../utils/api';
import FloatingPetals from '../shared/FloatingPetals';

const COUNTRY_CODES = [
  { code: '+237', label: '🇨🇲 +237', name: 'Cameroun' },
  { code: '+33', label: '🇫🇷 +33', name: 'France' },
  { code: '+32', label: '🇧🇪 +32', name: 'Belgique' },
  { code: '+41', label: '🇨🇭 +41', name: 'Suisse' },
  { code: '+1', label: '🇺🇸 +1', name: 'USA/Canada' },
  { code: '+44', label: '🇬🇧 +44', name: 'Royaume-Uni' },
];

const INITIAL_FORM = { nom: '', prenom: '', indicatif: '+237', telephone: '', email: '' };

function InputField({ label, icon: Icon, name, value, onChange, type = 'text', required, placeholder, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block font-body text-sm text-wed-text/80 font-semibold">
        {label} {required && <span className="text-petal">*</span>}
      </label>
      <div className="relative group">
        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gold-wed/60 transition-colors group-focus-within:text-gold-wed">
          <Icon size={16} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input-elegant pl-10 ${error ? 'border-petal/60 focus:ring-petal/20 focus:border-petal' : ''}`}
        />
        {/* Bottom glow line */}
        <div
          className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full transform scale-x-0 transition-transform duration-300 origin-left"
          style={{ background: 'linear-gradient(90deg, #F59E0B, #0EA5E9)', }}
          // We use a workaround via group-focus-within class
        />
      </div>
      {error && (
        <motion.p
          className="text-petal text-xs font-body flex items-center gap-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          ⚠ {error}
        </motion.p>
      )}
    </div>
  );
}

export default function RSVP() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [showIndicatif, setShowIndicatif] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.prenom.trim()) e.prenom = 'Le prénom est requis';
    else if (form.prenom.trim().length < 2) e.prenom = 'Minimum 2 caractères';
    if (!form.nom.trim()) e.nom = 'Le nom est requis';
    else if (form.nom.trim().length < 2) e.nom = 'Minimum 2 caractères';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Email invalide';
    }
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        telephone: form.telephone.trim() ? `${form.indicatif} ${form.telephone.trim()}` : null,
        email: form.email.trim() || null,
      };
      await submitRSVP(payload);
      setSuccess(true);
      setForm(INITIAL_FORM);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Une erreur s\'est produite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="py-24 px-4 relative overflow-hidden">
      {/* Vivid background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(253,248,240,0.95) 50%, rgba(245,158,11,0.08) 100%)',
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-wed/60 to-transparent" />

      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 right-10 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(14,165,233,0.1)' }}
        animate={{ scale: [1, 1.4, 1], x: [0, 20, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.12)' }}
        animate={{ scale: [1, 1.3, 1], x: [0, -15, 0] }}
        transition={{ duration: 9, repeat: Infinity, delay: 2 }}
      />

      <FloatingPetals count={14} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div ref={ref} className="text-center mb-12">
          <motion.span
            className="badge-sky mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring' }}
          >
            💌 Confirmation de Présence
          </motion.span>

          <motion.h2
            className="section-title mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Serez-vous des <span className="text-gradient-gold">nôtres ?</span>
          </motion.h2>

          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Votre présence est notre plus beau cadeau
          </motion.span>

          <motion.p
            className="font-body text-wed-text/60 text-sm max-w-lg mx-auto leading-relaxed mt-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Confirmez votre participation pour nous aider à organiser cette belle journée.
            Nous avons hâte de vous avoir parmi nous ! 🌸
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'white',
            boxShadow: '0 30px 80px rgba(14,165,233,0.12), 0 0 0 1px rgba(245,158,11,0.15)',
          }}
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.3, type: 'spring', stiffness: 150 }}
        >
          {/* Top gradient bar */}
          <div
            className="h-1.5"
            style={{ background: 'linear-gradient(90deg, #0EA5E9, #F59E0B, #0EA5E9)' }}
          />

          <div className="p-8 md:p-10">
            {/* Corner decorations */}
            <div className="absolute top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-gold-wed/30 rounded-tl-xl" />
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-sky-wed/30 rounded-br-xl" />

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  className="flex flex-col items-center justify-center py-10 text-center"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                  >
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                      style={{
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        boxShadow: '0 0 40px rgba(16,185,129,0.4)',
                      }}
                    >
                      <CheckCircle size={48} className="text-white" />
                    </div>
                  </motion.div>
                  <h3 className="font-heading text-3xl md:text-4xl text-wed-dark mb-3">
                    Merci infiniment ! 🌸
                  </h3>
                  <p className="font-body text-wed-text/70 text-sm max-w-sm leading-relaxed mb-6">
                    Votre présence est enregistrée. Nous sommes tellement heureux de
                    vous compter parmi nous pour ce jour béni ! À très bientôt 💍
                  </p>
                  <p
                    className="font-script text-5xl mb-6"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Blinda & Elvis
                  </p>
                  <motion.button
                    onClick={() => { setSuccess(false); setErrors({}); }}
                    className="btn-secondary text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Soumettre une autre réponse
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Prénom" icon={User} name="prenom" value={form.prenom}
                      onChange={handleChange} required placeholder="Votre prénom" error={errors.prenom} />
                    <InputField label="Nom" icon={User} name="nom" value={form.nom}
                      onChange={handleChange} required placeholder="Votre nom" error={errors.nom} />
                  </div>

                  {/* Phone with country code */}
                  <div className="space-y-1.5">
                    <label className="block font-body text-sm text-wed-text/80 font-semibold">
                      Téléphone <span className="text-wed-text/40 font-normal">(optionnel)</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowIndicatif(p => !p)}
                          className="flex items-center gap-1.5 h-full px-3 py-3 bg-white border border-gold-wed/30 rounded-xl font-body text-wed-text text-sm whitespace-nowrap focus:outline-none focus:border-gold-wed transition-all hover:border-gold-wed/60 hover:shadow-sm"
                        >
                          {COUNTRY_CODES.find(c => c.code === form.indicatif)?.label || '+237'}
                          <ChevronDown size={14} className={`transition-transform ${showIndicatif ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {showIndicatif && (
                            <motion.div
                              className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl z-20 overflow-hidden"
                              style={{ border: '1px solid rgba(245,158,11,0.2)' }}
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            >
                              {COUNTRY_CODES.map(c => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => { setForm(p => ({ ...p, indicatif: c.code })); setShowIndicatif(false); }}
                                  className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors flex items-center gap-2 ${
                                    form.indicatif === c.code
                                      ? 'bg-gold-wed/10 text-gold-wed-dark font-bold'
                                      : 'text-wed-text hover:bg-gold-wed/5'
                                  }`}
                                >
                                  <span>{c.label}</span>
                                  <span className="text-wed-text/40 text-xs">{c.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gold-wed/60">
                          <Phone size={16} />
                        </div>
                        <input
                          type="tel"
                          name="telephone"
                          value={form.telephone}
                          onChange={handleChange}
                          placeholder="6XX XXX XXX"
                          className="input-elegant pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <InputField label="Email" icon={Mail} name="email" value={form.email}
                    onChange={handleChange} type="email" placeholder="votre@email.com (optionnel)"
                    error={errors.email} />

                  <p className="text-xs text-wed-text/40 font-body">
                    <span className="text-petal">*</span> Champs obligatoires
                  </p>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                    whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                    whileTap={loading ? {} : { scale: 0.98 }}
                  >
                    {loading ? (
                      <><Loader size={18} className="animate-spin" /> Enregistrement...</>
                    ) : (
                      <><Sparkles size={16} /> Confirmer ma présence</>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom gradient bar */}
          <div
            className="h-1"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #0EA5E9, #F59E0B)' }}
          />
        </motion.div>

        {/* Quote */}
        <motion.p
          className="text-center mt-8 font-heading italic text-wed-text/40 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          « Votre présence illuminera notre journée » 🌸
        </motion.p>
      </div>
    </section>
  );
}

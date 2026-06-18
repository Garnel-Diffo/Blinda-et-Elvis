import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ZoomIn, X } from 'lucide-react';
import pagneOfficiel from '../../assets/images/pagne-officiel.jpeg';

const COLORS = [
  {
    name: 'Bleu Ciel',
    hex: '#0EA5E9',
    hex2: '#BAE6FD',
    symbol: '💙',
    meaning: 'Paix & Sérénité',
    description: 'Symbole de paix, de sérénité et de liberté. Le bleu ciel rappelle un horizon de bénédictions infinies.',
    glow: '0 0 30px rgba(14,165,233,0.5), 0 0 60px rgba(14,165,233,0.2)',
    delay: 0,
  },
  {
    name: 'Or',
    hex: '#F59E0B',
    hex2: '#FDE68A',
    symbol: '💛',
    meaning: 'Gloire & Valeur',
    description: 'Symbole de gloire, de valeur et de luxe. L\'or représente la préciosité de notre amour et la richesse de notre union.',
    glow: '0 0 30px rgba(245,158,11,0.5), 0 0 60px rgba(245,158,11,0.2)',
    delay: 0.15,
  },
  {
    name: 'Blanc',
    hex: '#FFFFFF',
    hex2: '#FDF8F0',
    symbol: '🤍',
    meaning: 'Pureté & Lumière',
    description: 'Symbole de pureté, de lumière et de nouvelles intentions. Le blanc représente la page blanche d\'une vie qui commence.',
    glow: '0 0 30px rgba(200,200,200,0.6), 0 0 60px rgba(200,200,200,0.3)',
    delay: 0.3,
  },
];

function ColorCard({ color, inView }) {
  return (
    <motion.div
      className="flex flex-col items-center group"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: color.delay, type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Color swatch with glow */}
      <div className="relative mb-6">
        <motion.div
          className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-white relative overflow-hidden"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color.hex2}, ${color.hex})`,
            boxShadow: color.glow,
          }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {/* Inner shine */}
          <div
            className="absolute top-3 left-5 w-10 h-6 rounded-full bg-white/30 blur-md"
            style={{ transform: 'rotate(-30deg)' }}
          />
        </motion.div>

        {/* Symbol badge */}
        <motion.div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg border border-gold-wed/20 text-2xl"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: color.delay }}
        >
          {color.symbol}
        </motion.div>
      </div>

      {/* Name */}
      <h3 className="font-heading text-2xl md:text-3xl text-wed-dark mt-2 mb-1">{color.name}</h3>

      {/* Meaning badge - vivid gradient */}
      <span
        className="text-xs font-body uppercase tracking-[0.2em] mb-4 px-4 py-1.5 rounded-full font-bold"
        style={{
          background: `linear-gradient(135deg, ${color.hex}20, ${color.hex}10)`,
          color: color.hex === '#FFFFFF' ? '#D97706' : color.hex,
          border: `1px solid ${color.hex}40`,
          boxShadow: `0 2px 12px ${color.hex}30`,
        }}
      >
        {color.meaning}
      </span>

      <p className="font-body text-wed-text/70 text-sm text-center leading-relaxed max-w-[200px]">
        {color.description}
      </p>
    </motion.div>
  );
}

function PagneLightBox({ onClose }) {
  const handleKeyDown = useCallback((e) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
        ref={(el) => el?.focus()}
      >
        <motion.div className="absolute inset-0 bg-wed-dark/90" onClick={onClose} />

        <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute -top-12 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={28} />
          </button>

          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl max-h-[85vh] w-full flex items-center justify-center bg-black"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={pagneOfficiel}
              alt="Pagne officiel du mariage Blinda & Elvis"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </motion.div>

          <motion.p
            className="mt-4 font-heading italic text-white/80 text-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Pagne Officiel · Blinda &amp; Elvis 💍
          </motion.p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DressCode() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true });
  const [zoomOpen, setZoomOpen] = useState(false);

  return (
    <section id="code-vestimentaire" className="py-24 px-4 relative overflow-hidden">
      {/* Vivid background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.06) 0%, white 50%, rgba(245,158,11,0.06) 100%)',
        }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-wed/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-wed/60 to-transparent" />

      {/* Decorative orbs */}
      <div className="absolute -left-20 top-1/4 w-64 h-64 rounded-full bg-sky-wed/10 blur-3xl" />
      <div className="absolute -right-20 bottom-1/4 w-64 h-64 rounded-full bg-gold-wed/10 blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.span
            className="badge-gold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            👗 Code Vestimentaire
          </motion.span>

          <motion.h2
            className="section-title mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Nos <span className="text-gradient-gold">Couleurs</span> Officielles
          </motion.h2>

          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Les couleurs de notre bonheur
          </motion.span>

          <motion.p
            className="font-body text-wed-text/60 max-w-2xl mx-auto text-sm leading-relaxed mt-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Pour rendre cette célébration encore plus majestueuse et harmonieuse,
            nous avons choisi trois couleurs officielles. Porter le pagne du mariage,
            c'est marcher avec nous dans cette nouvelle aventure ! 💍🌸
          </motion.p>
        </div>

        {/* Color swatches */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-16 mb-20">
          {COLORS.map((color) => (
            <ColorCard key={color.name} color={color} inView={inView} />
          ))}
        </div>

        {/* Divider */}
        <div className="divider-ornament mb-16">
          <span className="font-script text-2xl text-gold-wed">Le Pagne Officiel</span>
        </div>

        {/* Pagne section */}
        <div ref={ref2} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          >
            <h3 className="font-heading text-3xl md:text-4xl text-wed-dark mb-6">
              Le Pagne du Mariage
            </h3>
            <p className="font-body text-wed-text/70 leading-relaxed mb-6">
              ✨ Pour rendre cette célébration encore plus majestueuse et harmonieuse,
              le pagne officiel du mariage est disponible 💍🌸
            </p>

            <div className="space-y-4 mb-8">
              {[
                { emoji: '💙', text: 'Marcher avec nous dans cette nouvelle aventure' },
                { emoji: '💛', text: 'Partager les couleurs de notre bonheur' },
                { emoji: '🤍', text: 'Créer une ambiance élégante et inoubliable' },
                { emoji: '💜', text: 'Témoigner votre soutien et votre amour envers les futurs mariés' },
              ].map((item, i) => (
                <motion.div
                  key={item.text}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView2 ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <span className="text-lg mt-0.5 flex-shrink-0">{item.emoji}</span>
                  <p className="font-body text-wed-text/70 text-sm leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="inline-flex items-center gap-2 rounded-xl px-6 py-4"
              style={{
                background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))',
                border: '1px solid rgba(245,158,11,0.4)',
                boxShadow: '0 4px 20px rgba(245,158,11,0.15)',
              }}
              whileHover={{ scale: 1.02, boxShadow: '0 6px 30px rgba(245,158,11,0.25)' }}
            >
              <span className="font-heading text-gold-wed-dark italic text-xl">
                Porter le pagne, c'est être avec nous ✦
              </span>
            </motion.div>
          </motion.div>

          {/* Pagne photo — affichée intégralement (prix et contacts visibles), cliquable pour zoomer */}
          <motion.div
            className="cursor-pointer group"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={inView2 ? { opacity: 1, x: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.2, type: 'spring', stiffness: 100 }}
            onClick={() => setZoomOpen(true)}
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl photo-hover bg-white"
              style={{
                boxShadow: '0 30px 80px rgba(245,158,11,0.2), 0 0 0 4px rgba(245,158,11,0.2)',
              }}
            >
              <img
                src={pagneOfficiel}
                alt="Pagne officiel du mariage Blinda & Elvis"
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.03]"
              />
              {/* Bottom label */}
              <div
                className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
                }}
              >
                <p className="font-heading text-white text-xl italic">
                  Pagne Officiel · Blinda & Elvis 💍
                </p>
                <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-body uppercase tracking-widest">
                  <ZoomIn size={14} /> Agrandir
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {zoomOpen && <PagneLightBox onClose={() => setZoomOpen(false)} />}
    </section>
  );
}

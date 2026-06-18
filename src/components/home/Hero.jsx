import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';
import FloatingPetals from '../shared/FloatingPetals';
import pagneDos from '../../assets/images/pagne-dos.jpeg';
import couronne from '../../assets/images/couronne.jpeg';

// ── Countdown ─────────────────────────────────────────────────────────────
const TARGET = new Date('2026-06-20T08:30:00');

function getTimeLeft() {
  const diff = TARGET - Date.now();
  if (diff <= 0) return { jours: 0, heures: 0, minutes: 0, secondes: 0 };
  return {
    jours: Math.floor(diff / 86400000),
    heures: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    secondes: Math.floor((diff % 60000) / 1000),
  };
}

function CountdownBox({ value, label, delay, color }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay }}
    >
      <div
        className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm border overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.15)',
          borderColor: color === 'gold' ? 'rgba(245,158,11,0.5)' : 'rgba(14,165,233,0.5)',
          boxShadow: color === 'gold'
            ? '0 0 20px rgba(245,158,11,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
            : '0 0 20px rgba(14,165,233,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        <motion.span
          key={value}
          className="font-heading text-3xl md:text-4xl font-bold text-white relative z-10"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            textShadow: color === 'gold'
              ? '0 0 20px rgba(245,158,11,0.9)'
              : '0 0 20px rgba(14,165,233,0.9)',
          }}
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </div>
      <span className="mt-2 text-[9px] md:text-[11px] uppercase tracking-[0.25em] text-white/70 font-body">
        {label}
      </span>
    </motion.div>
  );
}

function Countdown() {
  const [t, setT] = useState(getTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);
  const units = [
    { key: 'jours', label: 'Jours', color: 'gold', delay: 0.8 },
    { key: 'heures', label: 'Heures', color: 'sky', delay: 0.9 },
    { key: 'minutes', label: 'Minutes', color: 'gold', delay: 1.0 },
    { key: 'secondes', label: 'Secondes', color: 'sky', delay: 1.1 },
  ];
  return (
    <div className="flex items-end gap-2 md:gap-3 justify-center">
      {units.map(({ key, label, color, delay }, i) => (
        <span key={key} className="flex items-end gap-2 md:gap-3">
          <CountdownBox value={t[key]} label={label} delay={delay} color={color} />
          {i < 3 && (
            <span className="text-white/40 font-heading text-xl md:text-2xl mb-7 leading-none font-light">:</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ── Sparkle ───────────────────────────────────────────────────────────────
function SparkleEl({ x, y, size, delay }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-10"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 180, 360] }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: Math.random() * 3 + 1 }}
    >
      <Sparkles size={size} style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 6px #F59E0B)' }} />
    </motion.div>
  );
}

const SPARKLES = [
  { x: 12, y: 18, size: 12, delay: 0 }, { x: 82, y: 12, size: 16, delay: 0.8 },
  { x: 88, y: 72, size: 10, delay: 1.5 }, { x: 8, y: 78, size: 14, delay: 2.2 },
  { x: 55, y: 6, size: 12, delay: 0.4 }, { x: 72, y: 88, size: 18, delay: 1.2 },
];

// ── Hero ───────────────────────────────────────────────────────────────────
export default function Hero() {
  // Parallax uniquement sur l'image de fond (via window scroll — pas de ref nécessaire)
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ['0%', '20%']);

  const scrollToNext = () =>
    document.getElementById('dot')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section
      id="accueil"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      // position: relative est déjà fourni par 'relative' de Tailwind
    >
      {/* ── Background avec parallax ── */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <img
          src={pagneDos}
          alt="Blinda et Elvis"
          className="w-full h-full object-cover object-center ken-burns-bg"
          style={{ minHeight: '120%' }}
        />
        {/* Overlay sombre pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(30,27,75,0.88) 0%, rgba(30,27,75,0.72) 35%, rgba(30,27,75,0.45) 65%, rgba(30,27,75,0.2) 100%)',
          }}
        />
        {/* Fondu bas pour transition douce vers la section suivante */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, #FDF8F0, transparent)' }}
        />
        {/* Tint coloré */}
        <div
          className="absolute inset-0 mix-blend-overlay opacity-25 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, transparent 50%, #F59E0B 100%)' }}
        />
      </motion.div>

      {/* ── Éléments de décor ── */}
      <FloatingPetals count={20} />
      {SPARKLES.map((s, i) => <SparkleEl key={i} {...s} />)}

      {/* ── Contenu principal — PAS de fade-out au scroll ── */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center flex flex-col items-center gap-6 pt-20 pb-16">

        {/* Badge Save the Date */}
        <motion.div
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-[0.3em] font-body backdrop-blur-sm border"
          style={{
            background: 'rgba(245,158,11,0.15)',
            borderColor: 'rgba(245,158,11,0.5)',
            color: '#FDE68A',
            boxShadow: '0 0 20px rgba(245,158,11,0.2)',
          }}
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: 'spring', stiffness: 200 }}
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-gold-wed"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          ✦ Save the Date · 20 Juin 2026 ✦
          <motion.span
            className="w-2 h-2 rounded-full bg-gold-wed"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
          />
        </motion.div>

        {/* Photo du couple */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, type: 'spring', stiffness: 150, damping: 15 }}
        >
          <motion.div
            className="absolute inset-0 -m-6 rounded-full"
            style={{ border: '2px solid rgba(245,158,11,0.3)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 -m-3 rounded-full"
            style={{ border: '1px dashed rgba(14,165,233,0.4)' }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ boxShadow: [
              '0 0 30px rgba(245,158,11,0.3)',
              '0 0 70px rgba(245,158,11,0.6)',
              '0 0 30px rgba(245,158,11,0.3)',
            ]}}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden relative"
            style={{
              border: '4px solid rgba(245,158,11,0.8)',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.3), 0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src={couronne}
              alt="Blinda et Elvis"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-wed-dark/30 to-transparent" />
          </div>
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] font-body tracking-widest uppercase backdrop-blur-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9))',
              color: 'white',
              boxShadow: '0 4px 20px rgba(245,158,11,0.5)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            ✦ 20 Juin 2026 ✦
          </motion.div>
        </motion.div>

        {/* Noms */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <h1
            className="font-script text-7xl md:text-9xl text-white leading-none"
            style={{
              textShadow:
                '0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.3), 0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            Blinda & Elvis
          </h1>
        </motion.div>

        {/* Thème */}
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
        >
          <p
            className="font-heading text-xl md:text-2xl italic tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #FDE68A, #F59E0B, #FDE68A)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'goldShimmer 3s linear infinite',
              backgroundClip: 'text',
            }}
          >
            🌿✨ Le Jardin de Paix et de Joie ✨🌿
          </p>
          <p
            className="font-body text-white/75 text-sm md:text-base max-w-lg mx-auto leading-relaxed"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            Parce que l'amour est une fleur qui grandit avec la paix,
            <br className="hidden sm:block" />
            la confiance et la bénédiction de Dieu
          </p>
        </motion.div>

        {/* Séparateur */}
        <motion.div
          className="flex items-center gap-3 w-full max-w-sm"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold-wed/60" />
          <span className="text-gold-wed text-lg">✦</span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold-wed/60" />
        </motion.div>

        {/* Compte à rebours */}
        <Countdown />

        {/* Boutons CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <motion.a
            href="#rsvp"
            onClick={e => { e.preventDefault(); document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="btn-primary text-sm uppercase tracking-widest"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            style={{ boxShadow: '0 6px 30px rgba(245,158,11,0.5)' }}
          >
            ✦ Confirmer ma présence
          </motion.a>
          <motion.a
            href="#programme"
            onClick={e => { e.preventDefault(); document.getElementById('programme')?.scrollIntoView({ behavior: 'smooth' }); }}
            className="backdrop-blur-sm border-2 border-white/40 text-white font-body font-bold px-8 py-3.5 rounded-full transition-all duration-300 hover:bg-white/10 text-sm uppercase tracking-widest"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            Voir le programme
          </motion.a>
        </motion.div>

        {/* Citation */}
        <motion.p
          className="font-heading italic text-white/50 text-sm"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          « Ce sera un jour d'amour, de partage, d'émotions et de bénédictions »
        </motion.p>
      </div>

      {/* Indicateur de défilement */}
      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ opacity: { delay: 2 }, y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="Défiler vers le bas"
      >
        <span className="text-white/30 text-xs uppercase tracking-widest font-body">Défiler</span>
        <ChevronDown
          size={28}
          style={{ color: '#F59E0B', filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }}
        />
      </motion.button>
    </section>
  );
}

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Scale, Church, Sparkles } from 'lucide-react';

const EVENTS = [
  {
    time: '08h30',
    icon: Scale,
    title: 'Mariage Civil',
    description: 'Cérémonie civile officielle, scellant notre union devant la loi et nos proches. Un moment solennel et touchant pour débuter cette belle journée.',
    emoji: '🤍',
    gradient: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(14,165,233,0.04))',
    border: 'rgba(14,165,233,0.4)',
    iconGradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
    glow: 'rgba(14,165,233,0.3)',
    delay: 0,
  },
  {
    time: '14h30',
    icon: Church,
    title: 'Bénédiction Nuptiale',
    description: 'Cérémonie religieuse pour recevoir la bénédiction de Dieu sur notre union. Un temps de prière, de louange et d\'engagements sacrés.',
    emoji: '⛪',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
    border: 'rgba(245,158,11,0.5)',
    iconGradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    glow: 'rgba(245,158,11,0.4)',
    delay: 0.15,
  },
  {
    time: '20h00',
    icon: Sparkles,
    title: 'Grande Soirée Festive',
    description: 'Une soirée inoubliable de fête, de musique et de joie pour célébrer notre nouvelle vie ensemble entourés de tous ceux que nous aimons.',
    emoji: '🎉',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.12), rgba(251,113,133,0.04))',
    border: 'rgba(251,113,133,0.4)',
    iconGradient: 'linear-gradient(135deg, #FB7185, #E11D48)',
    glow: 'rgba(251,113,133,0.3)',
    delay: 0.3,
  },
];

function EventCard({ event, inView }) {
  const [ref, cardInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const Icon = event.icon;
  const active = inView && cardInView;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={active ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay: event.delay, type: 'spring', stiffness: 150, damping: 20 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative group"
    >
      <div
        className="rounded-2xl p-8 flex flex-col items-center text-center h-full transition-all duration-400"
        style={{
          background: event.gradient,
          border: `1px solid ${event.border}`,
          boxShadow: `0 4px 30px ${event.glow}15`,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `0 20px 60px ${event.glow}40, 0 0 0 1px ${event.border}`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = `0 4px 30px ${event.glow}15`;
        }}
      >
        {/* Time badge */}
        <div
          className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-6 backdrop-blur-sm"
          style={{
            background: 'white',
            boxShadow: `0 4px 20px ${event.glow}30`,
            border: `1px solid ${event.border}`,
          }}
        >
          <span className="text-lg">{event.emoji}</span>
          <span className="font-heading text-2xl font-semibold text-wed-dark">{event.time}</span>
        </div>

        {/* Icon with gradient */}
        <motion.div
          className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-5 shadow-lg"
          style={{
            background: event.iconGradient,
            boxShadow: `0 8px 30px ${event.glow}50`,
          }}
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: event.delay }}
        >
          <Icon size={32} className="text-white" />
        </motion.div>

        {/* Content */}
        <h3 className="font-heading text-2xl md:text-3xl text-wed-dark mb-3">{event.title}</h3>
        <p className="font-body text-wed-text/65 text-sm leading-relaxed">{event.description}</p>

        {/* Bottom accent */}
        <motion.div
          className="mt-6 h-1 rounded-full"
          style={{ background: event.iconGradient, width: '40px' }}
          whileHover={{ width: '80px' }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

export default function Program() {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section id="programme" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-white" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-wed/60 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-wed/60 to-transparent" />

      {/* Decorative orbs */}
      <motion.div
        className="absolute -left-32 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'rgba(14,165,233,0.08)' }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-32 top-1/3 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'rgba(245,158,11,0.08)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, delay: 1 }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div ref={ref} className="text-center mb-16">
          <motion.span
            className="badge-sky mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            📅 Programme du Jour
          </motion.span>

          <motion.h2
            className="section-title mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            <span className="text-gradient-sky">20 Juin</span> 2026
          </motion.h2>

          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Une journée d'éternité
          </motion.span>

          <motion.p
            className="font-body text-wed-text/60 max-w-xl mx-auto text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Le 20 Juin sera bien plus qu'une simple date… Ce sera un jour d'amour,
            de partage d'émotions, de bénédictions et de visitation 🤍
          </motion.p>
        </div>

        {/* Date pill */}
        <motion.div
          className="flex items-center gap-4 mb-12 justify-center"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={inView ? { opacity: 1, scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="flex-1 max-w-[140px] h-px bg-gradient-to-r from-transparent to-gold-wed/60" />
          <div
            className="flex items-center gap-2 px-5 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
              border: '1px solid rgba(245,158,11,0.4)',
              boxShadow: '0 4px 20px rgba(245,158,11,0.15)',
            }}
          >
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-gold-wed"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-heading text-gold-wed-dark text-sm italic">
              Samedi · 20 Juin 2026
            </span>
            <motion.span
              className="w-2.5 h-2.5 rounded-full bg-gold-wed"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
            />
          </div>
          <div className="flex-1 max-w-[140px] h-px bg-gradient-to-l from-transparent to-gold-wed/60" />
        </motion.div>

        {/* Events */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {EVENTS.map((event) => (
            <EventCard key={event.title} event={event} inView={inView} />
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          className="text-center mt-12 font-heading italic text-wed-text/40 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          ✦ Soyez ponctuel(le) pour profiter pleinement de chaque instant ✦
        </motion.p>
      </div>
    </section>
  );
}

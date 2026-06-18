import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, MapPin, CheckCircle, X, ChevronLeft, ChevronRight, ZoomIn, Leaf } from 'lucide-react';
import FloatingPetals from '../shared/FloatingPetals';

import dotFeatured from '../../assets/images/dot/dot-couple-1.jpg';
import dot2 from '../../assets/images/dot/dot-couple-2.jpg';
import dot3 from '../../assets/images/dot/dot-couple-3.jpg';
import dot4 from '../../assets/images/dot/dot-couple-4.jpg';
import dot5 from '../../assets/images/dot/dot-couple-5.jpg';

const FEATURED = {
  src: dotFeatured,
  caption: 'Le couple rayonnant dans la pure tradition Bamiléké 👑',
};

const PHOTOS = [
  FEATURED,
  { src: dot2, caption: 'Un instant de tendresse, à l\'abri des regards 💙' },
  { src: dot3, caption: 'Le geste solennel d\'une bénédiction 🙏' },
  { src: dot4, caption: 'Le rituel du partage : se nourrir l\'un l\'autre, symbole d\'unité 🤍' },
  { src: dot5, caption: 'Une promesse scellée dans la joie et l\'amour ✨' },
];

function LightBox({ photos, index, onClose, onPrev, onNext }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [onClose, onPrev, onNext]
  );

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
        <motion.div
          className="absolute inset-0 bg-wed-dark/90 lightbox-overlay"
          onClick={onClose}
        />

        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute -top-12 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={28} />
          </button>

          <motion.div
            key={index}
            className="relative rounded-2xl overflow-hidden shadow-2xl max-h-[70vh] w-full flex items-center justify-center bg-black"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={photos[index].src}
              alt={photos[index].caption}
              className="max-h-[70vh] w-auto max-w-full object-contain"
            />
          </motion.div>

          <motion.p
            key={`cap-${index}`}
            className="mt-4 font-heading italic text-white/80 text-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {photos[index].caption}
          </motion.p>

          <div className="flex items-center gap-6 mt-6">
            <button
              onClick={onPrev}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="font-body text-white/50 text-sm">
              {index + 1} / {photos.length}
            </span>
            <button
              onClick={onNext}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoCard({ icon: Icon, label, lines, delay, inView }) {
  return (
    <motion.div
      className="flex items-center gap-4 rounded-2xl p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))',
        border: '1px solid rgba(16,185,129,0.3)',
        boxShadow: '0 4px 30px rgba(16,185,129,0.1)',
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(16,185,129,0.2)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 8px 20px rgba(16,185,129,0.4)' }}
      >
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="font-body text-xs uppercase tracking-widest text-wed-text/50 mb-0.5">{label}</p>
        {lines.map((line, i) => (
          <p
            key={i}
            className={i === 0 ? 'font-heading text-lg text-wed-dark leading-snug' : 'font-body text-xs text-wed-text/60 leading-snug'}
          >
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dot() {
  const [lightbox, setLightbox] = useState(null);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [ref2, inView2] = useInView({ threshold: 0.1, triggerOnce: true });

  const openLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = () => setLightbox((p) => (p - 1 + PHOTOS.length) % PHOTOS.length);
  const nextPhoto = () => setLightbox((p) => (p + 1) % PHOTOS.length);

  const thumbnails = PHOTOS.slice(1);

  return (
    <section id="dot" className="py-24 px-4 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, white 50%, rgba(245,158,11,0.05) 100%)' }}
      />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sage/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-wed/40 to-transparent" />

      {/* Decorative orbs */}
      <motion.div
        className="absolute -left-32 top-1/4 w-80 h-80 rounded-full blur-3xl"
        style={{ background: 'rgba(16,185,129,0.1)' }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute -right-32 bottom-1/4 w-72 h-72 rounded-full blur-3xl"
        style={{ background: 'rgba(245,158,11,0.08)' }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, delay: 1 }}
      />

      <FloatingPetals count={10} />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div ref={ref} className="text-center mb-12">
          <motion.span
            className="badge-sage mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <CheckCircle size={13} className="inline -mt-0.5 mr-1" />
            Cérémonie Déjà Célébrée
          </motion.span>

          <motion.h2
            className="section-title mb-2"
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            La <span className="text-gradient-sage">Dot</span>
          </motion.h2>

          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Mariage coutumier · Racines & Traditions
          </motion.span>

          <motion.p
            className="font-body text-wed-text/60 max-w-2xl mx-auto text-sm leading-relaxed mt-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Avant de nous unir civilement et religieusement, nos deux familles se sont réunies
            dans le plus grand respect de la coutume pour sceller notre union ancestrale.
            Un moment empreint d'émotion, de chants et de bénédictions 🌿
          </motion.p>
        </div>

        {/* Info cards: date + location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-16">
          <InfoCard
            icon={Calendar}
            label="Date"
            lines={['Samedi 13 Juin 2026']}
            delay={0.35}
            inView={inView}
          />
          <InfoCard
            icon={MapPin}
            label="Lieu"
            lines={['Babadjou', 'Après l\'entrée Kombou · Quartier Zavion (après Mbouda)']}
            delay={0.45}
            inView={inView}
          />
        </div>

        {/* Photos */}
        <div ref={ref2} className="space-y-5">
          {/* Featured photo */}
          <motion.div
            className="relative cursor-pointer group"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={inView2 ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            onClick={() => openLightbox(0)}
          >
            <div
              className="rounded-3xl overflow-hidden shadow-2xl photo-hover"
              style={{ boxShadow: '0 30px 80px rgba(16,185,129,0.2), 0 0 0 4px rgba(16,185,129,0.15)' }}
            >
              <img
                src={FEATURED.src}
                alt={FEATURED.caption}
                className="w-full h-[360px] md:h-[460px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.92), rgba(5,150,105,0.92))' }}
              >
                <p className="font-heading text-white text-lg md:text-xl italic">
                  Mariage Coutumier · Blinda &amp; Elvis 🌿
                </p>
                <span className="inline-flex items-center gap-1.5 text-white/90 text-xs font-body uppercase tracking-widest">
                  <ZoomIn size={14} /> Agrandir
                </span>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              className="absolute top-5 left-5 inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Leaf size={14} className="text-sage" />
              <span className="font-body text-xs font-bold uppercase tracking-wider text-wed-dark">
                Babadjou · 13 Juin
              </span>
            </motion.div>
          </motion.div>

          {/* Thumbnails grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[200px]">
            {thumbnails.map((photo, i) => (
              <motion.div
                key={i}
                className="relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={inView2 ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                onClick={() => openLightbox(i + 1)}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-wed-dark/70 via-wed-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4">
                  <ZoomIn size={22} className="text-white mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                  <p className="text-white text-xs font-heading italic text-center leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {photo.caption}
                  </p>
                </div>

                <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-sage/0 group-hover:border-sage/70 transition-colors duration-300 rounded-tr-sm" />
                <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-sage/0 group-hover:border-sage/70 transition-colors duration-300 rounded-bl-sm" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom text */}
        <motion.p
          className="text-center mt-10 font-heading italic text-wed-text/40 text-sm"
          initial={{ opacity: 0 }}
          animate={inView2 ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          ✦ Cliquez sur une photo pour revivre ce moment ✦
        </motion.p>
      </div>

      {lightbox !== null && (
        <LightBox
          photos={PHOTOS}
          index={lightbox}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </section>
  );
}

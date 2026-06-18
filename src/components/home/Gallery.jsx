import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

import photo1 from '../../assets/images/photo-1.jpeg';
import photo2 from '../../assets/images/photo-2.jpeg';
import photo3 from '../../assets/images/photo-3.jpeg';
import bague from '../../assets/images/bague.jpeg';
import pagne1 from '../../assets/images/pagne-1.jpeg';
import pagne2 from '../../assets/images/pagne-2.jpeg';
import pagneDos from '../../assets/images/pagne-dos.jpeg';
import joggingAssis from '../../assets/images/jogging-assis.jpeg';
import joggingPied from '../../assets/images/jogging-pied.jpeg';
import couronne from '../../assets/images/couronne.jpeg';
import saveTheDate from '../../assets/images/save-the-date.jpeg';

const PHOTOS = [
  { src: couronne, caption: 'Une couronne d\'amour ✨' },
  { src: photo1, caption: 'Notre complicité 💙' },
  { src: pagne1, caption: 'Les couleurs de notre bonheur 💛' },
  { src: photo2, caption: 'Ensemble pour l\'éternité 🤍' },
  { src: pagneDos, caption: 'Toujours l\'un pour l\'autre 🌿' },
  { src: photo3, caption: 'Notre histoire d\'amour 💜' },
  { src: pagne2, caption: 'La grâce et l\'élégance 💙' },
  { src: joggingPied, caption: 'La complicité au quotidien ⚽' },
  { src: joggingAssis, caption: 'Des moments simples et précieux 🌸' },
  { src: bague, caption: 'La promesse d\'une vie 💍' },
  { src: saveTheDate, caption: 'Save the Date · Toutes les infos clés 📅' },
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
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-wed-dark/90 lightbox-overlay"
          onClick={onClose}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          >
            <X size={28} />
          </button>

          {/* Image */}
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

          {/* Caption */}
          <motion.p
            key={`cap-${index}`}
            className="mt-4 font-heading italic text-white/80 text-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {photos[index].caption}
          </motion.p>

          {/* Navigation */}
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

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  const openLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const prevPhoto = () => setLightbox((p) => (p - 1 + PHOTOS.length) % PHOTOS.length);
  const nextPhoto = () => setLightbox((p) => (p + 1) % PHOTOS.length);

  return (
    <section id="galerie" className="py-24 px-4 bg-cream relative overflow-hidden">
      {/* Background ornaments */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold-wed/30 to-transparent" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div ref={ref} className="text-center mb-14">
          <motion.span
            className="inline-block bg-sky-wed/20 text-sky-wed-dark text-xs uppercase tracking-[0.25em] px-4 py-1.5 rounded-full font-body mb-4"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
          >
            📸 Notre Galerie
          </motion.span>
          <motion.h2
            className="section-title mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
          >
            Des Moments Précieux
          </motion.h2>
          <motion.span
            className="section-subtitle"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            Notre histoire en images
          </motion.span>
        </div>

        {/* Mosaïque responsive — chaque photo garde ses proportions réelles, rien n'est coupé */}
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 md:gap-4">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={i}
              className="break-inside-avoid mb-3 md:mb-4 relative group cursor-pointer overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.5) }}
              onClick={() => openLightbox(i)}
              whileHover={{ scale: 1.02 }}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-auto block transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-wed-dark/70 via-wed-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4">
                <ZoomIn size={24} className="text-white mb-2 transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300" />
                <p className="text-white text-xs font-heading italic text-center leading-tight transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                  {photo.caption}
                </p>
              </div>

              {/* Gold corner accent */}
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-gold-wed/0 group-hover:border-gold-wed/60 transition-colors duration-300 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-gold-wed/0 group-hover:border-gold-wed/60 transition-colors duration-300 rounded-bl-sm" />
            </motion.div>
          ))}
        </div>

        {/* Bottom text */}
        <motion.p
          className="text-center mt-10 font-heading italic text-wed-text/40 text-sm"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          ✦ Cliquez sur une photo pour l'agrandir ✦
        </motion.p>
      </div>

      {/* Lightbox */}
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

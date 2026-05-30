import { motion } from 'framer-motion';
import { useMemo } from 'react';

const PETAL_COLORS = ['#7EC8E3', '#C9A96E', '#F9D7E3', '#EDD9A3', '#8FAE8B', '#B8E0ED'];

function Petal({ id }) {
  const style = useMemo(() => ({
    left: `${5 + (id * 7.3) % 90}%`,
    top: '-60px',
    width: 10 + (id * 3) % 18,
    height: 10 + (id * 3) % 18,
    color: PETAL_COLORS[id % PETAL_COLORS.length],
    duration: 9 + (id * 1.7) % 8,
    delay: (id * 0.7) % 6,
    drift: -20 + (id * 8) % 40,
    rotation: 180 + (id * 47) % 360,
    opacity: 0.5 + (id * 0.07) % 0.5,
  }), [id]);

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: style.left, top: style.top, width: style.width, height: style.height }}
      initial={{ top: '-60px', x: 0, rotate: 0, opacity: style.opacity }}
      animate={{
        top: '110vh',
        x: style.drift,
        rotate: style.rotation,
        opacity: [style.opacity, style.opacity, 0],
      }}
      transition={{
        duration: style.duration,
        delay: style.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <svg viewBox="0 0 40 40" fill={style.color} className="w-full h-full petal-svg">
        <ellipse cx="20" cy="20" rx="8" ry="18" transform="rotate(0 20 20)" opacity="0.8" />
        <ellipse cx="20" cy="20" rx="8" ry="18" transform="rotate(60 20 20)" opacity="0.7" />
        <ellipse cx="20" cy="20" rx="8" ry="18" transform="rotate(120 20 20)" opacity="0.6" />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.6" />
      </svg>
    </motion.div>
  );
}

export default function FloatingPetals({ count = 18 }) {
  const petalIds = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {petalIds.map((id) => <Petal key={id} id={id} />)}
    </div>
  );
}

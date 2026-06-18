import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { href: '#accueil', label: 'Accueil' },
  { href: '#dot', label: 'La Dot' },
  { href: '#programme', label: 'Programme' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#code-vestimentaire', label: 'Pagne' },
  { href: '#rsvp', label: 'Réserver ma place' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = NAV_LINKS.map(l => l.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top < 120) {
          setActive(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (e, href) => {
    e.preventDefault();
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.08), 0 1px 0 rgba(245,158,11,0.2)' : 'none',
          paddingTop: scrolled ? '12px' : '20px',
          paddingBottom: scrolled ? '12px' : '20px',
        }}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <a
            href={isHome ? '#accueil' : '/'}
            onClick={isHome ? e => scrollTo(e, '#accueil') : undefined}
            className="flex items-center gap-2 group"
          >
            <span
              className="font-script text-4xl leading-none transition-all duration-300"
              style={{
                color: scrolled ? '#D97706' : '#FDE68A',
                textShadow: scrolled ? '0 0 20px rgba(245,158,11,0.3)' : '0 0 30px rgba(245,158,11,0.7)',
              }}
            >
              B & E
            </span>
            <Heart
              size={12}
              className="text-petal fill-petal animate-heartbeat"
              style={{ filter: 'drop-shadow(0 0 4px rgba(251,113,133,0.7))' }}
            />
          </a>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-5">
            {isHome && NAV_LINKS.map(link => {
              const id = link.href.slice(1);
              const isActive = active === id;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={e => scrollTo(e, link.href)}
                  className="relative font-body text-xs uppercase tracking-[0.2em] transition-all duration-300 group"
                  style={{
                    color: scrolled
                      ? (isActive ? '#D97706' : '#374151')
                      : (isActive ? '#FDE68A' : 'rgba(255,255,255,0.75)'),
                    fontWeight: isActive ? '700' : '400',
                  }}
                >
                  {link.label}
                  {/* Active underline */}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full transition-all duration-300 origin-center"
                    style={{
                      background: 'linear-gradient(90deg, #F59E0B, #0EA5E9)',
                      transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                      boxShadow: isActive ? '0 0 8px rgba(245,158,11,0.5)' : 'none',
                    }}
                  />
                  {/* Hover underline */}
                  <span
                    className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    style={{
                      background: 'linear-gradient(90deg, #F59E0B80, #0EA5E980)',
                    }}
                  />
                </a>
              );
            })}
          </div>

          {/* Mobile button */}
          <button
            className="lg:hidden p-2 rounded-lg transition-all duration-200"
            style={{ color: scrolled ? '#374151' : 'white' }}
            onClick={() => setOpen(p => !p)}
            aria-label="Menu"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-wed-dark/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              className="absolute top-0 right-0 h-full w-72 flex flex-col pt-24 pb-12 px-8"
              style={{
                background: 'linear-gradient(180deg, #1E1B4B, #0f0f2e)',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
              }}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <span className="font-script text-5xl text-gold-wed mb-8 block" style={{ textShadow: '0 0 30px rgba(245,158,11,0.5)' }}>
                Menu
              </span>
              {/* Separator */}
              <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, #F59E0B40, transparent)' }} />
              <div className="flex flex-col gap-5">
                {isHome && NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={e => scrollTo(e, link.href)}
                    className="font-heading text-xl text-white/70 hover:text-gold-wed transition-colors flex items-center gap-3 group"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-wed/40 group-hover:bg-gold-wed transition-colors" />
                    {link.label}
                  </motion.a>
                ))}
              </div>
              <div className="mt-auto">
                <p className="font-script text-3xl text-gold-wed/50 mb-1">Blinda & Elvis</p>
                <p className="text-xs text-white/30">20 Juin 2026</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

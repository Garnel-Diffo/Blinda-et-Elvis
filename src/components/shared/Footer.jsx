import { motion } from 'framer-motion';
import { Heart, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-wed-dark text-white/80 pt-16 pb-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Couple */}
          <div className="text-center">
            <p className="font-script text-5xl text-gold-wed mb-3">Blinda & Elvis</p>
            <p className="text-white/50 text-sm font-body">
              Le Jardin de Paix et de Joie
            </p>
            <p className="text-gold-wed/70 text-sm mt-1 font-heading italic">
              20 Juin 2026
            </p>
          </div>

          {/* Links */}
          <div className="text-center">
            <h4 className="font-heading text-lg text-white/90 mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm font-body">
              {[
                { href: '#accueil', label: 'Accueil' },
                { href: '#dot', label: 'La Dot' },
                { href: '#programme', label: 'Programme' },
                { href: '#galerie', label: 'Galerie' },
                { href: '#code-vestimentaire', label: 'Code vestimentaire' },
                { href: '#rsvp', label: 'Réserver ma place' },
              ].map(
                ({ href, label }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-white/60 hover:text-gold-wed transition-colors"
                    >
                      {label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Dev info */}
          <div className="text-center">
            <h4 className="font-heading text-lg text-white/90 mb-4">Conception & Développement</h4>
            <div className="space-y-3 text-sm font-body">
              <p className="text-white/80 font-semibold">Ing. Garnel DIFFO</p>
              <a
                href="https://wa.me/237674318296"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white/60 hover:text-gold-wed transition-colors"
              >
                <Phone size={14} />
                +237 674 318 296
              </a>
              <a
                href="mailto:diffogarnel@gmail.com"
                className="flex items-center justify-center gap-2 text-white/60 hover:text-gold-wed transition-colors"
              >
                <Mail size={14} />
                diffogarnel@gmail.com
              </a>
              <motion.a
                href="https://wa.me/237674318296"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-1 px-5 py-2.5 rounded-full font-body font-semibold text-sm text-white"
                style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.35)' }}
                whileHover={{ scale: 1.06, boxShadow: '0 6px 28px rgba(37,211,102,0.55)' }}
                whileTap={{ scale: 0.96 }}
              >
                <WhatsAppIcon size={18} />
                Nous contacter
              </motion.a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40 font-body">
          <p>
            © {year} Blinda & Elvis · Tous droits réservés
          </p>
          <p className="flex items-center gap-1">
            Fait avec <Heart size={12} className="text-petal fill-petal mx-1" /> par{' '}
            <span className="text-gold-wed/70 ml-1">Ing. Garnel DIFFO</span>
          </p>
          <Link
            to="/admin"
            className="text-white/20 hover:text-white/50 transition-colors flex items-center gap-1"
          >
            Admin <ExternalLink size={10} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

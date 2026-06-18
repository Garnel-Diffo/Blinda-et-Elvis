import { motion } from 'framer-motion';
import { Heart, Mail, Phone, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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

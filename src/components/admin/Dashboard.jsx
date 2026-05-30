import { motion } from 'framer-motion';
import { Users, Ticket, Download, Heart, Calendar, Clock } from 'lucide-react';

const CARDS = [
  {
    id: 'guests',
    title: 'Liste des Invités',
    desc: 'Gérer les confirmations, rechercher et exporter les données en Excel',
    icon: Users,
    color: 'from-sky-wed/20 to-sky-wed/5',
    iconBg: 'bg-sky-wed text-white',
    border: 'border-sky-wed/30',
  },
  {
    id: 'tickets',
    title: 'Générateur de Billets',
    desc: 'Créer et télécharger les billets PDF personnalisés avec les noms des invités',
    icon: Ticket,
    color: 'from-gold-wed/20 to-gold-wed/5',
    iconBg: 'bg-gold-wed text-white',
    border: 'border-gold-wed/30',
  },
];

const TIMELINE = [
  { time: '08h30', event: 'Mariage Civil', emoji: '🤍' },
  { time: '14h30', event: 'Bénédiction Nuptiale', emoji: '⛪' },
  { time: '20h00', event: 'Grande Soirée Festive', emoji: '🎉' },
];

export default function Dashboard({ onNavigate, guestCount }) {
  const weddingDate = new Date('2026-06-20T08:30:00');
  const now = new Date();
  const diffDays = Math.ceil((weddingDate - now) / 86400000);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative bg-gradient-to-r from-wed-dark to-[#1a1a2e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-wed/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-sky-wed/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        <div className="relative z-10">
          <p className="font-script text-5xl text-gold-wed mb-2">Blinda & Elvis</p>
          <p className="font-heading text-white/80 text-lg mb-1">🌿 Le Jardin de Paix et de Joie ✨</p>
          <p className="font-body text-white/50 text-sm">20 Juin 2026 · Administration du mariage</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Invités confirmés',
            value: guestCount,
            icon: Users,
            color: 'text-sky-wed',
            bg: 'bg-sky-wed/10',
          },
          {
            label: 'Jours restants',
            value: Math.max(0, diffDays),
            icon: Calendar,
            color: 'text-gold-wed',
            bg: 'bg-gold-wed/10',
          },
          {
            label: 'Date du mariage',
            value: '20 Juin',
            icon: Heart,
            color: 'text-rose-400',
            bg: 'bg-rose-50',
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={stat.color} />
              </div>
              <div>
                <p className={`font-heading text-3xl ${stat.color}`}>{stat.value}</p>
                <p className="font-body text-wed-text/60 text-xs">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-heading text-xl text-wed-dark mb-4">Gestion du Mariage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`text-left bg-gradient-to-br ${card.color} border ${card.border} rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon size={22} />
                </div>
                <h3 className="font-heading text-xl text-wed-dark mb-2">{card.title}</h3>
                <p className="font-body text-wed-text/60 text-sm leading-relaxed">{card.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-gold-wed text-xs font-body font-bold uppercase tracking-wider">
                  Accéder →
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Programme */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-heading text-xl text-wed-dark mb-5 flex items-center gap-2">
          <Clock size={18} className="text-gold-wed" />
          Programme du 20 Juin 2026
        </h2>
        <div className="space-y-3">
          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.time}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gold-wed/5 transition-colors"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="font-body font-bold text-wed-dark text-sm">{item.event}</p>
              </div>
              <span className="font-heading text-xl text-gold-wed font-semibold">{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-gold-wed/5 border border-gold-wed/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">💡</span>
          <div>
            <p className="font-heading text-lg text-wed-dark mb-1">Guide d'utilisation</p>
            <ul className="space-y-1.5 font-body text-wed-text/70 text-sm">
              <li>📋 <strong>Liste des invités</strong> : Voir tous les confirmés, rechercher, exporter en Excel</li>
              <li>🎫 <strong>Générateur de billets</strong> : Uploadez un template, dessinez le cadre du nom, générez les PDFs</li>
              <li>💾 Cliquez <strong>"Tous les billets (ZIP)"</strong> pour télécharger tous les billets en une fois</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

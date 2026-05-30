import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Ticket, LogOut, Menu, X, Heart, ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { id: 'guests', label: 'Liste des invités', icon: Users },
  { id: 'tickets', label: 'Générateur de billets', icon: Ticket },
];

function SidebarItem({ item, active, onClick }) {
  const Icon = item.icon;
  const isActive = active === item.id;
  return (
    <motion.button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
        isActive
          ? 'bg-gold-wed text-white shadow-lg shadow-gold-wed/30'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
      whileHover={{ x: isActive ? 0 : 4 }}
      whileTap={{ scale: 0.97 }}
    >
      <Icon size={18} />
      <span className="flex-1 text-left">{item.label}</span>
      {isActive && <ChevronRight size={14} />}
    </motion.button>
  );
}

export default function AdminLayout({ children, activeTab, onTabChange, onLogout, stats }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <p className="font-script text-4xl text-gold-wed mb-1">B & E</p>
        <p className="font-body text-white/30 text-[10px] uppercase tracking-[0.2em]">
          Administration
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="font-body text-white/20 text-[10px] uppercase tracking-[0.2em] px-4 mb-2">
          Navigation
        </p>
        {NAV_ITEMS.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            active={activeTab}
            onClick={(id) => {
              onTabChange(id);
              setMobileOpen(false);
            }}
          />
        ))}
      </nav>

      {/* Stats preview */}
      {stats !== undefined && (
        <div className="m-4 p-4 bg-white/5 border border-white/10 rounded-xl">
          <p className="font-body text-white/40 text-xs uppercase tracking-wider mb-2">Invités confirmés</p>
          <p className="font-heading text-3xl text-gold-wed">{stats}</p>
          <p className="font-body text-white/30 text-xs">personnes inscrites</p>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <Heart size={16} />
          <span>Voir le site</span>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f0f0f7] overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col admin-sidebar flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-wed-dark/50 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute inset-y-0 left-0 w-72 admin-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <button
                className="absolute top-4 right-4 text-white/50 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div>
              <h1 className="font-heading text-xl text-wed-dark">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Administration'}
              </h1>
              <p className="font-body text-wed-text/50 text-xs hidden sm:block">
                Mariage Blinda & Elvis · 20 Juin 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-body text-emerald-700 text-xs">Connecté</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

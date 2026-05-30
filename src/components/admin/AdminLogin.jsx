import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { adminLogin } from '../../utils/api';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('Veuillez entrer le mot de passe'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await adminLogin(password);
      localStorage.setItem('admin_token', data.token);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wed-dark via-wed-dark/95 to-[#1a1a2e] flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-script text-6xl text-gold-wed text-shadow-gold mb-2">B & E</p>
          <p className="font-body text-white/40 text-xs uppercase tracking-[0.3em]">
            Administration
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gold-wed/20 border border-gold-wed/30 mx-auto mb-6">
            <Lock size={24} className="text-gold-wed" />
          </div>
          <h1 className="font-heading text-2xl text-white text-center mb-1">
            Espace Administrateur
          </h1>
          <p className="font-body text-white/40 text-xs text-center mb-8">
            Mariage Blinda & Elvis · 20 Juin 2026
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block font-body text-sm text-white/60 font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••••••"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/20 rounded-xl px-4 py-3 pr-10 font-body text-sm focus:outline-none focus:border-gold-wed focus:ring-2 focus:ring-gold-wed/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow((p) => !p)}
                  className="absolute right-3 inset-y-0 flex items-center text-white/40 hover:text-white/70 transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />
                <p className="font-body text-rose-400 text-sm">{error}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-wed hover:bg-gold-wed-dark text-white font-body font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm uppercase tracking-widest"
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <><Loader size={16} className="animate-spin" /> Connexion...</>
              ) : (
                'Se connecter'
              )}
            </motion.button>
          </form>
        </div>

        <p className="text-center mt-6 font-body text-white/20 text-xs">
          Conception & développement par{' '}
          <span className="text-gold-wed/50">Garnel DIFFO</span>
        </p>
      </motion.div>
    </div>
  );
}

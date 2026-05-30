import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Trash2, Users, RefreshCw, AlertTriangle, X,
  ChevronUp, ChevronDown, Phone, Mail, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getReservations, deleteReservation, exportExcel } from '../../utils/api';
import { saveAs } from 'file-saver';

function ConfirmModal({ guest, onConfirm, onCancel }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-wed-dark/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <div>
            <h3 className="font-heading text-lg text-wed-dark">Confirmer la suppression</h3>
            <p className="font-body text-wed-text/60 text-sm">Cette action est irréversible</p>
          </div>
        </div>
        <p className="font-body text-wed-text text-sm mb-6">
          Supprimer <strong>{guest.prenom} {guest.nom}</strong> de la liste des invités ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-body text-sm font-bold transition-colors"
          >
            Supprimer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GuestList({ onCountChange }) {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [sortField, setSortField] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getReservations(debouncedSearch);
      setGuests(data);
      if (!debouncedSearch && onCountChange) onCountChange(data.length);
    } catch (err) {
      toast.error('Erreur lors du chargement des invités');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete.id);
    setConfirmDelete(null);
    try {
      await deleteReservation(confirmDelete.id);
      setGuests((p) => p.filter((g) => g.id !== confirmDelete.id));
      toast.success(`${confirmDelete.prenom} ${confirmDelete.nom} supprimé(e)`);
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportExcel();
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const now = new Date().toISOString().slice(0, 10);
      saveAs(blob, `invites-blinda-elvis-${now}.xlsx`);
      toast.success('Fichier Excel téléchargé !');
    } catch (err) {
      toast.error('Erreur lors de l\'export Excel');
    } finally {
      setExporting(false);
    }
  };

  // Client-side sort
  const sorted = [...guests].sort((a, b) => {
    let va = a[sortField] || '';
    let vb = b[sortField] || '';
    if (sortField === 'created_at') {
      va = new Date(va);
      vb = new Date(vb);
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={14} className="text-gold-wed" />
      : <ChevronDown size={14} className="text-gold-wed" />;
  };

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total invités', value: guests.length, icon: Users, color: 'bg-sky-wed/10 text-sky-wed-dark border-sky-wed/20' },
          { label: 'Avec téléphone', value: guests.filter((g) => g.telephone).length, icon: Phone, color: 'bg-gold-wed/10 text-gold-wed-dark border-gold-wed/20' },
          { label: 'Avec email', value: guests.filter((g) => g.email).length, icon: Mail, color: 'bg-sage/20 text-green-700 border-sage/40' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`bg-white border rounded-xl p-4 flex items-center gap-4 ${stat.color}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="font-heading text-2xl text-wed-dark">{stat.value}</p>
                <p className="font-body text-xs text-wed-text/60">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, prénom, email ou téléphone..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl font-body text-sm text-wed-text focus:outline-none focus:border-gold-wed focus:ring-2 focus:ring-gold-wed/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={fetchGuests}
              className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
              title="Actualiser"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || guests.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-body text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              <span className="hidden sm:inline">Excel</span>
            </button>
          </div>
        </div>

        {debouncedSearch && (
          <p className="mt-2 font-body text-xs text-wed-text/50">
            {guests.length} résultat(s) pour « {debouncedSearch} »
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={28} className="animate-spin text-gold-wed" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={48} className="text-gray-200 mb-4" />
            <p className="font-heading text-xl text-gray-400">Aucun invité trouvé</p>
            <p className="font-body text-gray-300 text-sm mt-1">
              {debouncedSearch ? 'Essayez une autre recherche' : 'Les inscriptions s\'afficheront ici'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 w-12">
                    <span className="font-body text-xs text-gray-400 uppercase tracking-wider">#</span>
                  </th>
                  {[
                    { key: 'prenom', label: 'Prénom' },
                    { key: 'nom', label: 'Nom' },
                    { key: 'telephone', label: 'Téléphone' },
                    { key: 'email', label: 'Email' },
                    { key: 'created_at', label: 'Date' },
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="text-left px-4 py-3 cursor-pointer group"
                      onClick={() => toggleSort(key)}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-body text-xs text-gray-400 uppercase tracking-wider group-hover:text-gold-wed transition-colors">
                          {label}
                        </span>
                        <SortIcon field={key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {sorted.map((guest, i) => (
                    <motion.tr
                      key={guest.id}
                      className="border-b border-gray-50 hover:bg-gold-wed/3 transition-colors group"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    >
                      <td className="px-4 py-3">
                        <span className="font-body text-xs text-gray-300">{i + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-sm text-wed-text font-medium">{guest.prenom}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-sm text-wed-text font-bold uppercase">{guest.nom}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-sm text-wed-text/70">{guest.telephone || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-sm text-wed-text/70">{guest.email || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-body text-xs text-gray-400">
                          {new Date(guest.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setConfirmDelete(guest)}
                          disabled={deleting === guest.id}
                          className="p-2 rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                          title="Supprimer"
                        >
                          {deleting === guest.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmModal
            guest={confirmDelete}
            onConfirm={handleDelete}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import AdminLogin from '../components/admin/AdminLogin';
import AdminLayout from '../components/admin/AdminLayout';
import GuestList from '../components/admin/GuestList';
import TicketGenerator from '../components/admin/TicketGenerator';
import Dashboard from '../components/admin/Dashboard';
import { adminVerify, getReservations } from '../utils/api';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [guestCount, setGuestCount] = useState(0);

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setChecking(false); return; }
    adminVerify()
      .then(() => {
        setAuthed(true);
        // Load guest count
        getReservations().then(({ data }) => setGuestCount(data.length)).catch(() => {});
      })
      .catch(() => {
        localStorage.removeItem('admin_token');
      })
      .finally(() => setChecking(false));
  }, []);

  const refreshCount = () => {
    getReservations().then(({ data }) => setGuestCount(data.length)).catch(() => {});
  };

  const handleLoginSuccess = () => {
    setAuthed(true);
    setTimeout(refreshCount, 300);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setAuthed(false);
    setActiveTab('dashboard');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-wed-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gold-wed border-t-transparent animate-spin" />
          <p className="font-script text-3xl text-gold-wed">B & E</p>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <>
        <AdminLogin onSuccess={handleLoginSuccess} />
        <Toaster position="top-right" />
      </>
    );
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') refreshCount();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'guests': return <GuestList onCountChange={setGuestCount} />;
      case 'tickets': return <TicketGenerator />;
      default: return <Dashboard onNavigate={handleTabChange} guestCount={guestCount} />;
    }
  };

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
        stats={guestCount}
      >
        {renderContent()}
      </AdminLayout>
      <Toaster position="top-right" toastOptions={{ className: 'font-body text-sm' }} />
    </>
  );
}

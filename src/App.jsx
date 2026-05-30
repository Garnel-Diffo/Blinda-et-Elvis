import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-body text-sm shadow-lg',
          style: {
            border: '1px solid rgba(201, 169, 110, 0.2)',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#C9A96E', secondary: 'white' } },
        }}
      />
    </>
  );
}

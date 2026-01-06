
import React, { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import { ViewMode } from './types';
import { School, ShieldCheck } from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewMode>('form');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Password hardcoded sederhana (sebaiknya gunakan auth provider Supabase di production)
    if (password === 'admin123') {
      setView('admin');
      setPassword('');
    } else {
      alert('Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('form')}>
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <School size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight text-indigo-900">SPMB <span className="text-indigo-600">Online</span></span>
          </div>
          <button 
            onClick={() => setView(view === 'form' ? 'login' : 'form')}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition"
          >
            <ShieldCheck size={18} />
            {view === 'admin' ? 'Mode Siswa' : 'Login Admin'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center">
        
        {view === 'form' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <RegistrationForm />
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-sm mx-auto w-full bg-white p-8 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
              <p className="text-gray-500 text-sm">Masukkan password untuk melihat data.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                placeholder="Password (admin123)" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-200 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg">
                Masuk Dashboard
              </button>
              <button type="button" onClick={() => setView('form')} className="w-full text-gray-500 text-sm py-2 hover:text-gray-800">
                Kembali ke Form
              </button>
            </form>
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-in fade-in duration-500">
            <AdminDashboard onLogout={() => setView('form')} />
          </div>
        )}

      </main>
      
      <footer className="text-center py-6 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Sistem Penerimaan Murid Baru.
      </footer>
    </div>
  );
}

export default App;

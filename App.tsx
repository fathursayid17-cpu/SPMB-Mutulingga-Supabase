
import React, { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import { ViewMode } from './types';
import { School, ShieldCheck, ArrowLeft } from 'lucide-react';

function App() {
  const [view, setView] = useState<ViewMode>('form');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, verify this against Supabase or an ENV variable
    if (password === 'admin123') {
      setView('admin');
      setPassword('');
    } else {
      alert('Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('form')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <School size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-indigo-950 leading-none">SPMB <span className="text-indigo-600">Online</span></h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">Penerimaan Siswa Baru</p>
            </div>
          </div>
          <button 
            onClick={() => setView(view === 'form' ? 'login' : 'form')}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
          >
            {view === 'admin' ? (
              <>
                <ArrowLeft size={16} /> Mode Siswa
              </>
            ) : (
              <>
                <ShieldCheck size={16} /> Login Admin
              </>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        
        {view === 'form' && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-500 slide-in-from-bottom-4">
            <RegistrationForm />
          </div>
        )}

        {view === 'login' && (
          <div className="max-w-sm mx-auto w-full bg-white p-8 rounded-3xl shadow-2xl shadow-indigo-100 border border-white animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
              <p className="text-gray-500 text-sm mt-1">Masukkan password untuk mengelola data pendaftar.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <input 
                  type="password" 
                  placeholder="Password..." 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-[0.98]">
                Masuk Dashboard
              </button>
              <button type="button" onClick={() => setView('form')} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition">
                Batal
              </button>
            </form>
          </div>
        )}

        {view === 'admin' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminDashboard onLogout={() => setView('form')} />
          </div>
        )}

      </main>
      
      <footer className="text-center py-6 text-gray-400 text-sm border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <p>&copy; {new Date().getFullYear()} Sistem Penerimaan Murid Baru. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

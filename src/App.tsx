import React, { useState } from 'react';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import { ViewMode } from './types';
import { School, ShieldCheck, ArrowLeft, Sparkles, GraduationCap, LayoutDashboard } from 'lucide-react';

function App() {
  // Default view is landing page
  const [view, setView] = useState<ViewMode>('landing');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setView('admin');
      setPassword('');
    } else {
      alert('Password salah!');
    }
  };

  // --- LANDING PAGE COMPONENT ---
  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-6 w-full relative z-10 flex flex-col items-center">
          
          {/* Logo Placeholder */}
          <div className="w-24 h-24 bg-slate-800/50 rounded-3xl border border-slate-700 mb-8 flex items-center justify-center shadow-2xl backdrop-blur-sm">
             <School size={48} className="text-gray-400" />
          </div>

          {/* Typography */}
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white mb-0 leading-none text-center">
            SPMB
          </h1>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-[#991b1b] mb-4 leading-none text-center drop-shadow-sm">
            MUTULINGGA
          </h1>
          
          <p className="text-slate-400 tracking-[0.2em] font-medium text-sm md:text-base mb-16 text-center">
            THE FUTURE STARTS HERE. <span className="text-red-600 font-bold">#REALSIGMA</span>
          </p>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* DAFTAR CARD */}
            <button 
              onClick={() => setView('form')}
              className="group text-left bg-[#131b2e] border border-slate-800 p-8 rounded-[32px] hover:border-indigo-600 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20 active:scale-[0.98]"
            >
              <h3 className="text-3xl font-black italic text-white mb-2">DAFTAR INDEN</h3>
              <p className="text-xs text-slate-400 font-medium mb-8 tracking-wide leading-relaxed max-w-[80%]">
                AMANKAN KURSI & UNLOCK PROFILE ANALYSIS BERBASIS AI.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-[#1e293b] px-5 py-3 rounded-full border border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-colors">
                <span className="text-xs font-bold tracking-widest text-red-500 group-hover:text-white">GAS DAFTAR</span>
                <Sparkles size={14} className="text-red-500 group-hover:text-white" />
              </div>
            </button>

            {/* ADMIN CARD */}
            <button 
              onClick={() => setView('login')}
              className="group text-left bg-[#131b2e] border border-slate-800 p-8 rounded-[32px] hover:border-slate-600 transition-all duration-300 hover:shadow-2xl active:scale-[0.98]"
            >
              <h3 className="text-3xl font-black italic text-white mb-2">PORTAL ADMIN</h3>
              <p className="text-xs text-slate-400 font-medium mb-8 tracking-wide leading-relaxed max-w-[80%]">
                DATABASE MANAGEMENT & EMIS INTEGRATION PANEL.
              </p>
              
              <div className="inline-flex items-center gap-2 bg-[#1e293b] px-5 py-3 rounded-full border border-slate-700 group-hover:bg-slate-700 transition-colors">
                <span className="text-xs font-bold tracking-widest text-slate-300">ACCESS SYSTEM</span>
                <LayoutDashboard size={14} className="text-slate-300" />
              </div>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 text-[10px] text-slate-600 tracking-widest">
           &copy; {new Date().getFullYear()} MUTULINGGA DIGITAL SYSTEM
        </div>
      </div>
    );
  }

  // --- INTERNAL APP LAYOUT (Form & Admin) ---
  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white font-sans text-slate-800">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <School size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-indigo-950 leading-none">SPMB <span className="text-indigo-600">Online</span></h1>
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">MTs Muhammadiyah 01</p>
            </div>
          </div>
          
          <div className="flex gap-2">
             {view === 'admin' ? (
                <button 
                  onClick={() => setView('form')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} /> Mode Siswa
                </button>
             ) : (
                <button 
                  onClick={() => setView('landing')}
                  className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} /> Kembali
                </button>
             )}
          </div>
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
              <button type="button" onClick={() => setView('landing')} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition">
                Batal
              </button>
            </form>
          </div>
        )}

        {view === 'admin' && (
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AdminDashboard onLogout={() => setView('landing')} />
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
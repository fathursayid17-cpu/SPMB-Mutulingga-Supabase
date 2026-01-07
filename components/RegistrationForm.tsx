
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pendaftar } from '../types';
import { Save, Loader2, Send, CheckCircle, AlertCircle } from 'lucide-react';

const RegistrationForm = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState<Pendaftar>({
    nama_lengkap: '',
    nisn: '',
    alamat: '',
    no_whatsapp: '',
    asal_sekolah: '',
    jurusan: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errorMsg) setErrorMsg('');
  };

  const validateForm = () => {
    if (formData.nisn.length < 10) return "NISN harus 10 digit angka.";
    if (!/^\d+$/.test(formData.nisn)) return "NISN hanya boleh berisi angka.";
    if (formData.no_whatsapp.length < 10) return "Nomor WhatsApp tidak valid.";
    if (!/^\d+$/.test(formData.no_whatsapp)) return "Nomor WhatsApp hanya boleh berisi angka.";
    if (!formData.jurusan) return "Silakan pilih jurusan.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('pendaftar')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        nama_lengkap: '', nisn: '', alamat: '', no_whatsapp: '', asal_sekolah: '', jurusan: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gagal mengirim data: ' + (err.message || "Terjadi kesalahan koneksi"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl text-center border border-green-100 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Data Anda telah berhasil disimpan ke dalam sistem kami. Panitia akan segera menghubungi via WhatsApp.
        </p>
        <button 
          onClick={() => setSuccess(false)} 
          className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
        >
          Daftar Siswa Lain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/50">
      <div className="mb-10 text-center">
        <div className="inline-block p-3 bg-indigo-50 rounded-2xl mb-4">
          <Send className="text-indigo-600" size={32} />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Formulir Pendaftaran</h1>
        <p className="text-slate-500 text-lg">Lengkapi data diri calon siswa baru di bawah ini.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 flex items-center gap-3 border border-red-100 shadow-sm">
          <AlertCircle size={20} className="shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Nama Lengkap</label>
            <input 
              required 
              type="text" 
              name="nama_lengkap" 
              value={formData.nama_lengkap} 
              onChange={handleChange} 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400" 
              placeholder="Contoh: Ahmad Dahlan" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">NISN</label>
            <input 
              required 
              type="text" 
              inputMode="numeric"
              name="nisn" 
              value={formData.nisn} 
              onChange={handleChange} 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400" 
              placeholder="10 Digit Angka" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Asal Sekolah</label>
          <input 
            required 
            type="text" 
            name="asal_sekolah" 
            value={formData.asal_sekolah} 
            onChange={handleChange} 
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400" 
            placeholder="Nama SMP/MTs Asal" 
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-slate-700">Pilihan Jurusan</label>
          <div className="relative">
            <select 
              required 
              name="jurusan" 
              value={formData.jurusan} 
              onChange={handleChange} 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
            >
              <option value="">-- Pilih Jurusan Minat --</option>
              <option value="RPL">Rekayasa Perangkat Lunak (RPL)</option>
              <option value="TKJ">Teknik Komputer & Jaringan (TKJ)</option>
              <option value="AKL">Akuntansi Keuangan Lembaga (AKL)</option>
              <option value="OTKP">Otomatisasi Tata Kelola Perkantoran (OTKP)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">No. WhatsApp</label>
            <input 
              required 
              type="tel" 
              inputMode="tel"
              name="no_whatsapp" 
              value={formData.no_whatsapp} 
              onChange={handleChange} 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400" 
              placeholder="08xxxxxxxxxx" 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Alamat Lengkap</label>
            <input 
              required 
              type="text" 
              name="alamat" 
              value={formData.alamat} 
              onChange={handleChange} 
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400" 
              placeholder="Desa, Kecamatan, Kabupaten" 
            />
          </div>
        </div>

        <button 
          disabled={loading} 
          type="submit" 
          className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-500/30 hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.99] text-lg mt-4"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Save size={22} />}
          {loading ? 'Sedang Mengirim...' : 'Kirim Pendaftaran'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;

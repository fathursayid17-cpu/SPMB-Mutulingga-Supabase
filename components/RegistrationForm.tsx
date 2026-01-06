
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pendaftar } from '../types';
import { Save, Loader2, Send } from 'lucide-react';

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Validasi Sederhana
    if (formData.nisn.length < 10) {
      setErrorMsg('NISN harus minimal 10 digit.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('pendaftar')
        .insert([formData]);

      if (error) throw error;

      setSuccess(true);
      setFormData({
        nama_lengkap: '', nisn: '', alamat: '', no_whatsapp: '', asal_sekolah: '', jurusan: ''
      });
    } catch (err: any) {
      setErrorMsg('Gagal mengirim data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl text-center border border-green-100">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600 mb-6">Data Anda telah kami terima. Silakan tunggu informasi selanjutnya via WhatsApp.</p>
        <button onClick={() => setSuccess(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition">
          Daftar Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Formulir SPMB</h1>
        <p className="text-gray-500">Lengkapi data diri Anda dengan benar.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
            <input required type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="Sesuai Ijazah" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">NISN</label>
            <input required type="number" name="nisn" value={formData.nisn} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="10 Digit Angka" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Asal Sekolah</label>
          <input required type="text" name="asal_sekolah" value={formData.asal_sekolah} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="SMP/MTs Asal" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pilihan Jurusan</label>
          <select required name="jurusan" value={formData.jurusan} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition bg-white">
            <option value="">-- Pilih Jurusan --</option>
            <option value="RPL">Rekayasa Perangkat Lunak</option>
            <option value="TKJ">Teknik Komputer & Jaringan</option>
            <option value="AKL">Akuntansi</option>
            <option value="OTKP">Perkantoran</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">No. WhatsApp</label>
            <input required type="tel" name="no_whatsapp" value={formData.no_whatsapp} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap</label>
            <input required type="text" name="alamat" value={formData.alamat} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="Desa, Kec, Kab" />
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
          {loading ? 'Mengirim Data...' : 'Kirim Pendaftaran'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;

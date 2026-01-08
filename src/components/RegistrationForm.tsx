
import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { storageService } from '../services/storageService';
import { analyzeStudentProfile, verifyNISN } from '../services/geminiService';
import { StudentData, FormStep } from '../types';
import FormStepIndicator from './FormStepIndicator';
import { Save, Loader2, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Search, Sparkles, BookOpen, Mic, Atom, Trophy, Upload, Image as ImageIcon } from 'lucide-react';

const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState<FormStep>('inden');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [verifyingNISN, setVerifyingNISN] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Opsi Tahun Ajaran
  const yearOptions = [
    "2026/2027",
    "2027/2028",
    "2028/2029",
    "2029/2030",
    "2030/2031"
  ];

  // Data Program dengan visualisasi Card
  const programOptions = [
    { 
      id: 'Reguler', 
      label: 'Reguler', 
      desc: 'Fullday School', 
      icon: <BookOpen size={24} />, 
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-500 ring-blue-200' 
    },
    { 
      id: 'Tahfidz', 
      label: 'Tahfidz', 
      desc: 'Boarding School', 
      icon: <Mic size={24} />, 
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:border-emerald-500 ring-emerald-200' 
    },
    { 
      id: 'Sains', 
      label: 'Kelas Sains', 
      desc: 'Olimpiade & Riset', 
      icon: <Atom size={24} />, 
      color: 'bg-violet-50 border-violet-200 text-violet-700 hover:border-violet-500 ring-violet-200' 
    },
    { 
      id: 'Olahraga', 
      label: 'Bakat Olahraga', 
      desc: 'Atlet & Prestasi', 
      icon: <Trophy size={24} />, 
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:border-orange-500 ring-orange-200' 
    }
  ];

  const [formData, setFormData] = useState<Partial<StudentData>>({
    // Defaults
    tahunAjaran: yearOptions[0], 
    pilihanProgram: 'Reguler',
    wargaNegara: 'WNI',
    jenisTempatTinggal: 'Orang Tua',
    jarakTempatTinggal: 'Kurang dari 1 km',
    transportasi: 'Jalan Kaki',
    statusKepemilikanRumahOrangTua: 'Milik Sendiri',
    isInden: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleProgramSelect = (programId: string) => {
    setFormData({ ...formData, pilihanProgram: programId });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await storageService.uploadPhoto(e.target.files[0]);
        setFormData({ ...formData, fotoSiswa: url });
      } catch (error: any) {
        alert(error.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (currentStep) {
      case 'inden': setCurrentStep('personal'); break;
      case 'personal': setCurrentStep('address'); break;
      case 'address': setCurrentStep('family'); break;
      case 'family': setCurrentStep('guardian'); break;
      case 'guardian': setCurrentStep('assistance'); break;
      case 'assistance': setCurrentStep('school'); break;
      case 'school': setCurrentStep('review'); break;
    }
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (currentStep) {
      case 'personal': setCurrentStep('inden'); break;
      case 'address': setCurrentStep('personal'); break;
      case 'family': setCurrentStep('address'); break;
      case 'guardian': setCurrentStep('family'); break;
      case 'assistance': setCurrentStep('guardian'); break;
      case 'school': setCurrentStep('assistance'); break;
      case 'review': setCurrentStep('school'); break;
    }
  };

  const handleAIScan = async () => {
    setAnalyzing(true);
    const result = await analyzeStudentProfile(formData);
    setFormData(prev => ({ ...prev, aiAnalysis: result }));
    setAnalyzing(false);
  };

  const handleVerifyNISN = async () => {
    if (!formData.nisn || !formData.namaSiswa) {
      alert("Isi Nama dan NISN dulu ya!");
      return;
    }
    setVerifyingNISN(true);
    const result = await verifyNISN(formData.nisn, formData.namaSiswa);
    alert(result.message);
    setVerifyingNISN(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await dbService.create(formData);
      setSuccess(true);
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
          Data calon siswa <strong>{formData.namaSiswa}</strong> untuk Tahun Ajaran <strong>{formData.tahunAjaran}</strong> telah tersimpan. Panitia PPDB MTs Muhammadiyah 01 Purbalingga akan segera menghubungi.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="w-full bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-500/30"
        >
          Daftar Siswa Lain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <FormStepIndicator currentStep={currentStep} />
      
      <div className="bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
        {/* Header */}
        <div className="mb-8 border-b border-gray-100 pb-4">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {currentStep === 'inden' && 'Pendaftaran Jalur Inden'}
            {currentStep === 'personal' && 'Data Pribadi Siswa'}
            {currentStep === 'address' && 'Alamat & Tempat Tinggal'}
            {currentStep === 'family' && 'Data Orang Tua'}
            {currentStep === 'guardian' && 'Data Wali'}
            {currentStep === 'assistance' && 'Bantuan & Kesejahteraan'}
            {currentStep === 'school' && 'Sekolah Asal'}
            {currentStep === 'review' && 'Review & Analisis AI'}
          </h1>
          <p className="text-slate-500 mt-1">Lengkapi data dengan benar sesuai dokumen resmi (KK/Ijazah).</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} className="shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STEP 1: INDEN */}
          {currentStep === 'inden' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex items-start gap-4">
                <Sparkles className="text-blue-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 text-lg">Jalur Inden</h3>
                  <p className="text-blue-700/80 mt-1">
                    Daftar lebih awal untuk mengamankan kuota dan mendapatkan prioritas penerimaan.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Tahun Ajaran Selection */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Tahun Ajaran Masuk</label>
                   <select 
                    name="tahunAjaran" 
                    value={formData.tahunAjaran} 
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none font-medium bg-white"
                   >
                     {yearOptions.map(year => (
                       <option key={year} value={year}>{year}</option>
                     ))}
                   </select>
                   <p className="text-xs text-gray-500 mt-1">Pilih tahun ajaran sesuai rencana masuk sekolah.</p>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-200"></div>

                {/* Program Selection */}
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-3">Pilihan Program Unggulan</label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {programOptions.map((program) => (
                      <button
                        key={program.id}
                        type="button"
                        onClick={() => handleProgramSelect(program.id)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all duration-200 group outline-none
                          ${formData.pilihanProgram === program.id
                            ? `${program.color} ring-2 ring-offset-2 shadow-lg scale-[1.02]`
                            : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg transition-colors ${formData.pilihanProgram === program.id ? 'bg-white/30' : 'bg-gray-100 text-gray-400 group-hover:bg-white group-hover:text-current'}`}>
                            {program.icon}
                          </div>
                          {formData.pilihanProgram === program.id && (
                            <div className="bg-white/30 p-1 rounded-full">
                              <CheckCircle size={18} className="text-current" />
                            </div>
                          )}
                        </div>
                        <h4 className="font-bold text-lg">{program.label}</h4>
                        <p className="text-xs opacity-80 font-medium mt-1">{program.desc}</p>
                      </button>
                    ))}
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">No Urut Pendaftaran (Jika Ada)</label>
                   <input 
                    type="text" 
                    name="noUrut"
                    value={formData.noUrut || ''} 
                    onChange={handleChange}
                    placeholder="Kosongkan jika belum dapat"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                   />
                </div>
                
                 <label className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition mt-4">
                  <input 
                    type="checkbox" 
                    name="isInden"
                    checked={formData.isInden || false}
                    onChange={(e) => setFormData({...formData, isInden: e.target.checked})}
                    className="w-6 h-6 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block font-bold text-gray-800">Konfirmasi Jalur Inden</span>
                    <span className="text-sm text-gray-500">Centang jika Anda mendaftar untuk tahun ajaran mendatang.</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: PERSONAL */}
          {currentStep === 'personal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
               {/* FOTO UPLOAD SECTION */}
               <div className="md:col-span-2 flex justify-center mb-6">
                 <div className="relative group">
                   <div className="w-32 h-40 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                     {formData.fotoSiswa ? (
                       <img src={formData.fotoSiswa} alt="Foto Siswa" className="w-full h-full object-cover" />
                     ) : (
                       <div className="text-center text-gray-400">
                         {uploading ? <Loader2 className="animate-spin mx-auto" /> : <ImageIcon className="mx-auto mb-1" />}
                         <span className="text-xs">Foto 3x4</span>
                       </div>
                     )}
                   </div>
                   <label className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-3 py-1 rounded-full shadow-md text-xs font-bold cursor-pointer hover:bg-indigo-50 transition whitespace-nowrap border border-indigo-100 flex items-center gap-1">
                     <Upload size={12} />
                     {uploading ? 'Uploading...' : formData.fotoSiswa ? 'Ganti Foto' : 'Upload Foto'}
                     <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                   </label>
                 </div>
               </div>

               <div className="md:col-span-2 space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Nama Lengkap (Sesuai Ijazah SD/MI)</label>
                 <input required type="text" name="namaSiswa" value={formData.namaSiswa || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Huruf Kapital Semua" />
               </div>
               
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">NISN</label>
                 <div className="flex gap-2">
                   <input required type="text" maxLength={10} name="nisn" value={formData.nisn || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="10 Digit Angka" />
                   <button type="button" onClick={handleVerifyNISN} disabled={verifyingNISN} className="bg-indigo-100 text-indigo-700 p-3 rounded-xl hover:bg-indigo-200 transition">
                     {verifyingNISN ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                   </button>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">NIS Lokal</label>
                 <input type="text" name="nisLokal" value={formData.nisLokal || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Kosongkan jika tidak ada" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">NIK (Nomor Induk Kependudukan)</label>
                 <input type="text" maxLength={16} name="nik" value={formData.nik || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="16 Digit dari KK" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Tempat Lahir</label>
                 <input required type="text" name="tempatLahir" value={formData.tempatLahir || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Tanggal Lahir</label>
                 <input required type="date" name="tanggalLahir" value={formData.tanggalLahir || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Jenis Kelamin</label>
                 <select name="jenisKelamin" value={formData.jenisKelamin || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200">
                   <option value="">-- Pilih --</option>
                   <option value="L">Laki-laki</option>
                   <option value="P">Perempuan</option>
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Agama</label>
                 <select name="agama" value={formData.agama || 'Islam'} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200">
                   <option value="Islam">Islam</option>
                   <option value="Kristen">Kristen</option>
                   <option value="Katolik">Katolik</option>
                   <option value="Hindu">Hindu</option>
                   <option value="Buddha">Buddha</option>
                   <option value="Konghucu">Konghucu</option>
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Hobi</label>
                 <input type="text" name="hobi" value={formData.hobi || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Contoh: Membaca, Sepak Bola" />
               </div>

               <div className="flex gap-4">
                 <div className="w-1/2 space-y-2">
                   <label className="block text-sm font-bold text-slate-700">Anak ke-</label>
                   <input type="number" name="anakKe" value={formData.anakKe || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
                 </div>
                 <div className="w-1/2 space-y-2">
                   <label className="block text-sm font-bold text-slate-700">Jml Saudara</label>
                   <input type="number" name="jumlahSaudara" value={formData.jumlahSaudara || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
                 </div>
               </div>
            </div>
          )}

          {/* STEP 3: ADDRESS */}
          {currentStep === 'address' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
               <div className="md:col-span-2 space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Alamat Lengkap (Jalan, RT/RW, Dusun)</label>
                 <textarea required name="alamat" value={formData.alamat || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" rows={3} placeholder="Jl. Raya No.1 RT 01 RW 02" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Desa / Kelurahan</label>
                 <input required type="text" name="desaKelurahan" value={formData.desaKelurahan || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Kecamatan</label>
                 <input required type="text" name="kecamatan" value={formData.kecamatan || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Kabupaten / Kota</label>
                 <input required type="text" name="kabupaten" value={formData.kabupaten || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Provinsi</label>
                 <input required type="text" name="propinsi" value={formData.propinsi || 'Jawa Tengah'} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Kode Pos</label>
                 <input type="text" inputMode="numeric" name="kodePos" value={formData.kodePos || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">No. HP / WhatsApp (Aktif)</label>
                 <input required type="tel" name="nomorTelepon" value={formData.nomorTelepon || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="08xxxxxxxxxx" />
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Jarak Tempat Tinggal</label>
                 <select name="jarakTempatTinggal" value={formData.jarakTempatTinggal} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200">
                   <option value="Kurang dari 1 km">Kurang dari 1 km</option>
                   <option value="Lebih dari 1 km">Lebih dari 1 km</option>
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Transportasi ke Sekolah</label>
                 <select name="transportasi" value={formData.transportasi} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200">
                   <option value="Jalan Kaki">Jalan Kaki</option>
                   <option value="Sepeda">Sepeda</option>
                   <option value="Sepeda Motor">Sepeda Motor</option>
                   <option value="Antar Jemput">Antar Jemput</option>
                   <option value="Angkutan Umum">Angkutan Umum</option>
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="block text-sm font-bold text-slate-700">Waktu Tempuh (Menit)</label>
                 <input type="text" name="jarakTempuh" value={formData.jarakTempuh || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Contoh: 15 menit" />
               </div>
            </div>
          )}

          {/* STEP 4: FAMILY (AYAH & IBU) */}
          {currentStep === 'family' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Nomor KK (Kartu Keluarga)</label>
                    <input type="text" name="noKK" value={formData.noKK || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Nama Kepala Keluarga</label>
                    <input type="text" name="namaKepKeluarga" value={formData.namaKepKeluarga || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                  </div>
                </div>
              </div>

              {/* DATA AYAH */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-indigo-600 rounded-full"></div> Data Ayah Kandung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input type="text" name="namaAyah" placeholder="Nama Ayah" value={formData.namaAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="text" name="nikAyah" placeholder="NIK Ayah" value={formData.nikAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="text" name="tempatLahirAyah" placeholder="Tempat Lahir" value={formData.tempatLahirAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="date" name="tglLahirAyah" value={formData.tglLahirAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="statusAyah" value={formData.statusAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Status Hidup</option>
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Sudah Meninggal">Sudah Meninggal</option>
                   </select>
                   <select name="pendidikanAyah" value={formData.pendidikanAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Pendidikan Terakhir</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                   </select>
                   <input type="text" name="pekerjaanAyah" placeholder="Pekerjaan" value={formData.pekerjaanAyah || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="penghasilanAyahPerbulan" value={formData.penghasilanAyahPerbulan || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Penghasilan Per Bulan</option>
                      <option value="< 1 Juta">Kurang dari 1 Juta</option>
                      <option value="1 - 3 Juta">1 - 3 Juta</option>
                      <option value="3 - 5 Juta">3 - 5 Juta</option>
                      <option value="> 5 Juta">Lebih dari 5 Juta</option>
                   </select>
                </div>
              </div>

              {/* DATA IBU */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><div className="w-1 h-6 bg-pink-600 rounded-full"></div> Data Ibu Kandung</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input type="text" name="namaIbu" placeholder="Nama Ibu" value={formData.namaIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="text" name="nikIbu" placeholder="NIK Ibu" value={formData.nikIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="text" name="tempatLahirIbu" placeholder="Tempat Lahir" value={formData.tempatLahirIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="date" name="tglLahirIbu" value={formData.tglLahirIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="statusIbu" value={formData.statusIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Status Hidup</option>
                      <option value="Masih Hidup">Masih Hidup</option>
                      <option value="Sudah Meninggal">Sudah Meninggal</option>
                   </select>
                   <select name="pendidikanIbu" value={formData.pendidikanIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Pendidikan Terakhir</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                   </select>
                   <input type="text" name="pekerjaanIbu" placeholder="Pekerjaan" value={formData.pekerjaanIbu || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="penghasilanIbuPerbulan" value={formData.penghasilanIbuPerbulan || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Penghasilan Per Bulan</option>
                      <option value="< 1 Juta">Kurang dari 1 Juta</option>
                      <option value="1 - 3 Juta">1 - 3 Juta</option>
                      <option value="3 - 5 Juta">3 - 5 Juta</option>
                      <option value="> 5 Juta">Lebih dari 5 Juta</option>
                   </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: GUARDIAN */}
          {currentStep === 'guardian' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-amber-50 p-4 rounded-xl text-amber-800 text-sm mb-4">
                Isi data wali jika siswa <strong>tidak tinggal bersama orang tua</strong>. Jika tinggal dengan orang tua, boleh dikosongkan.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <input type="text" name="namaWali" placeholder="Nama Wali" value={formData.namaWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="text" name="nikWali" placeholder="NIK Wali" value={formData.nikWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <input type="number" name="tahunLahirWali" placeholder="Tahun Lahir" value={formData.tahunLahirWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="pendidikanWali" value={formData.pendidikanWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Pendidikan Terakhir</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                   </select>
                   <input type="text" name="pekerjaanWali" placeholder="Pekerjaan" value={formData.pekerjaanWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border" />
                   <select name="penghasilanWali" value={formData.penghasilanWali || ''} onChange={handleChange} className="px-4 py-3 rounded-xl border">
                      <option value="">Penghasilan Per Bulan</option>
                      <option value="< 1 Juta">Kurang dari 1 Juta</option>
                      <option value="1 - 3 Juta">1 - 3 Juta</option>
                      <option value="3 - 5 Juta">3 - 5 Juta</option>
                      <option value="> 5 Juta">Lebih dari 5 Juta</option>
                   </select>
              </div>
            </div>
          )}

          {/* STEP 6: ASSISTANCE */}
          {currentStep === 'assistance' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <p className="text-gray-500 text-sm">Masukkan nomor kartu bantuan jika memiliki. Kosongkan jika tidak ada.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">No. KKS / KPS</label>
                  <input type="text" name="kksKps" value={formData.kksKps || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Kartu Keluarga Sejahtera" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">No. PKH</label>
                  <input type="text" name="pkh" value={formData.pkh || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Program Keluarga Harapan" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">No. KIP (Kartu Indonesia Pintar)</label>
                  <input type="text" name="kip" value={formData.kip || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700">No. PIP</label>
                  <input type="text" name="pip" value={formData.pip || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Status Kepemilikan Rumah</label>
                <select name="statusKepemilikanRumahOrangTua" value={formData.statusKepemilikanRumahOrangTua} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200">
                  <option value="Milik Sendiri">Milik Sendiri</option>
                  <option value="Sewa/Kontrak">Sewa / Kontrak</option>
                  <option value="Menumpang">Menumpang</option>
                  <option value="Dinas">Rumah Dinas</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 7: SCHOOL */}
          {currentStep === 'school' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Jenjang Sekolah Asal</label>
                <select name="jenisLembagaJenjang" value={formData.jenisLembagaJenjang || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200">
                  <option value="">-- Pilih --</option>
                  <option value="SD">SD</option>
                  <option value="MI">MI</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Status Sekolah</label>
                <select name="statusSekolahAsal" value={formData.statusSekolahAsal || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200">
                  <option value="">-- Pilih --</option>
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-bold text-slate-700">Nama Sekolah Asal (SD/MI)</label>
                <input required type="text" name="namaSekolahMadrasah" value={formData.namaSekolahMadrasah || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">NPSN Sekolah</label>
                <input type="text" name="npsnSekolah" value={formData.npsnSekolah || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Lokasi Sekolah (Kabupaten)</label>
                <input type="text" name="lokasiSekolah" value={formData.lokasiSekolah || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">No. Peserta Ujian (Jika ada)</label>
                <input type="text" name="noPesertaUN" value={formData.noPesertaUN || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">No. Blanko SKHU</label>
                <input type="text" name="noBlankoSKHU" value={formData.noBlankoSKHU || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">No. Seri Ijazah</label>
                <input type="text" name="noSeriIjazah" value={formData.noSeriIjazah || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Total Nilai Rata-Rata</label>
                <input type="text" name="totalNilaiUN" value={formData.totalNilaiUN || ''} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-gray-200" placeholder="Contoh: 85.5" />
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW */}
          {currentStep === 'review' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold text-lg border-b pb-2">Konfirmasi Data</h3>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                   <div className="text-gray-500">Nama Lengkap</div>
                   <div className="font-medium text-right">{formData.namaSiswa}</div>
                   
                   <div className="text-gray-500">NISN</div>
                   <div className="font-medium text-right">{formData.nisn}</div>

                   <div className="text-gray-500">Program</div>
                   <div className="font-medium text-right">{formData.pilihanProgram}</div>

                   <div className="text-gray-500">Sekolah Asal</div>
                   <div className="font-medium text-right">{formData.namaSekolahMadrasah}</div>
                   
                   <div className="text-gray-500">Tahun Ajaran</div>
                   <div className="font-medium text-right">{formData.tahunAjaran}</div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                  <Sparkles size={100} />
                </div>
                
                <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <Sparkles className="text-yellow-300" />
                  AI Profiler
                </h3>

                {!formData.aiAnalysis ? (
                   <div className="text-center py-6">
                     <p className="mb-4 text-indigo-100">Analisis potensi dirimu sebelum bergabung bersama kami!</p>
                     <button 
                      type="button" 
                      onClick={handleAIScan}
                      disabled={analyzing}
                      className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold hover:bg-indigo-50 transition shadow-lg disabled:opacity-70"
                     >
                       {analyzing ? (
                         <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Menganalisis...</span>
                       ) : "Analisis Profil Saya Sekarang"}
                     </button>
                   </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl text-sm leading-relaxed border border-white/20 animate-in fade-in">
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: formData.aiAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm border border-yellow-200">
                <input required type="checkbox" className="w-5 h-5 rounded text-yellow-600 focus:ring-yellow-500" />
                <span>Saya menyatakan data yang diisi adalah benar dan dapat dipertanggungjawabkan.</span>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-100">
            {currentStep !== 'inden' && (
              <button 
                type="button" 
                onClick={handleBack}
                className="w-1/3 bg-gray-100 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Kembali
              </button>
            )}
            
            {currentStep === 'review' ? (
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-4 rounded-xl hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Kirim Pendaftaran
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleNext}
                className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition flex items-center justify-center gap-2"
              >
                Lanjut <ArrowRight size={20} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;

import React, { useEffect, useState, useRef } from 'react';
import { dbService } from '../services/dbService';
import { storageService } from '../services/storageService';
import { StudentData } from '../types';
import * as XLSX from 'xlsx';
import { Download, LogOut, RefreshCw, Search, Trash2, FileText, Sparkles, Upload, Edit, X, Save } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [data, setData] = useState<Partial<StudentData>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State untuk Edit Modal
  const [editingStudent, setEditingStudent] = useState<Partial<StudentData> | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [activeTab, setActiveTab] = useState<'siswa' | 'ortu' | 'sekolah' | 'lainnya'>('siswa');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Mengambil semua data tanpa filter tahun spesifik
      const result = await dbService.fetchAll(); 
      if (result) {
        setData(result);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      let msg = 'Gagal memuat data.';
      try {
        if (typeof error === 'string') {
          msg = error;
        } else if (error instanceof Error) {
          msg = error.message;
        } else if (typeof error === 'object' && error !== null) {
          msg = error.message || error.details || error.hint || JSON.stringify(error);
        } else {
          msg = String(error);
        }
      } catch (e) {
        msg = 'Terjadi kesalahan yang tidak dapat ditampilkan.';
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) return;
    
    setDeletingId(id);
    try {
      await dbService.delete(id);
      setData(data.filter(item => item.id !== id));
    } catch (error: any) {
      const msg = error?.message || 'Gagal menghapus data';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (student: Partial<StudentData>) => {
    setEditingStudent({ ...student });
    setActiveTab('siswa');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (editingStudent) {
        const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setEditingStudent({ ...editingStudent, [e.target.name]: val });
    }
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.id) return;
    
    setSavingEdit(true);
    try {
        await dbService.update(editingStudent.id, editingStudent);
        // Update local data
        setData(data.map(item => item.id === editingStudent.id ? editingStudent : item));
        setEditingStudent(null);
        alert('Data berhasil diperbarui!');
    } catch (error: any) {
        alert('Gagal menyimpan perubahan: ' + error.message);
    } finally {
        setSavingEdit(false);
    }
  };

  const handleUploadTrigger = (id: string) => {
    setUploadingId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && uploadingId) {
      const file = e.target.files[0];
      try {
        const url = await storageService.uploadPhoto(file);
        // Update in DB
        await dbService.update(uploadingId, { fotoSiswa: url });
        // Update local state
        setData(data.map(item => item.id === uploadingId ? { ...item, fotoSiswa: url } : item));
        alert('Foto berhasil diupload!');
      } catch (error: any) {
        alert('Gagal upload: ' + (error.message || 'Unknown error'));
      } finally {
        setUploadingId(null);
      }
    }
  };

  const handleExport = () => {
    const formattedData = data.map(item => ({
      // Identitas
      'No. Urut': item.noUrut || '-',
      'Tahun Ajaran': item.tahunAjaran,
      'Tanggal Daftar': item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-',
      'Nama Siswa': item.namaSiswa,
      'NISN': item.nisn,
      'NIS Lokal': item.nisLokal,
      'NIK': item.nik,
      'Tempat Lahir': item.tempatLahir,
      'Tanggal Lahir': item.tanggalLahir,
      'Agama': item.agama,
      'Warga Negara': item.wargaNegara,
      'Jenis Kelamin': item.jenisKelamin,
      'Hobi': item.hobi,
      'Anak Ke': item.anakKe,
      'Jumlah Saudara': item.jumlahSaudara,
      'Program Pilihan': item.pilihanProgram,
      
      // Alamat
      'Alamat': item.alamat,
      'RT/RW/Dusun': item.alamat, 
      'Desa/Kelurahan': item.desaKelurahan,
      'Kecamatan': item.kecamatan,
      'Kabupaten': item.kabupaten,
      'Provinsi': item.propinsi,
      'Kode Pos': item.kodePos,
      'Jenis Tempat Tinggal': item.jenisTempatTinggal,
      'Jarak Tempat Tinggal': item.jarakTempatTinggal,
      'Transportasi': item.transportasi,
      'Waktu Tempuh': item.jarakTempuh,
      'No. HP': item.nomorTelepon,
      
      // Keluarga
      'No. KK': item.noKK,
      'Kepala Keluarga': item.namaKepKeluarga,
      
      // Ayah
      'Nama Ayah': item.namaAyah,
      'NIK Ayah': item.nikAyah,
      'Tahun Lahir Ayah': item.tglLahirAyah,
      'Pendidikan Ayah': item.pendidikanAyah,
      'Pekerjaan Ayah': item.pekerjaanAyah,
      'Penghasilan Ayah': item.penghasilanAyahPerbulan,
      'Status Ayah': item.statusAyah,
      
      // Ibu
      'Nama Ibu': item.namaIbu,
      'NIK Ibu': item.nikIbu,
      'Tahun Lahir Ibu': item.tglLahirIbu,
      'Pendidikan Ibu': item.pendidikanIbu,
      'Pekerjaan Ibu': item.pekerjaanIbu,
      'Penghasilan Ibu': item.penghasilanIbuPerbulan,
      'Status Ibu': item.statusIbu,
      
      // Wali
      'Nama Wali': item.namaWali,
      'NIK Wali': item.nikWali,
      'Pendidikan Wali': item.pendidikanWali,
      'Pekerjaan Wali': item.pekerjaanWali,
      'Penghasilan Wali': item.penghasilanWali,
      
      // Kesejahteraan
      'No KKS/KPS': item.kksKps,
      'No PKH': item.pkh,
      'No KIP': item.kip,
      'No PIP': item.pip,
      'Status Rumah': item.statusKepemilikanRumahOrangTua,
      
      // Sekolah Asal
      'Jenjang Sekolah': item.jenisLembagaJenjang,
      'Status Sekolah': item.statusSekolahAsal,
      'Nama Sekolah': item.namaSekolahMadrasah,
      'NPSN': item.npsnSekolah,
      'Lokasi Sekolah': item.lokasiSekolah,
      'No Peserta UN': item.noPesertaUN,
      'No SKHU': item.noBlankoSKHU,
      'No Ijazah': item.noSeriIjazah,
      'Total Nilai': item.totalNilaiUN,

      // Lainnya
      'Jalur Inden': item.isInden ? 'Ya' : 'Tidak',
      'AI Analysis': item.aiAnalysis ? 'Analyzed' : '-',
      'Link Foto': item.fotoSiswa || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Lengkap");
    XLSX.writeFile(workbook, `Data_SPMB_Lengkap_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredData = data.filter(item => 
    (item.namaSiswa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nisn || '').includes(searchTerm) ||
    (item.namaSekolahMadrasah || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.tahunAjaran || '').includes(searchTerm)
  );

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl overflow-hidden border border-white/50 h-[85vh] flex flex-col relative">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleFileChange}
      />

      {/* Header */}
      <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-indigo-600" />
            Dashboard Admin
          </h2>
          <p className="text-gray-500 text-sm mt-1">{data.length} Total Pendaftar Terdata</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button onClick={fetchData} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition" title="Refresh Data">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition font-medium shadow-md shadow-green-600/20">
            <Download size={18} /> Export Excel Lengkap
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-xl hover:bg-red-100 transition font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 bg-gray-50/50 border-b border-gray-100">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari Nama, NISN, Sekolah, atau Tahun..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12 text-center">No</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center w-20">Foto</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NISN / Sekolah</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thn Ajaran</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kontak / Alamat</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {error ? (
               <tr><td colSpan={9} className="p-12 text-center text-red-500 bg-red-50">
                <p className="font-bold">Terjadi Kesalahan</p>
                <p className="text-sm font-mono mt-2 break-all">{error}</p>
                <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200 transition">Coba Lagi</button>
               </td></tr>
            ) : loading ? (
              <tr><td colSpan={9} className="p-12 text-center text-gray-500 animate-pulse">Sedang memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={9} className="p-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Search size={32} className="text-gray-300"/>
                  <p>Tidak ada data pendaftar ditemukan.</p>
                </div>
              </td></tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 text-sm text-gray-500 font-mono text-center">{idx + 1}</td>
                  <td className="p-4 text-center">
                    {item.fotoSiswa ? (
                      <div className="relative group/img w-10 h-12 mx-auto rounded-lg overflow-hidden border border-gray-200 cursor-pointer" onClick={() => item.id && handleUploadTrigger(item.id)}>
                        <img src={item.fotoSiswa} alt="Foto" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <Upload size={12} className="text-white" />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => item.id && handleUploadTrigger(item.id)}
                        className="w-10 h-12 mx-auto rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:bg-indigo-50 hover:text-indigo-500 hover:border-indigo-200 transition"
                        title="Upload Foto"
                      >
                        <Upload size={16} />
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-900">{item.namaSiswa}</div>
                    <div className="text-xs text-gray-500">{item.tempatLahir}, {item.tanggalLahir}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-mono">{item.nisn}</div>
                    <div className="text-xs text-gray-500">{item.namaSekolahMadrasah}</div>
                  </td>
                  <td className="p-4">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-semibold whitespace-nowrap">
                      {item.tahunAjaran || '-'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                      ${item.pilihanProgram === 'Reguler' ? 'bg-blue-100 text-blue-800' : 
                        item.pilihanProgram === 'Tahfidz' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-purple-100 text-purple-800'}`}>
                      {item.pilihanProgram}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-medium">{item.nomorTelepon}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[150px]" title={item.alamat}>{item.alamat}</div>
                  </td>
                  <td className="p-4">
                     <div className="flex flex-col gap-1">
                        {item.isInden && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md w-fit font-bold">INDEN</span>}
                        {item.aiAnalysis && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md w-fit flex items-center gap-1"><Sparkles size={10}/> AI Verified</span>}
                     </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button 
                            onClick={() => handleEditClick(item)}
                            className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Data"
                        >
                            <Edit size={16} />
                        </button>
                        <button 
                        onClick={() => item.id && handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Hapus Data"
                        >
                        {deletingId === item.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingStudent && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Edit size={18} className="text-indigo-600"/> Edit Data Siswa
                    </h3>
                    <button onClick={() => setEditingStudent(null)} className="p-2 hover:bg-gray-200 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b bg-white">
                    <button onClick={() => setActiveTab('siswa')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'siswa' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Data Siswa</button>
                    <button onClick={() => setActiveTab('ortu')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'ortu' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Orang Tua</button>
                    <button onClick={() => setActiveTab('sekolah')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'sekolah' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Sekolah & Alamat</button>
                    <button onClick={() => setActiveTab('lainnya')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'lainnya' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Lainnya</button>
                </div>

                <form onSubmit={saveEdit} className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'siswa' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold text-gray-500">Nama Lengkap</label><input name="namaSiswa" value={editingStudent.namaSiswa || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">NISN</label><input name="nisn" value={editingStudent.nisn || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">NIS Lokal</label><input name="nisLokal" value={editingStudent.nisLokal || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">NIK</label><input name="nik" value={editingStudent.nik || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Tempat Lahir</label><input name="tempatLahir" value={editingStudent.tempatLahir || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Tanggal Lahir</label><input type="date" name="tanggalLahir" value={editingStudent.tanggalLahir || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Jenis Kelamin</label>
                                <select name="jenisKelamin" value={editingStudent.jenisKelamin || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg">
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">Agama</label><input name="agama" value={editingStudent.agama || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Anak Ke</label><input name="anakKe" value={editingStudent.anakKe || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Jml Saudara</label><input name="jumlahSaudara" value={editingStudent.jumlahSaudara || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                        </div>
                    )}

                    {activeTab === 'ortu' && (
                         <div className="space-y-4">
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-bold text-indigo-600 mb-2">Ayah</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input name="namaAyah" placeholder="Nama Ayah" value={editingStudent.namaAyah || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="nikAyah" placeholder="NIK Ayah" value={editingStudent.nikAyah || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="pekerjaanAyah" placeholder="Pekerjaan" value={editingStudent.pekerjaanAyah || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="penghasilanAyahPerbulan" placeholder="Penghasilan" value={editingStudent.penghasilanAyahPerbulan || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-bold text-pink-600 mb-2">Ibu</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input name="namaIbu" placeholder="Nama Ibu" value={editingStudent.namaIbu || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="nikIbu" placeholder="NIK Ibu" value={editingStudent.nikIbu || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="pekerjaanIbu" placeholder="Pekerjaan" value={editingStudent.pekerjaanIbu || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="penghasilanIbuPerbulan" placeholder="Penghasilan" value={editingStudent.penghasilanIbuPerbulan || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-bold text-amber-600 mb-2">Wali</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input name="namaWali" placeholder="Nama Wali" value={editingStudent.namaWali || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                    <input name="nikWali" placeholder="NIK Wali" value={editingStudent.nikWali || ''} onChange={handleEditChange} className="p-2 border rounded" />
                                </div>
                            </div>
                         </div>
                    )}

                    {activeTab === 'sekolah' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2"><label className="text-xs font-bold text-gray-500">Alamat Rumah</label><textarea name="alamat" value={editingStudent.alamat || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" rows={2} /></div>
                            <div><label className="text-xs font-bold text-gray-500">Desa/Kelurahan</label><input name="desaKelurahan" value={editingStudent.desaKelurahan || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Kecamatan</label><input name="kecamatan" value={editingStudent.kecamatan || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Kabupaten</label><input name="kabupaten" value={editingStudent.kabupaten || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">No HP</label><input name="nomorTelepon" value={editingStudent.nomorTelepon || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="md:col-span-2 border-t pt-4 mt-2"><label className="text-xs font-bold text-gray-500">Sekolah Asal</label><input name="namaSekolahMadrasah" value={editingStudent.namaSekolahMadrasah || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">NPSN</label><input name="npsnSekolah" value={editingStudent.npsnSekolah || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">Status Sekolah</label><input name="statusSekolahAsal" value={editingStudent.statusSekolahAsal || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                        </div>
                    )}

                    {activeTab === 'lainnya' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div><label className="text-xs font-bold text-gray-500">Program Pilihan</label>
                                <select name="pilihanProgram" value={editingStudent.pilihanProgram || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg">
                                    <option value="Reguler">Reguler</option>
                                    <option value="Tahfidz">Tahfidz</option>
                                    <option value="Sains">Sains</option>
                                    <option value="Olahraga">Olahraga</option>
                                </select>
                            </div>
                            <div><label className="text-xs font-bold text-gray-500">Tahun Ajaran</label><input name="tahunAjaran" value={editingStudent.tahunAjaran || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">No. KIP</label><input name="kip" value={editingStudent.kip || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">No. PKH</label><input name="pkh" value={editingStudent.pkh || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div><label className="text-xs font-bold text-gray-500">No. KKS</label><input name="kksKps" value={editingStudent.kksKps || ''} onChange={handleEditChange} className="w-full p-2 border rounded-lg" /></div>
                            <div className="md:col-span-2 flex items-center gap-2 border p-3 rounded-lg bg-yellow-50">
                                <input type="checkbox" name="isInden" checked={editingStudent.isInden || false} onChange={handleEditChange} className="w-4 h-4" />
                                <span className="text-sm font-bold">Status Inden</span>
                            </div>
                        </div>
                    )}
                </form>

                <div className="p-4 border-t bg-white flex justify-end gap-3">
                    <button onClick={() => setEditingStudent(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Batal</button>
                    <button onClick={saveEdit} disabled={savingEdit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold flex items-center gap-2">
                        {savingEdit ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
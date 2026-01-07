
import React, { useEffect, useState } from 'react';
import { dbService } from '../services/dbService';
import { StudentData } from '../types';
import * as XLSX from 'xlsx';
import { Download, LogOut, RefreshCw, Search, Trash2, Calendar, FileText, Sparkles } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [data, setData] = useState<Partial<StudentData>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Assuming current year '2025/2026' or similar, passing generic year for now or handle in service
      // For now fetching all by not filtering strict year in service or passing a common one
      const result = await dbService.fetchAll('2025/2026'); // Example year
      // Fallback if fetchAll returns error handled internally or empty
      if (result) {
        setData(result);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // alert('Gagal mengambil data: ' + error.message);
      // Fallback to fetch directly if needed or just show empty
      const result = await dbService.fetchAll(''); // Fetch all without year filter if needed
      if (result) setData(result);
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
      alert('Gagal menghapus: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    // Format data untuk Excel agar lebih rapi
    const formattedData = data.map(item => ({
      'Tanggal Daftar': item.created_at ? new Date(item.created_at).toLocaleString('id-ID') : '-',
      'Nama Siswa': item.namaSiswa,
      'NISN': item.nisn,
      'Program': item.pilihanProgram,
      'Asal Sekolah': item.namaSekolahMadrasah,
      'Alamat': item.alamat,
      'No. HP': item.nomorTelepon,
      'Nama Ayah': item.namaAyah,
      'Pekerjaan Ayah': item.pekerjaanAyah,
      'Nama Ibu': item.namaIbu,
      'Rata-rata Penghasilan': item.penghasilanAyahPerbulan,
      'Jalur Inden': item.isInden ? 'Ya' : 'Tidak',
      'AI Analysis': item.aiAnalysis ? 'Analyzed' : '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data PPDB");
    XLSX.writeFile(workbook, `Data_SPMB_Full_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredData = data.filter(item => 
    (item.namaSiswa || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.nisn || '').includes(searchTerm) ||
    (item.namaSekolahMadrasah || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[24px] shadow-2xl overflow-hidden border border-white/50 h-[85vh] flex flex-col">
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
            <Download size={18} /> Export Excel
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
            placeholder="Cari Nama, NISN, atau Sekolah..." 
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
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NISN / Sekolah</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Kontak / Alamat</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-500 animate-pulse">Sedang memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} className="p-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <Search size={32} className="text-gray-300"/>
                  <p>Tidak ada data pendaftar ditemukan.</p>
                </div>
              </td></tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50 transition group">
                  <td className="p-4 text-sm text-gray-500 font-mono text-center">{idx + 1}</td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-gray-900">{item.namaSiswa}</div>
                    <div className="text-xs text-gray-500">{item.tempatLahir}, {item.tanggalLahir}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900 font-mono">{item.nisn}</div>
                    <div className="text-xs text-gray-500">{item.namaSekolahMadrasah}</div>
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
                    <button 
                      onClick={() => item.id && handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus Data"
                    >
                      {deletingId === item.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;

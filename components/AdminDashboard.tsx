
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Pendaftar } from '../types';
import * as XLSX from 'xlsx';
import { Download, LogOut, RefreshCw, Search } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [data, setData] = useState<Pendaftar[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from('pendaftar')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      alert('Error fetching data: ' + error.message);
    } else {
      setData(result || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftar");
    XLSX.writeFile(workbook, "Data_Pendaftar_SPMB.xlsx");
  };

  const filteredData = data.filter(item => 
    item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nisn.includes(searchTerm)
  );

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[30px] shadow-2xl overflow-hidden border border-white/50 h-[85vh] flex flex-col">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/50">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Admin</h2>
          <p className="text-gray-500 text-sm">{data.length} Total Pendaftar</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition font-medium shadow-md hover:shadow-lg">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-xl hover:bg-red-100 transition font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-6 bg-gray-50/50 border-b border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari Nama atau NISN..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">No</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NISN</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Asal Sekolah</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jurusan</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Terdaftar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>
            ) : (
              filteredData.map((item, idx) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition">
                  <td className="p-4 text-sm text-gray-500 font-mono">{idx + 1}</td>
                  <td className="p-4 text-sm font-semibold text-gray-800">{item.nama_lengkap}</td>
                  <td className="p-4 text-sm text-gray-600 font-mono">{item.nisn}</td>
                  <td className="p-4 text-sm text-gray-600">{item.asal_sekolah}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                      {item.jurusan}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{item.no_whatsapp}</td>
                  <td className="p-4 text-xs text-gray-400">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
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

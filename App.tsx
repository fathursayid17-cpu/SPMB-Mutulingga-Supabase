import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient'; 
import { StudentData, AppState } from './types';
import { analyzeStudentProfile } from './services/geminiService';
import { Icons } from './constants';

// --- KONSTANTA & OPSI ---
const ACADEMIC_YEARS = ['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029'];
const DEFAULT_YEAR = '2026/2027';
const LOGO_STORAGE_KEY = 'mts_school_logo';
const DEFAULT_LOGO = 'https://p16-va.lemon8cdn.com/obj/tos-alisg-v-a3e477-sg/o0A6fIBfQAbCIEAgf9IeeAD0AebfAnmEg9E9AE';

const PEKERJAAN_OPTIONS = ['Tidak Bekerja', 'PNS/TNI/Polri', 'Pegawai Swasta', 'Wiraswasta/Pedagang', 'Petani/Peternak', 'Buruh', 'Pensiunan', 'Lainnya'];
const PENDAPATAN_OPTIONS = ['Kurang dari 500.000', '500.000 - 1.000.000', '1.000.001 - 2.000.000', '2.000.001 - 3.000.000', '3.000.001 - 5.000.000', 'Lebih dari 5.000.000'];
const PENDIDIKAN_OPTIONS = ['Tidak Sekolah', 'SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1/D2/D3', 'S1/D4', 'S2', 'S3'];
const PROVINSI_OPTIONS = ['Jawa Tengah', 'Jawa Barat', 'Jawa Timur', 'DIY Yogyakarta', 'DKI Jakarta', 'Banten', 'Bali', 'Luar Jawa'];

const KABUPATEN_MAP: Record<string, string[]> = {
  'Jawa Tengah': ['Purbalingga', 'Banyumas', 'Banjarnegara', 'Cilacap', 'Kebumen', 'Pemalang', 'Semarang', 'Tegal', 'Brebes', 'Wonosobo', 'Pekalongan'],
  'Jawa Barat': ['Cirebon', 'Bandung', 'Bogor', 'Bekasi', 'Garut', 'Tasikmalaya'],
  'DIY Yogyakarta': ['Sleman', 'Bantul', 'Gunung Kidul', 'Kulon Progo', 'Yogyakarta'],
  'DKI Jakarta': ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Utara', 'Jakarta Barat', 'Jakarta Timur'],
  'Jawa Timur': ['Surabaya', 'Malang', 'Sidoarjo', 'Gresik'],
};

const KECAMATAN_MAP: Record<string, string[]> = {
  'Purbalingga': ['Purbalingga', 'Kalimanah', 'Padamara', 'Kutasari', 'Bojongsari', 'Mrebet', 'Bobotsari', 'Karangreja', 'Karangjambu', 'Karanganyar', 'Kertanegara', 'Karangmoncol', 'Rembang', 'Pengadegan', 'Kaligondang', 'Kejobong', 'Bukateja', 'Kemangkon'],
  'Banyumas': ['Purwokerto Utara', 'Purwokerto Selatan', 'Purwokerto Barat', 'Purwokerto Timur', 'Baturraden', 'Sokaraja', 'Kembaran', 'Sumbang', 'Kedungbanteng', 'Karanglewas', 'Cilongok', 'Ajibarang', 'Pekuncen', 'Gumelar', 'Lumbir', 'Wangon', 'Jatilawang', 'Rawalo', 'Kebasen', 'Patikraja', 'Purwojati', 'Kalibagor', 'Banyumas', 'Somagede', 'Tambak', 'Sumpiuh'],
  'Banjarnegara': ['Banjarnegara', 'Sigaluh', 'Madukara', 'Banjarmangu', 'Wanadadi', 'Rakit', 'Punggelan', 'Mandiraja', 'Purwareja Klampok', 'Susukan', 'Kalibening', 'Pandanarum', 'Karangkobar', 'Pagentan', 'Pejawaran', 'Batur', 'Wanayasa', 'Pezawaran', 'Bawang'],
};

const DESA_MAP: Record<string, string[]> = {
  'Purbalingga': ['Bancar', 'Bojong', 'Jatisaba', 'Kandanggampang', 'Kedung Menjangan', 'Kembaran Kulon', 'Penambongan', 'Purbalingga Kidul', 'Purbalingga Kulon', 'Purbalingga Lor', 'Purbalingga Wetan', 'Toyareka', 'Wirasana'],
  'Kalimanah': ['Babakan', 'Blater', 'Grecol', 'Jompo', 'Kalimanah Kulon', 'Kalimanah Wetan', 'Karangpetir', 'Karangsar', 'Kedungwuluh', 'Klapa Sawit', 'Manduraga', 'Mewek', 'Rabak', 'Selabaya', 'Sidakangen'],
  'Padamara': ['Bojong', 'Dawuhan', 'Gemuruh', 'Kalitinggar', 'Kalitinggar Kidul', 'Karanggambas', 'Karangjambe', 'Karangpule', 'Karangsentul', 'Mipiran', 'Padamara', 'Prigi', 'Purbayasa', 'Sokawera'],
  'Kutasari': ['Candinata', 'Candiwulan', 'Cendana', 'Karangaren', 'Karangcegak', 'Karangjengkol', 'Karangklesem', 'Karangreja', 'Kekep', 'Kutasari', 'Limbangan', 'Meri', 'Munjul', 'Sumingkir'],
  'Bobotsari': ['Banjarsari', 'Bobotsari', 'Dagan', 'Gandasuli', 'Gunungkarang', 'Kalapacung', 'Karangduren', 'Karangmalang', 'Karangtalun', 'Lajer', 'Limbangan', 'Majapura', 'Pakuncen', 'Palumbungan', 'Palumbungan Wetan', 'Talagening', 'Tlagayasa'],
  'Bukateja': ['Bajong', 'Bukateja', 'Cipawon', 'Karangcengis', 'Karanggedang', 'Karangnangka', 'Kebutuh', 'Kedungjati', 'Kembangan', 'Kutawis', 'Majasari', 'Penaruban', 'Tidu', 'Wirasaba'],
  'Kemangkon': ['Bakulan', 'Bokol', 'Gambarsari', 'Jetis', 'Kalialang', 'Karangkemiri', 'Karangtengah', 'Kedungbenda', 'Kedunglegok', 'Kemangkon', 'Majasem', 'Majatengah', 'Muntang', 'Panican', 'Pegandekan', 'Pelumutan', 'Senon', 'Sumilir', 'Toyareka'],
  'Sokaraja': ['Sokaraja Kulon', 'Sokaraja Tengah', 'Sokaraja Wetan', 'Banjaranyar', 'Banjarsari Kidul', 'Jompo Kulon', 'Karangduren', 'Karangkedawung', 'Karangnanas', 'Kedondong', 'Klahang', 'Lemberang', 'Pamijen', 'Sokaraja Lor', 'Wiradadi'],
  'Purwokerto Utara': ['Bancarkembar', 'Bobosan', 'Grendeng', 'Karangwangkal', 'Pabuaran', 'Purwanegara', 'Sumampir'],
  'Banjarnegara': ['Ampelsari', 'Cendana', 'Sokayasa', 'Semampir', 'Wangon', 'Karangtengah', 'Krutuk', 'Kutabanjarnegara', 'Parakancanggah', 'Sokanandi', 'Semarang', 'Arcawinangun'],
};

const KODEPOS_MAP: Record<string, string> = {
  'Purbalingga Lor': '53311', 'Purbalingga Kulon': '53312', 'Purbalingga Kidul': '53313', 'Bancar': '53314', 'Kembaran Kulon': '53315', 'Penambongan': '53316', 'Purbalingga Wetan': '53317', 'Wirasana': '53318', 'Kandanggampang': '53319', 'Kedung Menjangan': '53319', 'Toyareka': '53319', 'Bojong': '53319', 'Jatisaba': '53319',
  'Kalimanah Wetan': '53371', 'Kalimanah Kulon': '53371', 'Blater': '53371', 'Grecol': '53371', 'Jompo': '53371', 'Karangpetir': '53371', 'Klapa Sawit': '53371', 'Manduraga': '53371', 'Mewek': '53371', 'Selabaya': '53371', 'Sidakangen': '53371', 'Babakan': '53371', 'Kedungwuluh': '53371', 'Karangsar': '53371', 'Rabak': '53371',
  'Padamara': '53372', 'Gemuruh': '53372', 'Kalitinggar': '53372', 'Kalitinggar Kidul': '53372', 'Karangjambe': '53372', 'Karangpule': '53372', 'Mertani': '53372', 'Purbayasa': '53372', 'Sokawera': '53372', 'Prigi': '53372', 'Dawuhan': '53372', 'Karanggambas': '53372', 'Karangsentul': '53372', 'Mipiran': '53372',
  'Kutasari': '53361', 'Candinata': '53361', 'Candiwulan': '53361', 'Cendana': '53361', 'Karangaren': '53361', 'Karangcegak': '53361', 'Karangjengkol': '53361', 'Karangklesem': '53361', 'Kekep': '53361', 'Karangreja': '53361', 'Sumingkir': '53361', 'Meri': '53361', 'Limbangan': '53361', 'Munjul': '53361',
  'Bobotsari': '53353', 'Dagan': '53353', 'Gandasuli': '53353', 'Gunungkarang': '53353', 'Kalapacung': '53353', 'Karangduren': '53353', 'Karangmalang': '53353', 'Karangtalun': '53353', 'Lajer': '53353', 'Majapura': '53353', 'Pakuncen': '53353', 'Palumbungan': '53353', 'Palumbungan Wetan': '53353', 'Tlagayasa': '53353', 'Talagening': '53353', 'Banjarsari': '53353',
  'Bukateja': '53382', 'Bajong': '53382', 'Cipawon': '53382', 'Karangcengis': '53382', 'Karanggedang': '53382', 'Karangnangka': '53382', 'Kebutuh': '53382', 'Kedungjati': '53382', 'Kembangan': '53382', 'Kutawis': '53382', 'Majasari': '53382', 'Penaruban': '53382', 'Tidu': '53382', 'Wirasaba': '53382',
  'Kemangkon': '53381', 'Bakulan': '53381', 'Bokol': '53381', 'Gambarsari': '53381', 'Jetis': '53381', 'Kalialang': '53381', 'Karangtengah': '53381', 'Kedungbenda': '53381', 'Kedunglegok': '53381', 'Majasem': '53381', 'Majatengah': '53381', 'Muntang': '53381', 'Panican': '53381', 'Pegandekan': '53381', 'Pelumutan': '53381', 'Senon': '53381', 'Sumilir': '53381', 'Karangkemiri': '53381'
};

const PROGRAM_OPTIONS = [
  { id: 'Reguler', label: 'REGULER', icon: '🏛️', tier: 'Classic', color: 'border-slate-500', glow: 'shadow-slate-500/20', desc: 'Kurikulum standar nasional dengan penguatan karakter Mutulingga.' },
  { id: 'Tahfizh', label: 'TAHFIZH', icon: '📖', tier: 'Elite', color: 'border-amber-500', glow: 'shadow-amber-500/20', desc: 'Fokus pada Kualitas dan Kuantitas Hafalan Al - Qur\'an MoU dengan LPPI UMP' },
  { id: 'Coding', label: 'CODING', icon: '💻', tier: 'Tech-W', color: 'border-cyan-500', glow: 'shadow-cyan-500/20', desc: 'Logic builder, web development, game development, dan robotika modern MoA dengan UAD Yogyakarta' },
  { id: 'Bilingual', label: 'BILINGUAL', icon: '🌐', tier: 'Global', color: 'border-indigo-500', glow: 'shadow-indigo-500/20', desc: 'Daily conversation dalam Bahasa Inggris & Arab intensif.' },
  { id: 'Fullday', label: 'FULLDAY', icon: '🏫', tier: 'Active', color: 'border-rose-500', glow: 'shadow-rose-500/20', desc: 'Integrasi kurikulum akademik & keislaman dari pagi-sore.' },
];

const FULL_EMPTY_STUDENT_DATA: Partial<StudentData> = {
  namaSiswa: '', fotoSiswa: '', nisLokal: '', nisn: '', nik: '', tempatLahir: '', tanggalLahir: '', agama: 'Islam', wargaNegara: 'WNI', jenisKelamin: 'Laki-laki',
  hobi: '', anakKe: '', jumlahSaudara: '', jenisTempatTinggal: 'Bersama Orang Tua', alamat: '', 
  propinsi: '', kabupaten: '', kecamatan: '', desaKelurahan: '', kodePos: '', 
  nomorTelepon: '', jarakTempatTinggal: 'Kurang dari 1 km', transportasi: 'Jalan Kaki',
  jarakTempuh: '', noKK: '', namaKepKeluarga: '', 
  namaAyah: '', nikAyah: '', tempatLahirAyah: '', tglLahirAyah: '', statusAyah: 'Masih Hidup', pekerjaanAyah: 'Lainnya', penghasilanAyahPerbulan: '', pendidikanAyah: 'SMA/Sederajat',
  namaIbu: '', nikIbu: '', tempatLahirIbu: '', tglLahirIbu: '', statusIbu: 'Masih Hidup', pekerjaanIbu: 'Lainnya', penghasilanIbuPerbulan: '', pendidikanIbu: 'SMA/Sederajat',
  namaWali: '', tahunLahirWali: '', nikWali: '', pendidikanWali: '', pekerjaanWali: '', penghasilanWali: '',
  tahunAjaran: '', jenisLembagaJenjang: 'SD', statusSekolahAsal: 'Negeri', namaSekolahMadrasah: '', pilihanProgram: 'Reguler',
  kksKps: '', pkh: '', pip: '', kip: '', statusKepemilikanRumahOrangTua: 'Milik Sendiri',
  npsnSekolah: '', lokasiSekolah: '', noPesertaUN: '', noBlankoSKHU: '', noSeriIjazah: '', totalNilaiUN: ''
};

// --- HELPER FUNGSI DB ---
const appStateToDb = (data: StudentData, isInden: boolean) => ({
    tahun_ajaran: data.tahunAjaran, no_urut: data.noUrut, nama_siswa: data.namaSiswa, nis_lokal: data.nisLokal, nisn: data.nisn, nik: data.nik,
    tempat_lahir: data.tempatLahir, tanggal_lahir: data.tanggalLahir, agama: data.agama, warga_negara: data.wargaNegara, jenis_kelamin: data.jenisKelamin,
    hobi: data.hobi, anak_ke: data.anakKe, jumlah_saudara: data.jumlahSaudara, pilihan_program: data.pilihanProgram, foto_siswa: data.fotoSiswa,
    jenis_tempat_tinggal: data.jenisTempatTinggal, alamat: data.alamat, propinsi: data.propinsi, kabupaten: data.kabupaten, kecamatan: data.kecamatan,
    desa_kelurahan: data.desaKelurahan, kode_pos: data.kodePos, nomor_telepon: data.nomorTelepon, jarak_tempat_tinggal: data.jarakTempatTinggal,
    transportasi: data.transportasi, jarak_tempuh: data.jarakTempuh, no_kk: data.noKK, nama_kep_keluarga: data.namaKepKeluarga,
    nama_ayah: data.namaAyah, nik_ayah: data.nikAyah, tempat_lahir_ayah: data.tempatLahirAyah, tgl_lahir_ayah: data.tglLahirAyah, status_ayah: data.statusAyah,
    pekerjaan_ayah: data.pekerjaanAyah, penghasilan_ayah_perbulan: data.penghasilanAyahPerbulan, pendidikan_ayah: data.pendidikanAyah,
    nama_ibu: data.namaIbu, nik_ibu: data.nikIbu, tempat_lahir_ibu: data.tempatLahirIbu, tgl_lahir_ibu: data.tglLahirIbu, status_ibu: data.statusIbu,
    pekerjaan_ibu: data.pekerjaanIbu, penghasilan_ibu_perbulan: data.penghasilanIbuPerbulan, pendidikan_ibu: data.pendidikanIbu,
    nama_wali: data.namaWali, tahun_lahir_wali: data.tahunLahirWali, nik_wali: data.nikWali, pendidikan_wali: data.pendidikanWali,
    pekerjaan_wali: data.pekerjaanWali, penghasilan_wali: data.penghasilanWali, kks_kps: data.kksKps, pkh: data.pkh, pip: data.pip, kip: data.kip,
    status_kepemilikan_rumah_orang_tua: data.statusKepemilikanRumahOrangTua, jenis_lembaga_jenjang: data.jenisLembagaJenjang, status_sekolah_asal: data.statusSekolahAsal,
    npsn_sekolah: data.npsnSekolah, nama_sekolah_madrasah: data.namaSekolahMadrasah, lokasi_sekolah: data.lokasiSekolah, no_peserta_un: data.noPesertaUN,
    no_blanko_skhu: data.noBlankoSKHU, no_seri_ijazah: data.noSeriIjazah, total_nilai_un: data.totalNilaiUN, is_inden: isInden
});

const dbToAppState = (dbRow: any): StudentData => ({
    ...FULL_EMPTY_STUDENT_DATA,
    id: dbRow.id, tahunAjaran: dbRow.tahun_ajaran, noUrut: dbRow.no_urut, namaSiswa: dbRow.nama_siswa, nisLokal: dbRow.nis_lokal, nisn: dbRow.nisn, nik: dbRow.nik,
    tempatLahir: dbRow.tempat_lahir, tanggalLahir: dbRow.tanggal_lahir, agama: dbRow.agama, wargaNegara: dbRow.warga_negara, jenisKelamin: dbRow.jenis_kelamin,
    hobi: dbRow.hobi, anakKe: dbRow.anak_ke, jumlahSaudara: dbRow.jumlah_saudara, pilihanProgram: dbRow.pilihan_program, fotoSiswa: dbRow.foto_siswa,
    jenisTempatTinggal: dbRow.jenis_tempat_tinggal, alamat: dbRow.alamat, propinsi: dbRow.propinsi, kabupaten: dbRow.kabupaten, kecamatan: dbRow.kecamatan,
    desaKelurahan: dbRow.desa_kelurahan, kodePos: dbRow.kode_pos, nomorTelepon: dbRow.nomor_telepon, jarakTempatTinggal: dbRow.jarak_tempat_tinggal,
    transportasi: dbRow.transportasi, jarakTempuh: dbRow.jarak_tempuh, noKK: dbRow.no_kk, namaKepKeluarga: dbRow.nama_kep_keluarga,
    namaAyah: dbRow.nama_ayah, nikAyah: dbRow.nik_ayah, tempatLahirAyah: dbRow.tempat_lahir_ayah, tglLahirAyah: dbRow.tgl_lahir_ayah, statusAyah: dbRow.status_ayah,
    pekerjaanAyah: dbRow.pekerjaan_ayah, penghasilanAyahPerbulan: dbRow.penghasilan_ayah_perbulan, pendidikanAyah: dbRow.pendidikan_ayah,
    namaIbu: dbRow.nama_ibu, nikIbu: dbRow.nik_ibu, tempatLahirIbu: dbRow.tempat_lahir_ibu, tglLahirIbu: dbRow.tgl_lahir_ibu, statusIbu: dbRow.status_ibu,
    pekerjaanIbu: dbRow.pekerjaan_ibu, penghasilanIbuPerbulan: dbRow.penghasilan_ibu_perbulan, pendidikanIbu: dbRow.pendidikan_ibu,
    namaWali: dbRow.nama_wali, tahunLahirWali: dbRow.tahun_lahir_wali, nikWali: dbRow.nik_wali, pendidikanWali: dbRow.pendidikan_wali,
    pekerjaanWali: dbRow.pekerjaan_wali, penghasilanWali: dbRow.penghasilan_wali, kksKps: dbRow.kks_kps, pkh: dbRow.pkh, pip: dbRow.pip, kip: dbRow.kip,
    statusKepemilikanRumahOrangTua: dbRow.status_kepemilikan_rumah_orang_tua, jenisLembagaJenjang: dbRow.jenis_lembaga_jenjang, statusSekolahAsal: dbRow.status_sekolah_asal,
    npsnSekolah: dbRow.npsn_sekolah, namaSekolahMadrasah: dbRow.nama_sekolah_madrasah, lokasiSekolah: dbRow.lokasi_sekolah, noPesertaUN: dbRow.no_peserta_un,
    noBlankoSKHU: dbRow.no_blanko_skhu, noSeriIjazah: dbRow.no_seri_ijazah, totalNilaiUN: dbRow.total_nilai_un, isInden: dbRow.is_inden
});

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const studentPhotoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(() => localStorage.getItem(LOGO_STORAGE_KEY) || DEFAULT_LOGO);

  // --- STATE INIT (SUPABASE VERSION) ---
  const [state, setState] = useState<AppState>(() => {
    const lastSelectedYear = localStorage.getItem('mts_active_year') || DEFAULT_YEAR;
    return {
      viewMode: 'landing', 
      currentStep: 'inden', 
      selectedYear: lastSelectedYear,
      studentData: { ...FULL_EMPTY_STUDENT_DATA, tahunAjaran: lastSelectedYear },
      errors: {}, 
      isSubmitting: false, 
      isFinished: false, 
      aiAnalysis: null,
      allRegistrants: [], 
      editingIndex: null, 
      isAdminAuthenticated: false,
      lastBackupTime: null
    };
  });

  const [adminSubView, setAdminSubView] = useState<'form' | 'table'>('table');
  const [adminFormStep, setAdminFormStep] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof StudentData; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; index: number | null }>({ show: false, index: null });
  const itemsPerPage = 10;
  const adminFormSections = ["Identitas Siswa", "Alamat & Kontak", "Data Orang Tua & Wali", "Bantuan & Rumah", "Sekolah Asal"];

  const filteredData = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return state.allRegistrants.filter(item => 
      (item.namaSiswa?.toLowerCase().includes(search) || item.nisn?.toLowerCase().includes(search))
    );
  }, [state.allRegistrants, searchTerm]);

  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = String(a[sortConfig.key] || '');
      const bValue = String(b[sortConfig.key] || '');
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const [loginCreds, setLoginCreds] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');

  // --- FETCH DATA FROM SUPABASE ---
  const fetchRegistrants = async (year: string) => {
    const { data: dbData, error } = await supabase
      .from('pendaftaran')
      .select('*')
      .eq('tahun_ajaran', year)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching data:", error);
    } else if (dbData) {
       const converted = dbData.map(row => dbToAppState(row));
       setState(prev => ({ 
        ...prev, 
        allRegistrants: converted,
        studentData: { 
            ...prev.studentData, 
            tahunAjaran: year, 
            noUrut: (converted.length + 1).toString() 
        }
      }));
    }
  };

  useEffect(() => {
    fetchRegistrants(state.selectedYear);
    localStorage.setItem('mts_active_year', state.selectedYear);
  }, [state.selectedYear]);

  useEffect(() => { return () => stopCamera(); }, []);

  const handleLogoClick = (e: React.MouseEvent) => { e.stopPropagation(); fileInputRef.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Ukuran file terlalu besar! Maksimal 2MB.");
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolLogo(reader.result as string);
        localStorage.setItem(LOGO_STORAGE_KEY, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Ukuran file terlalu besar! Maksimal 2MB.");
      const reader = new FileReader();
      reader.onloadend = () => { updateData({ fotoSiswa: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 400 }, height: { ideal: 400 } } });
        if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Gagal mengakses kamera."); setIsCameraOpen(false); }
  };
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.translate(canvasRef.current.width, 0);
            context.scale(-1, 1);
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
            updateData({ fotoSiswa: canvasRef.current.toDataURL('image/png') });
            stopCamera();
        }
    }
  };
  const retakePhoto = () => { updateData({ fotoSiswa: '' }); startCamera(); };

  const LogoComponent = ({ size = "md", isBlackAndWhite = false, interactive = true }: any) => {
    const dim = size === "sm" ? "w-10 h-10" : size === "md" ? "w-20 h-20" : "w-32 h-32";
    return (
      <div onClick={interactive ? handleLogoClick : undefined} className={`${dim} flex items-center justify-center overflow-hidden bg-slate-800 rounded-2xl border border-slate-700 shadow-xl relative group ${isBlackAndWhite ? 'print:bg-transparent print:border-slate-300' : ''} ${interactive ? 'cursor-pointer hover:border-maroon' : ''}`}>
        <img src={schoolLogo || DEFAULT_LOGO} alt="Logo" className={`w-full h-full object-contain p-1.5 ${isBlackAndWhite ? 'print:grayscale' : ''}`} onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_LOGO; }} />
      </div>
    );
  };

  const safeExit = () => {
    stopCamera();
    setState(prev => ({ 
      ...prev, viewMode: 'landing', currentStep: 'inden', isAdminAuthenticated: false, isFinished: false, editingIndex: null,
      studentData: { ...FULL_EMPTY_STUDENT_DATA, tahunAjaran: prev.selectedYear, noUrut: (prev.allRegistrants.length + 1).toString() }, errors: {}
    }));
    setAdminSubView('table'); setAdminFormStep(0); setLoginCreds({ user: '', pass: '' });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginCreds.user === 'Mutulingga' && loginCreds.pass === 'Jaya1') {
      setState(prev => ({ ...prev, viewMode: 'admin', isAdminAuthenticated: true }));
      setAdminSubView('table'); setLoginError('');
    } else { setLoginError('Kredensial salah!'); }
  };

  const updateData = (fields: Partial<StudentData>) => {
    setState(prev => {
      let newData = { ...prev.studentData, ...fields };
      if ('propinsi' in fields) { newData.kabupaten = ''; newData.kecamatan = ''; newData.desaKelurahan = ''; newData.kodePos = ''; }
      else if ('kabupaten' in fields) { newData.kecamatan = ''; newData.desaKelurahan = ''; newData.kodePos = ''; }
      else if ('kecamatan' in fields) { newData.desaKelurahan = ''; newData.kodePos = ''; }
      else if ('desaKelurahan' in fields) { newData.kodePos = KODEPOS_MAP[fields.desaKelurahan!] || ''; }
      const newErrors = { ...prev.errors }; Object.keys(fields).forEach(key => delete newErrors[key]);
      return { ...prev, studentData: newData, errors: newErrors };
    });
  };

  const validateCurrentStep = (): boolean => {
    const data = state.studentData;
    const errors: Record<string, string> = {};
    if (state.viewMode === 'inden' || (state.viewMode === 'admin' && adminFormStep === 0)) {
      if (!data.namaSiswa?.trim()) errors.namaSiswa = "Nama Lengkap wajib diisi";
      if (!data.nisn?.trim() || data.nisn.length < 10) errors.nisn = "NISN minimal 10 digit";
      if (!data.namaSekolahMadrasah?.trim()) errors.namaSekolahMadrasah = "Asal Sekolah wajib diisi";
      if (!data.nomorTelepon?.trim()) errors.nomorTelepon = "No. WhatsApp wajib diisi";
      if (!data.namaKepKeluarga?.trim()) errors.namaKepKeluarga = "Nama Wali wajib diisi";
    }
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => { setAdminFormStep(p => p + 1); };

  // --- SUBMIT TO SUPABASE ---
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    setState(prev => ({ ...prev, isSubmitting: true }));
    try {
      const isIndenMode = state.viewMode === 'inden';
      const payload = appStateToDb(state.studentData, isIndenMode);
      let error = null;

      if (state.editingIndex !== null) {
        // UPDATE
        const studentId = (state.allRegistrants[state.editingIndex] as any).id;
        if(studentId) {
             const { error: updateError } = await supabase.from('pendaftaran').update(payload).eq('id', studentId);
             error = updateError;
        }
      } else {
        // INSERT
        const { error: insertError } = await supabase.from('pendaftaran').insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      await fetchRegistrants(state.selectedYear);
      let analysis = null;
      if (isIndenMode) {
        try { analysis = await analyzeStudentProfile(state.studentData); } catch(e) { console.error(e); }
      }
      setState(prev => ({ ...prev, isSubmitting: false, isFinished: true, aiAnalysis: analysis, editingIndex: null }));

    } catch (error: any) {
      console.error(error);
      alert("Gagal menyimpan data: " + (error.message || "Unknown Error"));
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // --- DELETE FROM SUPABASE ---
  const handleDelete = (index: number) => { setDeleteConfirm({ show: true, index }); };
  const performDelete = async () => {
    const index = deleteConfirm.index;
    if (index === null) return;
    const studentId = (state.allRegistrants[index] as any).id;
    if (!studentId) return;

    setState(prev => ({ ...prev, isSubmitting: true }));
    const { error } = await supabase.from('pendaftaran').delete().eq('id', studentId);

    if (error) { alert("Gagal menghapus data"); } 
    else { await fetchRegistrants(state.selectedYear); setDeleteConfirm({ show: false, index: null }); }
    setState(prev => ({ ...prev, isSubmitting: false }));
  };

  const handlePrintBukti = async () => {
    const element = document.getElementById('print-area');
    if (!element) return;
    try {
      const canvas = await (window as any).html2canvas(element, { scale: 4, useCORS: true, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Bukti_Registrasi_${state.studentData.namaSiswa?.replace(/\s+/g, '_')}.png`;
      link.href = imgData;
      link.click();
    } catch (error) { window.print(); }
  };

  const exportToExcel = () => {
    if (state.allRegistrants.length === 0) return alert("Database masih kosong.");
    const dataToExport = state.allRegistrants.map((item) => {
        // Export menggunakan format database yang lengkap (snake_case)
        return appStateToDb(item, item.isInden || false);
    });
    const worksheet = (window as any).XLSX.utils.json_to_sheet(dataToExport);
    const workbook = (window as any).XLSX.utils.book_new();
    (window as any).XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    (window as any).XLSX.writeFile(workbook, `EMIS_SPMB_${state.selectedYear.replace('/','-')}.xlsx`);
  };

  const renderInput = (label: string, field: keyof StudentData, type: string = "text", placeholder?: string) => (
    <div className="mb-4 text-left">
      <label className="block text-slate-500 text-[9px] font-black mb-1.5 uppercase tracking-widest">{label}</label>
      <input type={type} placeholder={placeholder} className={`w-full bg-slate-900/40 border ${state.errors[field] ? 'border-red-500' : 'border-slate-800'} text-slate-100 rounded-2xl px-5 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-all placeholder:text-slate-700`} value={(state.studentData[field] as string) || ''} onChange={(e) => updateData({ [field]: e.target.value })} />
      {state.errors[field] && <p className="text-red-500 text-[8px] mt-1.5 uppercase font-bold flex items-center gap-1"><span className="w-1 h-1 bg-red-500 rounded-full"></span> {state.errors[field]}</p>}
    </div>
  );

  const renderSelect = (label: string, field: keyof StudentData, options: string[]) => (
    <div className="mb-4 text-left">
      <label className="block text-slate-500 text-[9px] font-black mb-1.5 uppercase tracking-widest">{label}</label>
      <select className={`w-full bg-slate-900/40 border ${state.errors[field] ? 'border-red-500' : 'border-slate-800'} text-slate-100 rounded-2xl px-5 py-3.5 text-xs focus:outline-none focus:ring-2 focus:ring-maroon/50 focus:border-maroon transition-all appearance-none cursor-pointer`} value={(state.studentData[field] as string) || ''} onChange={(e) => updateData({ [field]: e.target.value })} >
        <option value="">Pilih {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  const renderProgramCards = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-tighter"><span className="text-maroon">#AuraCheck:</span> Pilih Program Pilihan Kamu</label>
        <span className="text-[9px] font-bold text-slate-600 bg-slate-900 px-3 py-1 rounded-full uppercase">Certified Tier Only</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {PROGRAM_OPTIONS.map((prog) => {
          const isSelected = state.studentData.pilihanProgram === prog.id;
          return (
            <button key={prog.id} type="button" onClick={() => updateData({ pilihanProgram: prog.id as any })} className={`relative overflow-hidden p-5 rounded-[28px] border-2 transition-all duration-500 flex flex-col items-start text-left group h-full ${isSelected ? `${prog.color} bg-white/5 ${prog.glow} scale-[1.02] z-10` : 'bg-slate-900/20 border-slate-800 hover:border-slate-700'}`}>
              {isSelected && <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/10 to-transparent blur-2xl`}></div>}
              <div className="flex justify-between items-start w-full mb-3">
                <div className={`text-3xl transition-transform duration-500 ${isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>{prog.icon}</div>
                <div className={`text-[7px] font-black px-2 py-0.5 rounded-full border border-current ${isSelected ? 'opacity-100' : 'opacity-30'}`}>{prog.tier}</div>
              </div>
              <h5 className={`text-[12px] font-black mb-1.5 tracking-tight ${isSelected ? 'text-white' : 'text-slate-400'}`}>{prog.label}</h5>
              <p className={`text-[9px] leading-relaxed transition-colors ${isSelected ? 'text-slate-200' : 'text-slate-600'}`}>{prog.desc}</p>
              {isSelected && <div className="mt-3 w-full h-1 bg-maroon/20 rounded-full overflow-hidden"><div className="w-full h-full bg-maroon animate-pulse"></div></div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderCascadingField = (label: string, field: keyof StudentData, options: string[]) => {
    const value = (state.studentData[field] as string) || '';
    const isManualInput = value !== '' && !options.includes(value);
    const dropdownValue = isManualInput ? 'Lainnya' : (options.includes(value) ? value : '');
    return (
      <div className="mb-4 text-left animate-in fade-in duration-300">
        <label className="block text-slate-500 text-[9px] font-black mb-1.5 uppercase tracking-widest">{label}</label>
        <div className="space-y-2">
          <select className={`w-full bg-slate-900/40 border ${state.errors[field] && !value ? 'border-red-500' : 'border-slate-800'} text-slate-100 rounded-2xl px-5 py-3.5 text-xs focus:outline-none transition-all appearance-none cursor-pointer`} value={dropdownValue} onChange={(e) => { const val = e.target.value; if (val === 'Lainnya') { updateData({ [field]: ' ' }); } else { updateData({ [field]: val }); } }}>
            <option value="">Pilih {label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="Lainnya">Lainnya (Isi Manual)...</option>
          </select>
          {(dropdownValue === 'Lainnya') && (
            <input type="text" placeholder={`Ketik Nama ${label} Manual...`} className={`w-full bg-slate-800 border ${state.errors[field] ? 'border-red-500' : 'border-slate-600'} text-white rounded-2xl px-5 py-3.5 text-xs focus:outline-none animate-in slide-in-from-top-2 focus:ring-2 focus:ring-maroon placeholder:text-slate-500 font-medium`} value={value === ' ' ? '' : value} onChange={(e) => updateData({ [field]: e.target.value })} autoFocus />
          )}
        </div>
      </div>
    );
  };

  const renderAdminFormSection = () => {
    switch (adminFormStep) {
      case 0: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h4 className="text-maroon font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-maroon rounded-full"></span> Identitas Siswa</h4>
          <div className="flex justify-center mb-8">
            <div onClick={() => studentPhotoRef.current?.click()} className="w-32 h-32 rounded-full bg-slate-900/40 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-maroon hover:bg-maroon/10 transition-all overflow-hidden relative group">
              {(state.studentData.fotoSiswa) ? (<img src={state.studentData.fotoSiswa} alt="Profile" className="w-full h-full object-cover" />) : (<><Icons.User /><span className="text-[8px] mt-2 uppercase font-bold text-slate-500">Upload Foto</span></>)}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-[9px] text-white font-black uppercase tracking-widest">GANTI</span></div>
            </div>
          </div>
          {renderProgramCards()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">
            {renderInput("Nama Siswa *", "namaSiswa")} {renderInput("NIS Lokal", "nisLokal")} {renderInput("NISN *", "nisn")} {renderInput("NIK", "nik")} {renderInput("Tempat Lahir", "tempatLahir")} {renderInput("Tanggal Lahir", "tanggalLahir", "date")}
            {renderSelect("Agama", "agama", ["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Konghucu"])} {renderSelect("Jenis Kelamin", "jenisKelamin", ["Laki-laki", "Perempuan"])} {renderInput("Warga Negara", "wargaNegara")}
            {renderInput("Hobi", "hobi")} {renderInput("Anak Ke-", "anakKe")} {renderInput("Jumlah Saudara", "jumlahSaudara")}
          </div>
        </div>
      );
      case 1: 
        const kabOptions = KABUPATEN_MAP[state.studentData.propinsi || ''] || [];
        const kecOptions = KECAMATAN_MAP[state.studentData.kabupaten || ''] || [];
        const desaOptions = DESA_MAP[state.studentData.kecamatan || ''] || [];
        return (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h4 className="text-maroon font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-maroon rounded-full"></span> Alamat & Kontak Siswa</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">
              {renderSelect("Jenis Tempat Tinggal", "jenisTempatTinggal", ["Bersama Orang Tua", "Wali", "Kos", "Asrama", "Lainnya"])}
              <div className="col-span-1 md:col-span-2">{renderInput("Alamat Lengkap *", "alamat")}</div>
              {renderCascadingField("Provinsi", "propinsi", PROVINSI_OPTIONS)} {renderCascadingField("Kabupaten", "kabupaten", kabOptions)} {renderCascadingField("Kecamatan", "kecamatan", kecOptions)} {renderCascadingField("Desa/Kelurahan", "desaKelurahan", desaOptions)}
              {renderInput("Kode Pos", "kodePos")} {renderInput("WhatsApp Aktif *", "nomorTelepon", "tel")}
              {renderSelect("Transportasi", "transportasi", ["Jalan Kaki", "Sepeda", "Motor", "Mobil Pribadi", "Antar Jemput", "Angkutan Umum"])} {renderSelect("Jarak ke Sekolah", "jarakTempatTinggal", ["Kurang dari 1 km", "1 - 5 km", "5 - 10 km", "Lebih dari 10 km"])} {renderInput("Waktu Tempuh (Menit)", "jarakTempuh")}
            </div>
          </div>
        );
      case 2: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h4 className="text-maroon font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-maroon rounded-full"></span> Data Keluarga</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("No. Kartu Keluarga", "noKK")} {renderInput("Nama Kepala Keluarga", "namaKepKeluarga")}</div>
          <div className="col-span-full border-t border-slate-800 my-6"></div>
          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">A. Data Ayah</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("Nama Ayah", "namaAyah")} {renderInput("NIK Ayah", "nikAyah")} {renderInput("Tempat Lahir Ayah", "tempatLahirAyah")} {renderInput("Tgl Lahir Ayah", "tglLahirAyah", "date")} {renderSelect("Status Ayah", "statusAyah", ["Masih Hidup", "Meninggal Dunia", "Bercerai"])} {renderSelect("Pekerjaan Ayah", "pekerjaanAyah", PEKERJAAN_OPTIONS)} {renderSelect("Penghasilan Ayah", "penghasilanAyahPerbulan", PENDAPATAN_OPTIONS)} {renderSelect("Pendidikan Ayah", "pendidikanAyah", PENDIDIKAN_OPTIONS)}</div>
          <div className="col-span-full border-t border-slate-800 my-6"></div>
          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">B. Data Ibu</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("Nama Ibu", "namaIbu")} {renderInput("NIK Ibu", "nikIbu")} {renderInput("Tempat Lahir Ibu", "tempatLahirIbu")} {renderInput("Tgl Lahir Ibu", "tglLahirIbu", "date")} {renderSelect("Status Ibu", "statusIbu", ["Masih Hidup", "Meninggal Dunia", "Bercerai"])} {renderSelect("Pekerjaan Ibu", "pekerjaanIbu", PEKERJAAN_OPTIONS)} {renderSelect("Penghasilan Ibu", "penghasilanIbuPerbulan", PENDAPATAN_OPTIONS)} {renderSelect("Pendidikan Ibu", "pendidikanIbu", PENDIDIKAN_OPTIONS)}</div>
          <div className="col-span-full border-t border-slate-800 my-6"></div>
          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">C. Data Wali (Jika Ada)</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("Nama Wali", "namaWali")} {renderInput("NIK Wali", "nikWali")} {renderInput("Tahun Lahir Wali", "tahunLahirWali", "number")} {renderSelect("Pekerjaan Wali", "pekerjaanWali", PEKERJAAN_OPTIONS)} {renderSelect("Penghasilan Wali", "penghasilanWali", PENDAPATAN_OPTIONS)} {renderSelect("Pendidikan Wali", "pendidikanWali", PENDIDIKAN_OPTIONS)}</div>
        </div>
      );
      case 3: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h4 className="text-maroon font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-maroon rounded-full"></span> Bantuan & Keadaan Rumah</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("Nomor KKS / KPS", "kksKps", "text", "Nomor Kartu Kompensasi Sosial")} {renderInput("Nomor PKH", "pkh", "text", "Nomor Program Keluarga Harapan")} {renderInput("Nomor PIP", "pip", "text", "Nomor Program Indonesia Pintar")} {renderInput("Nomor KIP", "kip", "text", "Nomor Kartu Indonesia Pintar")} {renderSelect("Status Kepemilikan Rumah", "statusKepemilikanRumahOrangTua", ["Milik Sendiri", "Sewa/Kontrak", "Menumpang", "Rumah Dinas", "Lainnya"])}</div>
          <p className="mt-6 text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">* Kosongkan jika tidak memiliki kartu bantuan.</p>
        </div>
      );
      case 4: return (
        <div className="animate-in fade-in slide-in-from-right-4">
          <h4 className="text-maroon font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2"><span className="w-2 h-2 bg-maroon rounded-full"></span> Sekolah Asal</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-5">{renderInput("Tahun Ajaran", "tahunAjaran")} {renderSelect("Jenis Lembaga", "jenisLembagaJenjang", ["SD", "MI", "Paket A", "Lainnya"])} {renderSelect("Status Sekolah", "statusSekolahAsal", ["Negeri", "Swasta"])} {renderInput("NPSN Sekolah Asal", "npsnSekolah")} {renderInput("Nama Sekolah Asal", "namaSekolahMadrasah")} {renderInput("Lokasi Sekolah Asal", "lokasiSekolah")}
            <div className="col-span-full border-t border-slate-800 my-4"></div>
            {renderInput("No Peserta UN", "noPesertaUN")} {renderInput("No Blanko SKHU", "noBlankoSKHU")} {renderInput("No Seri Ijazah", "noSeriIjazah")} {renderInput("Total Nilai UN", "totalNilaiUN")}
          </div>
        </div>
      );
      default: return null;
    }
  };

  if (state.viewMode === 'landing' && !state.isFinished) return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-maroon/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-violet-900/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      <div className="animate-in zoom-in-95 duration-1000 flex flex-col items-center">
        <LogoComponent size="lg" interactive={false} />
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mt-10 mb-4 leading-[0.9] uppercase italic">SPMB<br/><span className="text-maroon">MUTULINGGA</span></h1>
        <p className="text-slate-500 font-bold text-lg max-w-lg mb-14 uppercase tracking-widest leading-none">The Future Starts Here. <span className="text-maroon">#RealSigma</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
          <button onClick={() => setState(prev => ({ ...prev, viewMode: 'inden', currentStep: 'inden' }))} className="glass group p-12 rounded-[50px] border-maroon/30 hover:border-maroon hover:bg-maroon/10 transition-all text-left relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-maroon/20 rounded-full blur-3xl group-hover:bg-maroon/40 transition-all"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">DAFTAR INDEN</h3>
              <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-widest mb-8">Amankan kursi & unlock profile analysis berbasis AI.</p>
              <div className="flex items-center gap-3 text-maroon font-black text-[12px] tracking-widest uppercase bg-slate-900/50 w-fit px-5 py-2.5 rounded-full group-hover:bg-maroon group-hover:text-white transition-all">GAS DAFTAR <Icons.Sparkles /></div>
            </div>
          </button>
          <button onClick={() => setState(prev => ({ ...prev, viewMode: 'login' }))} className="glass group p-12 rounded-[50px] border-slate-800 hover:border-slate-600 transition-all text-left relative overflow-hidden">
             <div className="relative z-10">
              <h3 className="text-3xl font-black text-slate-300 mb-2 uppercase tracking-tighter">PORTAL ADMIN</h3>
              <p className="text-slate-500 text-[11px] font-bold leading-relaxed uppercase tracking-widest mb-8">Database management & EMIS integration panel.</p>
              <div className="flex items-center gap-3 text-slate-400 font-black text-[12px] tracking-widest uppercase bg-slate-900/50 w-fit px-5 py-2.5 rounded-full group-hover:bg-slate-700 transition-all">ACCESS SYSTEM <Icons.Academic /></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  if (state.viewMode === 'login') return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="glass max-w-md w-full p-12 rounded-[55px] border-maroon/20 text-center animate-in zoom-in-95 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 maroon-gradient"></div>
        <div className="flex justify-center mb-8"><LogoComponent size="md" interactive={false} /></div>
        <h2 className="text-3xl font-black text-white uppercase mb-10 tracking-tighter">RESTRICTED <span className="text-maroon">AREA</span>.</h2>
        <form onSubmit={handleAdminLogin} className="space-y-5">
          <input type="text" className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all" placeholder="Admin Username" value={loginCreds.user} onChange={e => setLoginCreds(p => ({...p, user: e.target.value}))} />
          <input type="password" className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent transition-all" placeholder="Password" value={loginCreds.pass} onChange={e => setLoginCreds(p => ({...p, pass: e.target.value}))} />
          {loginError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest animate-bounce mt-2">{loginError}</p>}
          <button type="submit" className="w-full maroon-gradient text-white py-5 rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95 hover:brightness-110">AUTHORIZE ACCESS</button>
        </form>
        <button onClick={safeExit} className="mt-8 text-[11px] font-black text-slate-600 uppercase hover:text-white transition-colors tracking-widest underline decoration-maroon/30 decoration-2 underline-offset-8">BACK TO HOME</button>
      </div>
    </div>
  );

  if (state.isFinished) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-in fade-in overflow-hidden relative">
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-maroon/5 rounded-full blur-[150px]"></div>
       <div className="w-24 h-24 bg-maroon rounded-[35px] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(128,0,0,0.5)] mx-auto no-print relative z-10"><svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></div>
       <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase no-print relative z-10">GOAL! <span className="text-maroon">CERTIFIED SIGMA.</span></h1>
       <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest mb-10 no-print">Kamu resmi terdaftar di Mutulingga.</p>
       <div id="print-area" className="max-w-[480px] w-full bg-white text-slate-900 p-10 rounded-[45px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] text-left relative overflow-hidden print:shadow-none print:border print:border-slate-200">
          <div className="absolute top-0 left-0 w-full h-3 bg-maroon"></div>
          <div className="flex justify-between items-start mb-8">
             <div className="flex items-center gap-4"><LogoComponent size="sm" isBlackAndWhite={true} interactive={false} /><div><h2 className="font-black text-[13px] uppercase text-maroon leading-none">Mutulingga</h2><p className="text-[8px] font-black text-slate-400 mt-1 uppercase tracking-widest">Islamic Boarding School</p></div></div>
             <div className="text-right"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry ID</p><p className="text-4xl font-black text-maroon leading-none tracking-tighter">#{state.studentData.noUrut}</p></div>
          </div>
          <div className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 mb-8">
             <p className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-[0.2em] text-center border-b border-slate-200 pb-3">REGISTRATION CARD</p>
             <div className="flex gap-4">
                <div className="grid grid-cols-2 gap-y-6 flex-1">
                   <div className="col-span-2"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</p><p className="text-lg font-black text-slate-900 uppercase tracking-tight">{state.studentData.namaSiswa}</p></div>
                   <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NISN ID</p><p className="text-[15px] font-bold text-slate-700">{state.studentData.nisn}</p></div>
                   <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tier/Program</p><p className="text-[15px] font-black text-maroon uppercase tracking-tight">{state.studentData.pilihanProgram}</p></div>
                   <div className="col-span-2 pt-4 border-t border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Previous School</p><p className="text-[13px] font-bold text-slate-700 uppercase italic truncate">{state.studentData.namaSekolahMadrasah || 'Unverified'}</p></div>
                </div>
                {state.studentData.fotoSiswa && (<div className="w-24 h-32 rounded-xl overflow-hidden border border-slate-200 shadow-sm flex-shrink-0 bg-slate-200"><img src={state.studentData.fotoSiswa} alt="Siswa" className="w-full h-full object-cover grayscale contrast-125" /></div>)}
             </div>
          </div>
          {state.aiAnalysis && <div className="mt-4 p-6 bg-slate-50 rounded-[35px] border-l-4 border-maroon no-print"><p className="text-[11px] italic text-slate-600 leading-relaxed font-medium">{state.aiAnalysis}</p></div>}
       </div>
       <div className="flex gap-4 mt-12 no-print w-full max-w-[480px]">
          <button onClick={handlePrintBukti} className="flex-1 flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-5 rounded-[25px] font-black uppercase text-[11px] shadow-xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"><Icons.Download /> SAVE CARD</button>
          <button onClick={safeExit} className="flex-1 bg-maroon text-white px-8 py-5 rounded-[25px] font-black uppercase text-[11px] shadow-[0_15px_30px_rgba(128,0,0,0.3)] hover:brightness-110 transition-all active:scale-95">BACK HOME</button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-20 selection:bg-maroon selection:text-white">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <input type="file" ref={studentPhotoRef} onChange={handleStudentPhotoChange} accept="image/*" className="hidden" />
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass p-10 rounded-[40px] border-maroon/30 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="w-16 h-16 bg-maroon/20 text-maroon rounded-2xl flex items-center justify-center mx-auto mb-6"><Icons.Trash /></div>
             <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">HAPUS DATA?</h3>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">Data registran ini akan dihapus secara permanen dari database sistem.</p>
             <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm({ show: false, index: null })} className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 text-slate-500 font-black uppercase text-[10px] border border-slate-800 hover:text-white transition-all">BATAL</button>
                <button onClick={performDelete} className="flex-1 px-6 py-4 rounded-2xl bg-maroon text-white font-black uppercase text-[10px] shadow-lg shadow-maroon/20 hover:brightness-110 active:scale-95 transition-all">YA, HAPUS</button>
             </div>
          </div>
        </div>
      )}
      <nav className="p-6 sticky top-0 z-50 bg-slate-950/80 backdrop-blur-3xl border-b border-slate-900 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={safeExit}><LogoComponent size="sm" interactive={state.viewMode === 'admin'} /><div className="text-left"><h1 className="font-black text-sm tracking-tighter uppercase leading-none group-hover:text-maroon transition-colors">MTsM 01 PBG</h1><p className="text-[9px] text-maroon font-black uppercase mt-1 tracking-widest">Bener, Pinter, Trampil</p></div></div>
          <div className="flex items-center gap-6">
            {state.viewMode === 'admin' && <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-800"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div><span className="text-[9px] font-black uppercase text-slate-400">Admin Session Active</span></div>}
            <button onClick={safeExit} className="text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-maroon hover:border-maroon transition-all">{state.viewMode === 'admin' ? 'LOGOUT' : 'EXIT FORM'}</button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-4 md:p-8 mt-6">
        <div className="glass rounded-[60px] p-8 md:p-16 border-maroon/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-maroon/5 blur-[80px]"></div>
          {state.viewMode === 'admin' && (
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8 relative z-10">
              <div className="flex gap-4 bg-slate-950/50 p-2 rounded-2xl border border-slate-900">
                <button onClick={() => setAdminSubView('table')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${adminSubView === 'table' ? 'bg-maroon text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}>DB_EMIS_MASTER</button>
                <button onClick={() => { setAdminSubView('form'); setAdminFormStep(0); updateData({ ...FULL_EMPTY_STUDENT_DATA }); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${adminSubView === 'form' ? 'bg-maroon text-white shadow-lg' : 'text-slate-600 hover:text-white'}`}>NEW_ENTRY</button>
              </div>
              <div className="flex items-center gap-4"><span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">ARCHIVE_FILTER:</span><select className="bg-slate-950 border border-slate-900 text-[10px] font-black uppercase text-maroon rounded-xl px-5 py-3.5 focus:outline-none transition-all" value={state.selectedYear} onChange={(e) => setState(p => ({ ...p, selectedYear: e.target.value }))}>{ACADEMIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            </div>
          )}
          {state.viewMode === 'inden' ? (
            <div className="animate-in fade-in slide-in-from-bottom-8 max-w-6xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div><h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white leading-[0.85] italic">FORMULIR<br/><span className="text-maroon">INDEN.SPMB</span></h2><p className="mt-4 text-slate-500 font-bold uppercase text-[11px] tracking-[0.3em] flex items-center gap-2">Secure your spot at the most sigma school <span className="w-1.5 h-1.5 bg-maroon rounded-full animate-ping"></span></p></div>
                <div className="w-20 h-20 maroon-gradient rounded-3xl flex flex-col items-center justify-center font-black text-white shadow-[0_20px_40px_rgba(128,0,0,0.4)] rotate-3"><span className="text-[10px] opacity-60">RANK</span><span className="text-2xl leading-none">#{state.studentData.noUrut}</span></div>
              </div>
              <div className="bento-layout space-y-8">
                <div className="p-8 rounded-[45px] bg-slate-900/10 border border-slate-800/50">{renderProgramCards()}</div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-[45px] bg-slate-900/10 border border-slate-800/50 h-full">
                     <h4 className="text-[12px] font-black uppercase text-maroon mb-6 tracking-widest flex items-center gap-2">A. IDENTITAS CALON SISWA <span className="h-px flex-1 bg-maroon/10"></span></h4>
                     <div className="mb-6 flex justify-center">
                        <div className={`w-32 h-32 rounded-full overflow-hidden border-2 ${isCameraOpen ? 'border-maroon animate-pulse' : 'border-slate-700 border-dashed'} flex flex-col items-center justify-center relative bg-slate-900/40`}>
                            {isCameraOpen ? (<><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" /><canvas ref={canvasRef} className="hidden" /></>) : state.studentData.fotoSiswa ? (<div className="relative w-full h-full group"><img src={state.studentData.fotoSiswa} alt="Captured" className="w-full h-full object-cover" /><div onClick={retakePhoto} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"><span className="text-[9px] text-white font-black uppercase tracking-widest">AMBIL ULANG</span></div></div>) : (<div onClick={startCamera} className="flex flex-col items-center cursor-pointer group hover:opacity-80 transition-opacity"><Icons.User /><span className="text-[8px] mt-2 uppercase font-bold text-slate-500 group-hover:text-maroon transition-colors">Buka Kamera</span></div>)}
                        </div>
                     </div>
                     {isCameraOpen && (<div className="flex justify-center gap-2 mb-6"><button onClick={stopCamera} className="px-3 py-1.5 rounded-full bg-slate-800 text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-wider">Batal</button><button onClick={capturePhoto} className="px-4 py-1.5 rounded-full bg-maroon text-[9px] font-bold text-white uppercase tracking-wider shadow-lg hover:brightness-110">Jepret!</button></div>)}
                     <div className="space-y-4">{renderInput("1. Nama Lengkap *", "namaSiswa", "text", "Sesuai Ijazah/Akta")} {renderSelect("2. Jenis Kelamin *", "jenisKelamin", ["Laki-laki", "Perempuan"])} {renderInput("3. NISN (10 Digit) *", "nisn", "text", "Cek di rapor SD/MI")} {renderInput("4. Asal SD/MI *", "namaSekolahMadrasah", "text", "Nama sekolah asal")}
                        <div className="grid grid-cols-2 gap-4">{renderInput("5. Tempat Lahir *", "tempatLahir", "text", "Kota lahir")} {renderInput("Tanggal Lahir *", "tanggalLahir", "date")}</div>
                     </div>
                  </div>
                  <div className="p-8 rounded-[45px] bg-slate-900/10 border border-slate-800/50 h-full">
                     <h4 className="text-[12px] font-black uppercase text-maroon mb-6 tracking-widest flex items-center gap-2">B. KONTAK ORANG TUA / WALI <span className="h-px flex-1 bg-maroon/10"></span></h4>
                     <div className="space-y-4">{renderInput("1. Nama Ayah/Ibu/Wali *", "namaKepKeluarga", "text", "Nama orang tua atau wali")}
                        <div className="bg-maroon/5 p-4 rounded-2xl border border-maroon/20 mb-4">{renderInput("2. No. WhatsApp Aktif *", "nomorTelepon", "tel", "08xxxxxx (Untuk Info Kelulusan)")}<p className="text-[9px] text-maroon font-bold italic mt-[-10px]">*Pastikan nomor aktif WA</p></div>
                        {renderInput("3. Alamat Tinggal Sekarang *", "alamat", "text", "Jalan, RT/RW, Desa, Kecamatan")}
                     </div>
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={state.isSubmitting} className="group w-full maroon-gradient text-white py-7 rounded-[35px] font-black uppercase text-sm tracking-[0.4em] shadow-[0_25px_50px_rgba(128,0,0,0.4)] mt-12 transition-all active:scale-[0.97] hover:brightness-125 relative overflow-hidden"><span className="relative z-10 flex items-center justify-center gap-4">{state.isSubmitting ? 'PROCESSING_DATA...' : 'SUBMIT INDEN REQUEST'} {!state.isSubmitting && <Icons.Sparkles />}</span><div className="absolute top-0 left-[-100%] w-full h-full bg-white/10 group-hover:left-[100%] transition-all duration-1000 skew-x-12"></div></button>
            </div>
          ) : adminSubView === 'form' ? (
            <div className="animate-in fade-in slide-in-from-right-8 max-w-6xl mx-auto relative z-10">
              <div className="flex justify-between items-center mb-12"><div><h3 className="text-4xl font-black text-white uppercase tracking-tighter italic">MASTER<span className="text-maroon">.EMIS</span>_ENTRY</h3><p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-2">Section: {adminFormSections[adminFormStep]}</p></div><div className="flex gap-2">{adminFormSections.map((_, idx) => (<div key={idx} className={`h-1.5 rounded-full transition-all duration-700 ${idx === adminFormStep ? 'bg-maroon w-12' : idx < adminFormStep ? 'bg-maroon/30 w-6' : 'bg-slate-900 w-6'}`}></div>))}</div></div>
              <div className="min-h-[450px] p-10 rounded-[45px] bg-slate-900/5 border border-slate-900">{renderAdminFormSection()}</div>
              <div className="flex gap-6 mt-16 pt-10 border-t border-slate-900">
                {adminFormStep === 0 ? (<button onClick={() => setAdminSubView('table')} className="flex-1 bg-slate-900 text-slate-500 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-widest hover:text-white transition-all border border-slate-800">CANCEL_PROCESS</button>) : (<button onClick={() => setAdminFormStep(p => p - 1)} className="flex-1 bg-slate-900 text-slate-500 py-5 rounded-[25px] font-black uppercase text-[10px] tracking-widest hover:text-white transition-all border border-slate-800">BACK_PREV</button>)}
                {adminFormStep < adminFormSections.length - 1 ? (<button onClick={handleNextStep} className="flex-[3] maroon-gradient text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-[0.98] hover:brightness-110">CONTINUE_STEP</button>) : (<button onClick={handleSubmit} disabled={state.isSubmitting} className="flex-[3] maroon-gradient text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-2xl transition-all active:scale-[0.98] hover:brightness-110">{state.isSubmitting ? 'SAVING_MASTER_DATA...' : (state.editingIndex !== null ? 'UPDATE_DATABASE_RECORD' : 'COMMIT_DATABASE_ENTRY')}</button>)}
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="text-left"><h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">ARCHIVE<span className="text-maroon">.{state.selectedYear}</span></h3><p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2">Active Record Count: {sortedData.length} Souls</p></div>
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-72"><span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700"><Icons.Sparkles /></span><input type="text" placeholder="FILTER_NAME_OR_NISN..." className="w-full bg-slate-950 border border-slate-900 text-white rounded-2xl pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-maroon placeholder:text-slate-800" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} /></div>
                  <button onClick={exportToExcel} className="bg-emerald-600/10 border border-emerald-600/30 text-emerald-400 hover:bg-emerald-600 hover:text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 group shadow-lg"><Icons.Download /> <span className="text-[10px] font-black uppercase tracking-widest">GEN_EMIS_REPORT</span></button>
                </div>
              </div>
              <div className="overflow-x-auto rounded-[40px] border border-slate-900 bg-slate-950/50 backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                  <thead><tr className="border-b border-slate-900 bg-slate-950/80"><th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">#NO</th><th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] cursor-pointer hover:text-maroon group" onClick={() => setSortConfig({ key: 'namaSiswa', direction: sortConfig?.direction === 'asc' ? 'desc' : 'asc' })}>MASTER_NAME <span className="opacity-30 group-hover:opacity-100">{sortConfig?.key === 'namaSiswa' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></th><th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">NISN_ID</th><th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">TIER_SELECTED</th><th className="p-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] text-center">CMD_CONTROL</th></tr></thead>
                  <tbody>{paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-900/30 hover:bg-white/5 transition-all duration-300 group">
                      <td className="p-6 text-[10px] font-bold text-slate-700 italic">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="p-6"><div className="flex flex-col"><span className="text-xs font-black text-white uppercase tracking-tight">{item.namaSiswa}</span><span className="text-[8px] text-slate-600 font-bold uppercase">{item.namaSekolahMadrasah || 'No School Data'}</span></div></td>
                      <td className="p-6 text-[11px] font-medium text-slate-500 font-mono tracking-wider">{item.nisn}</td>
                      <td className="p-6"><span className="text-[9px] font-black px-3 py-1 bg-maroon/5 border border-maroon/20 text-maroon rounded-full uppercase italic tracking-tighter">{item.pilihanProgram || 'Reguler'}</span></td>
                      <td className="p-6"><div className="flex justify-center gap-3">
                        <button onClick={() => { setState(p => ({ ...p, studentData: { ...item }, editingIndex: state.allRegistrants.indexOf(item) })); setAdminSubView('form'); setAdminFormStep(0); }} className="w-10 h-10 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-sm border border-slate-800"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button onClick={() => handleDelete(state.allRegistrants.indexOf(item))} className="w-10 h-10 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center hover:bg-maroon hover:text-white transition-all shadow-sm border border-slate-800"><Icons.Trash /></button>
                      </div></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="p-16 text-center text-slate-700 text-[10px] font-black uppercase tracking-[0.5em] italic">No active registrants found in this year's archive.</td></tr>}</tbody>
                </table>
              </div>
              {sortedData.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-10 px-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">PAGE_INDEX: {currentPage} / {Math.ceil(sortedData.length / itemsPerPage)}</p>
                  <div className="flex gap-3"><button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-6 py-3 bg-slate-950 border border-slate-900 text-slate-600 rounded-xl text-[10px] font-black uppercase disabled:opacity-10 hover:text-white transition-all">PREV_SYS</button><button disabled={currentPage >= Math.ceil(sortedData.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)} className="px-6 py-3 bg-slate-950 border border-slate-900 text-slate-600 rounded-xl text-[10px] font-black uppercase disabled:opacity-10 hover:text-white transition-all">NEXT_SYS</button></div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
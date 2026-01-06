// types.ts

export interface StudentData {
  // Metadata (Optional karena baru ada setelah save ke DB)
  id?: string;
  created_at?: string;
  isInden?: boolean;
  
  // Identitas
  tahunAjaran: string;
  noUrut: string;
  namaSiswa: string;
  nisLokal: string;
  nisn: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  wargaNegara: string;
  jenisKelamin: string;
  hobi: string;
  anakKe: string;
  jumlahSaudara: string;
  pilihanProgram: string;
  fotoSiswa: string;

  // Alamat
  jenisTempatTinggal: string;
  alamat: string;
  propinsi: string;
  kabupaten: string;
  kecamatan: string;
  desaKelurahan: string;
  kodePos: string;
  nomorTelepon: string;
  jarakTempatTinggal: string;
  transportasi: string;
  jarakTempuh: string;

  // Keluarga
  noKK: string;
  namaKepKeluarga: string;

  // Ayah
  namaAyah: string;
  nikAyah: string;
  tempatLahirAyah: string;
  tglLahirAyah: string;
  statusAyah: string;
  pekerjaanAyah: string;
  penghasilanAyahPerbulan: string;
  pendidikanAyah: string;

  // Ibu
  namaIbu: string;
  nikIbu: string;
  tempatLahirIbu: string;
  tglLahirIbu: string;
  statusIbu: string;
  pekerjaanIbu: string;
  penghasilanIbuPerbulan: string;
  pendidikanIbu: string;

  // Wali
  namaWali: string;
  tahunLahirWali: string;
  nikWali: string;
  pendidikanWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;

  // Bantuan
  kksKps: string;
  pkh: string;
  pip: string;
  kip: string;
  statusKepemilikanRumahOrangTua: string;

  // Sekolah Asal
  jenisLembagaJenjang: string;
  statusSekolahAsal: string;
  npsnSekolah: string;
  namaSekolahMadrasah: string;
  lokasiSekolah: string;
  noPesertaUN: string;
  noBlankoSKHU: string;
  noSeriIjazah: string;
  totalNilaiUN: string;
}

export interface AppState {
  viewMode: 'landing' | 'inden' | 'login' | 'admin';
  currentStep: 'inden' | 'data_diri' | 'sekolah' | 'ortu' | 'finish';
  selectedYear: string;
  studentData: StudentData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isFinished: boolean;
  aiAnalysis: string | null;
  allRegistrants: StudentData[];
  editingIndex: number | null;
  isAdminAuthenticated: boolean;
  lastBackupTime: string | null;
}
export interface Pendaftar {
  id?: number;
  created_at?: string;
  nama_lengkap: string;
  nisn: string;
  alamat: string;
  no_whatsapp: string;
  asal_sekolah: string;
  jurusan: 'RPL' | 'TKJ' | 'AKL' | 'OTKP' | '';
}

export type ViewMode = 'landing' | 'form' | 'login' | 'admin';

export type FormStep = 'inden' | 'personal' | 'address' | 'family' | 'guardian' | 'assistance' | 'school' | 'review';

export interface StudentData {
  id?: string;
  created_at?: string;
  
  // Data Siswa
  namaSiswa?: string;
  nisLokal?: string;
  nisn?: string;
  nik?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: string;
  wargaNegara?: string;
  jenisKelamin?: string;
  hobi?: string;
  anakKe?: number;
  jumlahSaudara?: number;

  // Alamat & Kontak
  jenisTempatTinggal?: string;
  alamat?: string;
  propinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  desaKelurahan?: string;
  kodePos?: string;
  nomorTelepon?: string;
  jarakTempatTinggal?: string;
  transportasi?: string;
  jarakTempuh?: string;

  // Data Keluarga
  noKK?: string;
  namaKepKeluarga?: string;

  // Ayah
  namaAyah?: string;
  nikAyah?: string;
  tempatLahirAyah?: string;
  tglLahirAyah?: string;
  statusAyah?: string;
  pekerjaanAyah?: string;
  penghasilanAyahPerbulan?: string;
  pendidikanAyah?: string;

  // Ibu
  namaIbu?: string;
  nikIbu?: string;
  tempatLahirIbu?: string;
  tglLahirIbu?: string;
  statusIbu?: string;
  pekerjaanIbu?: string;
  penghasilanIbuPerbulan?: string;
  pendidikanIbu?: string;

  // Wali
  namaWali?: string;
  tahunLahirWali?: string;
  nikWali?: string;
  pendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;

  // Bantuan & Rumah
  kksKps?: string;
  pkh?: string;
  pip?: string;
  kip?: string;
  statusKepemilikanRumahOrangTua?: string;

  // Sekolah Asal
  tahunAjaran?: string;
  jenisLembagaJenjang?: string;
  statusSekolahAsal?: string;
  npsnSekolah?: string;
  namaSekolahMadrasah?: string;
  lokasiSekolah?: string;
  noPesertaUN?: string;
  noBlankoSKHU?: string;
  noSeriIjazah?: string;
  totalNilaiUN?: number;

  // Tambahan Aplikasi
  pilihanProgram?: string;
  fotoSiswa?: string;
  noUrut?: string;
  isInden?: boolean;
  aiAnalysis?: string;
}
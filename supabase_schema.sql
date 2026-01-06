-- Membuat tabel pendaftaran
CREATE TABLE pendaftaran (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Identitas Utama
  tahun_ajaran TEXT NOT NULL,
  no_urut TEXT,
  
  -- Data Siswa (Snake case sesuai format export Excel kamu)
  nama_siswa TEXT,
  nis_lokal TEXT,
  nisn TEXT,
  nik TEXT,
  tempat_lahir TEXT,
  tanggal_lahir TEXT,
  agama TEXT,
  warga_negara TEXT,
  jenis_kelamin TEXT,
  hobi TEXT,
  anak_ke TEXT,
  jumlah_saudara TEXT,
  pilihan_program TEXT,
  foto_siswa TEXT, -- Ini akan menyimpan string Base64 (bisa berat, tapi ok untuk awal)

  -- Alamat
  jenis_tempat_tinggal TEXT,
  alamat TEXT,
  propinsi TEXT,
  kabupaten TEXT,
  kecamatan TEXT,
  desa_kelurahan TEXT,
  kode_pos TEXT,
  nomor_telepon TEXT,
  jarak_tempat_tinggal TEXT,
  transportasi TEXT,
  jarak_tempuh TEXT,

  -- Data Keluarga
  no_kk TEXT,
  nama_kep_keluarga TEXT,
  
  -- Ayah
  nama_ayah TEXT,
  nik_ayah TEXT,
  tempat_lahir_ayah TEXT,
  tgl_lahir_ayah TEXT,
  status_ayah TEXT,
  pekerjaan_ayah TEXT,
  penghasilan_ayah_perbulan TEXT,
  pendidikan_ayah TEXT,

  -- Ibu
  nama_ibu TEXT,
  nik_ibu TEXT,
  tempat_lahir_ibu TEXT,
  tgl_lahir_ibu TEXT,
  status_ibu TEXT,
  pekerjaan_ibu TEXT,
  penghasilan_ibu_perbulan TEXT,
  pendidikan_ibu TEXT,

  -- Wali
  nama_wali TEXT,
  tahun_lahir_wali TEXT,
  nik_wali TEXT,
  pendidikan_wali TEXT,
  pekerjaan_wali TEXT,
  penghasilan_wali TEXT,

  -- Bantuan & Rumah
  kks_kps TEXT,
  pkh TEXT,
  pip TEXT,
  kip TEXT,
  status_kepemilikan_rumah_orang_tua TEXT,

  -- Sekolah Asal
  jenis_lembaga_jenjang TEXT,
  status_sekolah_asal TEXT,
  npsn_sekolah TEXT,
  nama_sekolah_madrasah TEXT,
  lokasi_sekolah TEXT,
  no_peserta_un TEXT,
  no_blanko_skhu TEXT,
  no_seri_ijazah TEXT,
  total_nilai_un TEXT,
  
  -- Metadata
  is_inden BOOLEAN DEFAULT false,
  ai_analysis TEXT
);

-- Mematikan RLS sementara agar siapa saja bisa baca/tulis (Hanya untuk dev awal)
-- Nanti bisa kita amankan lagi
ALTER TABLE pendaftaran DISABLE ROW LEVEL SECURITY;

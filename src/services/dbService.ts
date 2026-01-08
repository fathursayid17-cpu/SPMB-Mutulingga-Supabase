import { supabase } from '../lib/supabaseClient';
import { StudentData } from '../types';

// Helper: Mapping dari App State (camelCase) ke DB Column (snake_case)
const mapToDb = (data: Partial<StudentData>) => {
  return {
    // DATA SISWA
    nama_siswa: data.namaSiswa,
    nis_lokal: data.nisLokal,
    nisn: data.nisn,
    nik: data.nik,
    tempat_lahir: data.tempatLahir,
    tanggal_lahir: data.tanggalLahir || null,
    agama: data.agama,
    warga_negara: data.wargaNegara,
    jenis_kelamin: data.jenisKelamin,
    hobi: data.hobi,
    anak_ke: data.anakKe,
    jumlah_saudara: data.jumlahSaudara,

    // ALAMAT & KONTAK
    jenis_tempat_tinggal: data.jenisTempatTinggal,
    alamat: data.alamat,
    propinsi: data.propinsi,
    kabupaten: data.kabupaten,
    kecamatan: data.kecamatan,
    desa_kelurahan: data.desaKelurahan,
    kode_pos: data.kodePos,
    nomor_telepon: data.nomorTelepon,
    jarak_tempat_tinggal: data.jarakTempatTinggal,
    transportasi: data.transportasi,
    jarak_tempuh: data.jarakTempuh,

    // DATA KELUARGA
    no_kk: data.noKK,
    nama_kep_keluarga: data.namaKepKeluarga,
    
    // AYAH
    nama_ayah: data.namaAyah,
    nik_ayah: data.nikAyah,
    tempat_lahir_ayah: data.tempatLahirAyah,
    tgl_lahir_ayah: data.tglLahirAyah || null,
    status_ayah: data.statusAyah,
    pekerjaan_ayah: data.pekerjaanAyah,
    penghasilan_ayah_perbulan: data.penghasilanAyahPerbulan,
    pendidikan_ayah: data.pendidikanAyah,

    // IBU
    nama_ibu: data.namaIbu,
    nik_ibu: data.nikIbu,
    tempat_lahir_ibu: data.tempatLahirIbu,
    tgl_lahir_ibu: data.tglLahirIbu || null,
    status_ibu: data.statusIbu,
    pekerjaan_ibu: data.pekerjaanIbu,
    penghasilan_ibu_perbulan: data.penghasilanIbuPerbulan,
    pendidikan_ibu: data.pendidikanIbu,

    // WALI
    nama_wali: data.namaWali,
    tahun_lahir_wali: data.tahunLahirWali,
    nik_wali: data.nikWali,
    pendidikan_wali: data.pendidikanWali,
    pekerjaan_wali: data.pekerjaanWali,
    penghasilan_wali: data.penghasilanWali,

    // BANTUAN & RUMAH
    kks_kps: data.kksKps,
    pkh: data.pkh,
    pip: data.pip,
    kip: data.kip,
    status_kepemilikan_rumah_orang_tua: data.statusKepemilikanRumahOrangTua,

    // SEKOLAH ASAL
    tahun_ajaran: data.tahunAjaran,
    jenis_lembaga_jenjang: data.jenisLembagaJenjang,
    status_sekolah_asal: data.statusSekolahAsal,
    npsn_sekolah: data.npsnSekolah,
    nama_sekolah_madrasah: data.namaSekolahMadrasah,
    lokasi_sekolah: data.lokasiSekolah,
    no_peserta_un: data.noPesertaUN,
    no_blanko_skhu: data.noBlankoSKHU,
    no_seri_ijazah: data.noSeriIjazah,
    total_nilai_un: data.totalNilaiUN,

    // TAMBAHAN APLIKASI
    pilihan_program: data.pilihanProgram,
    foto_siswa: data.fotoSiswa,
    no_urut: data.noUrut,
    is_inden: data.isInden,
    ai_analysis: data.aiAnalysis
  };
};

// Helper: Mapping dari DB Row (snake_case) ke App State (camelCase)
const mapFromDb = (row: any): Partial<StudentData> => {
  return {
    // SYSTEM
    id: String(row.id), 
    created_at: row.created_at,

    namaSiswa: row.nama_siswa,
    nisLokal: row.nis_lokal,
    nisn: row.nisn,
    nik: row.nik,
    tempatLahir: row.tempat_lahir,
    tanggalLahir: row.tanggal_lahir,
    agama: row.agama,
    wargaNegara: row.warga_negara,
    jenisKelamin: row.jenis_kelamin,
    hobi: row.hobi,
    anakKe: row.anak_ke,
    jumlahSaudara: row.jumlah_saudara,

    jenisTempatTinggal: row.jenis_tempat_tinggal,
    alamat: row.alamat,
    propinsi: row.propinsi,
    kabupaten: row.kabupaten,
    kecamatan: row.kecamatan,
    desaKelurahan: row.desa_kelurahan,
    kodePos: row.kode_pos,
    nomorTelepon: row.nomor_telepon,
    jarakTempatTinggal: row.jarak_tempat_tinggal,
    transportasi: row.transportasi,
    jarakTempuh: row.jarak_tempuh,

    noKK: row.no_kk,
    namaKepKeluarga: row.nama_kep_keluarga,

    namaAyah: row.nama_ayah,
    nikAyah: row.nik_ayah,
    tempatLahirAyah: row.tempat_lahir_ayah,
    tglLahirAyah: row.tgl_lahir_ayah,
    statusAyah: row.status_ayah,
    pekerjaanAyah: row.pekerjaan_ayah,
    penghasilanAyahPerbulan: row.penghasilan_ayah_perbulan,
    pendidikanAyah: row.pendidikan_ayah,

    namaIbu: row.nama_ibu,
    nikIbu: row.nik_ibu,
    tempatLahirIbu: row.tempat_lahir_ibu,
    tglLahirIbu: row.tgl_lahir_ibu,
    statusIbu: row.status_ibu,
    pekerjaanIbu: row.pekerjaan_ibu,
    penghasilanIbuPerbulan: row.penghasilan_ibu_perbulan,
    pendidikanIbu: row.pendidikan_ibu,

    namaWali: row.nama_wali,
    tahunLahirWali: row.tahun_lahir_wali,
    nikWali: row.nik_wali,
    pendidikanWali: row.pendidikan_wali,
    pekerjaanWali: row.pekerjaan_wali,
    penghasilanWali: row.penghasilan_wali,

    kksKps: row.kks_kps,
    pkh: row.pkh,
    pip: row.pip,
    kip: row.kip,
    statusKepemilikanRumahOrangTua: row.status_kepemilikan_rumah_orang_tua,

    tahunAjaran: row.tahun_ajaran,
    jenisLembagaJenjang: row.jenis_lembaga_jenjang,
    statusSekolahAsal: row.status_sekolah_asal,
    npsnSekolah: row.npsn_sekolah,
    namaSekolahMadrasah: row.nama_sekolah_madrasah,
    lokasiSekolah: row.lokasi_sekolah,
    noPesertaUN: row.no_peserta_un,
    noBlankoSKHU: row.no_blanko_skhu,
    noSeriIjazah: row.no_seri_ijazah,
    totalNilaiUN: row.total_nilai_un,

    pilihanProgram: row.pilihan_program,
    fotoSiswa: row.foto_siswa,
    noUrut: row.no_urut,
    isInden: row.is_inden,
    aiAnalysis: row.ai_analysis
  };
};

export const dbService = {
  // Ambil semua data (Year opsional)
  async fetchAll(year?: string) {
    let query = supabase.from('pendaftaran').select('*');

    // Hanya filter jika year ada dan tidak kosong
    if (year && year.trim() !== '') {
      query = query.eq('tahun_ajaran', year);
    }
    
    // Urutkan data terbaru di atas
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data ? data.map(mapFromDb) : [];
  },

  // Simpan data baru
  async create(studentData: Partial<StudentData>) {
    const payload = mapToDb(studentData);
    const { data, error } = await supabase
      .from('pendaftaran')
      .insert([payload])
      .select();

    if (error) throw error;
    return mapFromDb(data[0]);
  },

  // Update data existing
  async update(id: string, studentData: Partial<StudentData>) {
    const payload = mapToDb(studentData);
    const { data, error } = await supabase
      .from('pendaftaran')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) throw error;
    return mapFromDb(data[0]);
  },

  // Hapus data
  async delete(id: string) {
    const { error } = await supabase
      .from('pendaftaran')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
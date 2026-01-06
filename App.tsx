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
  { id: 'Coding', label
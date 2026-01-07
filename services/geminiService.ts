import { GoogleGenAI, Type } from "@google/genai";
import { StudentData } from "../types";

// Helper untuk mendapatkan API Key dengan aman di berbagai environment
const getApiKey = () => {
  const HARDCODED_KEY = 'AIzaSyC4YI4OCQ7r-3gcakKoT9tTerLn2IanPE4';

  // @ts-ignore - Check process directly first
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    // @ts-ignore
    return process.env.API_KEY;
  }
  // Fallback to Vite env
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  return HARDCODED_KEY;
};

export const analyzeStudentProfile = async (data: Partial<StudentData>): Promise<string> => {
  const apiKey = getApiKey();
  
  // Cek jika API Key tidak ada atau kosong
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return `Profil kamu legit banget, ${data.namaSiswa?.split(' ')[0] || 'Sob'}! MTsM 01 Pbg siap bikin kamu makin sigma dan berprestasi. Pilihan program ${data.pilihanProgram || 'kamu'} itu keputusan yang W banget alias WIN! Let's gass! 🚀 (System Note: AI Analysis Offline)`;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Berperanlah sebagai AI Konselor Pendidikan Masa Depan di MTs Muhammadiyah 01 Purbalingga. 
    Visi sekolah kami adalah "Bener, Pinter, lan Trampil" (Benar dalam akhlak, Pintar dalam ilmu, dan Terampil dalam keahlian).
    Analisis profil calon murid baru ini dan berikan feedback yang sangat memotivasi, keren, dan menggunakan gaya bahasa Gen Alpha (slay, rizz, sigma, certified, W, gass, aura, dll).
    
    Data Murid:
    - Nama: ${data.namaSiswa || 'Siswa'}
    - Hobi: ${data.hobi || '-'}
    - Asal Sekolah: ${data.namaSekolahMadrasah || '-'}
    - Program Pilihan: ${data.pilihanProgram || 'Reguler'}
    
    Struktur Jawaban (Markdown):
    1. Greeting yang super keren (misal: "Oi Sigma!", "Aura kamu W!").
    2. Hubungkan potensi murid dengan salah satu elemen visi sekolah: Bener, Pinter, atau Trampil.
    3. Closing statement yang bikin mereka bangga daftar di Mutulingga.
    
    Pastikan nada bicaranya asik tapi tetap sopan sebagai representasi madrasah modern di Purbalingga.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });
    
    return response.text || "Profil kamu legit banget! Mutulingga siap bikin kamu makin sigma. Let's gass!";
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Maaf ya, AI Counselor lagi lowbat. Tapi tenang, profil kamu tetap certified keren!";
  }
};

export const verifyNISN = async (nisn: string, nama: string): Promise<{ valid: boolean; message: string }> => {
  const apiKey = getApiKey();
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return { valid: nisn.length === 10, message: "Mode Offline: Format 10 digit (Valid)." };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Verifikasi validitas format NISN (Nomor Induk Siswa Nasional) Indonesia.
    Aturan dasar:
    1. Harus tepat 10 digit angka.
    
    Data Input:
    - NISN: ${nisn}
    - Nama: ${nama}
    
    Tugas:
    Nyatakan apakah valid secara format. Berikan pesan sukses yang asik jika valid, atau pesan error jika tidak 10 digit.
    
    Kembalikan dalam JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            message: { type: Type.STRING }
          },
          required: ["valid", "message"]
        }
      }
    });

    const result = JSON.parse(response.text || '{"valid": false, "message": "Gagal verifikasi"}');
    return result;
  } catch (error) {
    return { valid: nisn.length === 10, message: nisn.length === 10 ? "Format NISN valid!" : "NISN harus 10 digit." };
  }
};
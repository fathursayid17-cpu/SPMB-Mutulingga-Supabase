
# SPMB MTs Muhammadiyah 01 Purbalingga (Vercel + Supabase Edition)

Sistem Penerimaan Murid Baru (SPMB) Modern dengan integrasi EMIS, Export Excel, dan Analisis Profil Siswa berbasis AI (Gemini).

## Fitur Utama
*   **Database Terpusat**: Menggunakan Supabase (PostgreSQL) untuk penyimpanan data real-time.
*   **AI Profile Analysis**: Menggunakan Google Gemini untuk menganalisis minat bakat siswa saat mendaftar.
*   **Export EMIS**: Export data ke Excel sesuai format EMIS Kemenag.
*   **Responsive UI**: Desain modern "Glassmorphism" yang responsif.
*   **Camera Capture**: Ambil foto siswa langsung dari webcam/kamera HP.

## Cara Instalasi

1.  **Clone Repository**
    ```bash
    git clone <repository-url>
    cd spmb-mutulingga
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Setup Database (Supabase)**
    *   Buat project baru di [Supabase](https://supabase.com).
    *   Masuk ke **SQL Editor**.
    *   Copy isi file `supabase_schema.sql` dan jalankan (Run).
    *   Ini akan membuat tabel `registrants` dan mengatur policy akses.

4.  **Konfigurasi Environment**
    *   Buat file `.env` di root project.
    *   Isi dengan kredensial Supabase dan API Key Gemini:
        ```env
        VITE_SUPABASE_URL=https://xyz.supabase.co
        VITE_SUPABASE_ANON_KEY=eyJxhbGci...
        API_KEY=AIzaSy...
        ```

5.  **Jalankan Aplikasi**
    ```bash
    npm run dev
    ```

## Deployment ke Vercel

1.  Push kode ke GitHub/GitLab.
2.  Import project di Vercel.
3.  Di halaman konfigurasi Vercel, masukkan **Environment Variables**:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `API_KEY` (Untuk Gemini)
4.  Deploy!

## Login Admin
*   **User**: Mutulingga
*   **Password**: Jaya1

import { supabase } from '../lib/supabaseClient';

export const storageService = {
  async uploadPhoto(file: File, folder: string = 'students'): Promise<string> {
    try {
      // Validasi ukuran (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Ukuran file maksimal 2MB");
      }

      // Validasi tipe file
      if (!file.type.startsWith('image/')) {
        throw new Error("File harus berupa gambar");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload ke bucket 'photos'
      // Pastikan bucket 'photos' sudah dibuat di Supabase Dashboard dengan policy 'public'
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        if (error.message.includes('Bucket not found')) {
           throw new Error("Bucket 'photos' tidak ditemukan di Supabase. Silakan buat bucket 'photos' dan set public.");
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw error;
    }
  }
};
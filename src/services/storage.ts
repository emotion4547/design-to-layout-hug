import { supabase } from '@/integrations/supabase/client';

export async function uploadImage(
  file: File, 
  bucket: string = 'images',
  folder: string = 'products'
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Error uploading image:', error);
    throw error;
  }

  // Get public URL
  const { data: publicUrl } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}

export async function deleteImage(url: string, bucket: string = 'images'): Promise<void> {
  // Extract path from URL
  const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) return;
  
  const path = urlParts[1];
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

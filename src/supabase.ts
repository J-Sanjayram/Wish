import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: File): Promise<{ url: string; deleteUrl: string; fileId: string }> => {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const fileName = `${fileId}.${file.name.split('.').pop()}`;
  
  const { data, error } = await supabase.storage
    .from('wishes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('wishes')
    .getPublicUrl(fileName);
    
  return {
    url: publicUrl,
    deleteUrl: `${window.location.origin}/delete/${fileId}`,
    fileId
  };
};

export const deleteImage = async (fileId: string): Promise<boolean> => {
  const { data: files } = await supabase.storage
    .from('wishes')
    .list('', { search: fileId });
    
  if (!files || files.length === 0) return false;
  
  const { error } = await supabase.storage
    .from('wishes')
    .remove([files[0].name]);
    
  return !error;
};
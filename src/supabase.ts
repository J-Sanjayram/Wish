import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file: File): Promise<{ url: string; deleteUrl: string; fileId: string }> => {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const fileName = `${fileId}.${file.name.split('.').pop()}`;
  
  const { error } = await supabase.storage
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

export const uploadMarriageImage = async (file: File): Promise<{ url: string; deleteUrl: string; fileId: string }> => {
  const fileId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const fileName = `${fileId}.${file.name.split('.').pop()}`;
  
  const { error } = await supabase.storage
    .from('marriage-invitations')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('marriage-invitations')
    .getPublicUrl(fileName);
    
  return {
    url: publicUrl,
    deleteUrl: `${window.location.origin}/delete-marriage/${fileId}`,
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

export const deleteMarriageImage = async (fileId: string): Promise<boolean> => {
  const { data: files } = await supabase.storage
    .from('marriage-invitations')
    .list('', { search: fileId });
    
  if (!files || files.length === 0) return false;
  
  const { error } = await supabase.storage
    .from('marriage-invitations')
    .remove([files[0].name]);
    
  return !error;
};

export const deleteExpiredMarriageInvitation = async (invitationId: string): Promise<boolean> => {
  try {
    const { error: dbError } = await supabase
      .from('marriage_invitations')
      .delete()
      .eq('id', invitationId);
    
    if (dbError) {
      console.error('Error deleting from database:', dbError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteExpiredMarriageInvitation:', error);
    return false;
  }
};

export const checkAndDeleteExpiredInvitations = async (): Promise<void> => {
  try {
    const today = new Date();
    const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const { data: expiredInvitations, error } = await supabase
      .from('marriage_invitations')
      .select('id, marriage_date')
      .lt('marriage_date', oneDayAgo.toISOString().split('T')[0]);
    
    if (error) {
      console.error('Error fetching expired invitations:', error);
      return;
    }
    
    if (expiredInvitations && expiredInvitations.length > 0) {
      const { error: deleteError } = await supabase
        .from('marriage_invitations')
        .delete()
        .in('id', expiredInvitations.map(inv => inv.id));
      
      if (deleteError) {
        console.error('Error deleting expired invitations:', deleteError);
      } else {
        console.log(`Deleted ${expiredInvitations.length} expired invitations`);
      }
    }
  } catch (error) {
    console.error('Error in checkAndDeleteExpiredInvitations:', error);
  }
};
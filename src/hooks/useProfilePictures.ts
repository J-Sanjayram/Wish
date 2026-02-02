import { useState, useCallback } from 'react';

export interface ProfilePicture {
  id: string;
  type: 'groom' | 'bride' | 'birthday';
  originalUrl?: string;
  croppedUrl?: string;
  processedUrl?: string;
  isProcessed: boolean;
}

export const useProfilePictures = () => {
  const [pictures, setPictures] = useState<ProfilePicture[]>([]);

  const addPicture = useCallback((type: 'groom' | 'bride' | 'birthday') => {
    const newPicture: ProfilePicture = {
      id: `${type}-${Date.now()}`,
      type,
      isProcessed: false
    };
    setPictures(prev => [...prev, newPicture]);
    return newPicture.id;
  }, []);

  const updatePicture = useCallback((id: string, updates: Partial<ProfilePicture>) => {
    setPictures(prev => prev.map(pic => 
      pic.id === id ? { ...pic, ...updates } : pic
    ));
  }, []);

  const removePicture = useCallback((id: string) => {
    setPictures(prev => prev.filter(pic => pic.id !== id));
  }, []);

  const getPictureByType = useCallback((type: 'groom' | 'bride' | 'birthday') => {
    return pictures.find(pic => pic.type === type);
  }, [pictures]);

  const getProcessedPictures = useCallback(() => {
    return pictures.filter(pic => pic.isProcessed);
  }, [pictures]);

  return {
    pictures,
    addPicture,
    updatePicture,
    removePicture,
    getPictureByType,
    getProcessedPictures
  };
};
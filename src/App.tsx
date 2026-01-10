import React, { useState, useEffect } from 'react';
import { deleteImage, supabase } from './supabase';
import WishForm from './components/WishForm';
import SuccessCard from './components/SuccessCard';
import CelebrationScreen from './components/CelebrationScreen';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import About from './components/About';
import Contact from './components/Contact';
import ImageManager from './components/ImageManager';


// Generate encrypted wish ID
const generateWishId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export interface Wish {
  id: string;
  from: string;
  to: string;
  message: string;
  imageUrl?: string;
  journeyImages?: string[];
  masterId?: string;
  song?: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  };
  date: string;
  timestamp: number;
}

// Auto-delete wishes older than 24 hours
const cleanupOldWishes = async () => {
  try {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    // Get old wishes
    const { data: oldWishes } = await supabase
      .from('wishes')
      .select('id, imageUrl, journeyImages')
      .lt('timestamp', twentyFourHoursAgo);
      
    if (oldWishes && oldWishes.length > 0) {
      // Delete images from storage
      for (const wish of oldWishes) {
        const filesToDelete = [];
        if (wish.imageUrl) {
          const fileName = wish.imageUrl.split('/').pop();
          if (fileName) filesToDelete.push(fileName);
        }
        if (wish.journeyImages) {
          wish.journeyImages.forEach((url: string) => {
            const fileName = url.split('/').pop();
            if (fileName) filesToDelete.push(fileName);
          });
        }
        
        if (filesToDelete.length > 0) {
          await supabase.storage.from('wishes').remove(filesToDelete);
        }
      }
      
      // Delete wishes from database
      await supabase
        .from('wishes')
        .delete()
        .lt('timestamp', twentyFourHoursAgo);
        
      console.log(`Cleaned up ${oldWishes.length} old wishes`);
    }
  } catch (error) {
    console.error('Cleanup failed:', error);
  }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'celebration' | 'loading'>('loading');
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [shareUrl, setShareUrl] = useState('');
  const [celebrationWish, setCelebrationWish] = useState<Wish | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWish, setCurrentWish] = useState<Wish | null>(null);

  useEffect(() => {
    // Run cleanup on app start
    cleanupOldWishes();
    
    const urlParams = new URLSearchParams(window.location.search);
    const wishId = urlParams.get('wish');
    const deleteId = window.location.pathname.match(/\/delete\/(.+)$/)?.[1];

    if (deleteId) {
      const handleDelete = async () => {
        try {
          const success = await deleteImage(deleteId);
          alert(success ? 'Image deleted successfully!' : 'Image not found or already deleted.');
        } catch (error) {
          alert('Failed to delete image.');
        }
        window.location.href = '/';
      };
      handleDelete();
      return;
    }

    if (wishId) {
      const fetchWish = async () => {
        try {
          const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .eq('id', wishId)
            .single();
            
          if (error || !data) throw error;
          
          setCelebrationWish(data as Wish);
          setCurrentView('celebration');
        } catch (error) {
          console.error('Error fetching wish:', error);
          setCelebrationWish({
            id: 'default',
            to: 'Friend',
            message: 'Wishing you a wonderful birthday filled with happiness and joy!',
            from: 'Someone Special',
            date: new Date().toLocaleString(),
            timestamp: Date.now(),
            masterId: 'default'
          });
          setCurrentView('celebration');
        }
      };
      
      fetchWish();
    } else {
      setCurrentView('form');
    }
  }, []);

  const compressImage = (file: File, maxWidth: number = 400): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = maxWidth;
        canvas.height = maxWidth;
        ctx.drawImage(img, 0, 0, maxWidth, maxWidth);
        resolve(canvas.toDataURL('image/webp', 0.2));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const compressJourneyImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 600;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp', 0.2));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const uploadImageToSupabase = async (imageBlob: Blob, fileName: string): Promise<{ url: string; fileId: string }> => {
    const file = new File([imageBlob], fileName, { type: imageBlob.type });
    
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
      
    return { url: publicUrl, fileId: fileName.split('.')[0] };
  };

  const handleFormSubmit = async (formData: {
    fromName: string;
    toName: string;
    message: string;
    image: File | null;
    journeyImages: File[];
    song?: {
      title: string;
      artist: string;
      previewUrl: string;
      startTime: number;
      duration: number;
    };
  }) => {
    setIsSubmitting(true);
    const wishId = generateWishId();
    const masterId = generateWishId(); // Master ID for all images
    let imageUrl = '';
    let journeyImageUrls: string[] = [];
    
    try {
      if (formData.image) {
        const compressedImage = await compressImage(formData.image, 400);
        const imageBlob = dataURLtoBlob(compressedImage);
        const result = await uploadImageToSupabase(imageBlob, `${masterId}-main.webp`);
        imageUrl = result.url;
      }
      
      if (formData.journeyImages.length > 0) {
        for (let i = 0; i < formData.journeyImages.length; i++) {
          const compressedImage = await compressJourneyImage(formData.journeyImages[i]);
          const imageBlob = dataURLtoBlob(compressedImage);
          const result = await uploadImageToSupabase(imageBlob, `${masterId}-journey-${i}.webp`);
          journeyImageUrls.push(result.url);
        }
      }
      
      const wish: Wish = {
        id: wishId,
        from: formData.fromName,
        to: formData.toName,
        message: formData.message,
        imageUrl: imageUrl,
        journeyImages: journeyImageUrls,
        masterId: masterId,
        song: formData.song,
        date: new Date().toLocaleString(),
        timestamp: Date.now()
      };
      
      setCurrentWish(wish);
      
      const { error } = await supabase
        .from('wishes')
        .insert([wish]);
        
      if (error) throw error;
      
      const url = window.location.origin + window.location.pathname + '?wish=' + wishId;
      setShareUrl(url);
      setCurrentView('success');
    } catch (error) {
      alert('Error creating wish. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleShareWhatsApp = () => {
    const text = '🎉 You have a special birthday wish! Click to see: ' + shareUrl;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  };

  const handleCreateAnother = () => {
    setCurrentView('form');
    setCurrentPage('home');
    setShareUrl('');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page === 'home') {
      setCurrentView('form');
    }
  };

  if (currentView === 'loading') {
    return (
      <>
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
            <p className="text-xl font-semibold">Loading your birthday wish...</p>
          </div>
        </div>
      </>
    );
  }

  if (currentView === 'celebration' && celebrationWish) {
    return <CelebrationScreen wish={celebrationWish} />;
  }

  // Render different pages based on currentPage
  if (currentPage === 'privacy') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <PrivacyPolicy />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'terms') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <TermsOfService />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'about') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <About />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'manage') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <ImageManager onNavigate={handleNavigate} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'contact') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-28 pb-16">
            <div className="flex justify-center">
              <div className="w-full max-w-5xl">
                <Contact />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="lg:grid lg:grid-cols-5 lg:gap-12 lg:items-start lg:min-h-[calc(100vh-12rem)]">
            {/* Left side - Description */}
            <div className="lg:col-span-2 mb-8 lg:mb-0 lg:sticky lg:top-24">
              <Header />
            </div>
            
            {/* Right side - Form */}
            <div className="lg:col-span-3 w-full max-w-md mx-auto lg:max-w-none">
              {currentView === 'form' && (
                <WishForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
              )}
              
              {currentView === 'success' && currentWish && (
                <SuccessCard
                  shareUrl={shareUrl}
                  masterId={currentWish.masterId}
                  onCopyLink={handleCopyLink}
                  onShareWhatsApp={handleShareWhatsApp}
                  onCreateAnother={handleCreateAnother}
                />
              )}
            </div>
          </div>
        </div>
        <Footer onNavigate={handleNavigate} />
      </div>
    </>
  );
};

export default App;
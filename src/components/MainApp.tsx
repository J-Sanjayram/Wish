import React, { useState, useEffect, Suspense, lazy } from 'react';
import { deleteImage, deleteMarriageImage, supabase } from '../supabase';
import { Heart } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import AdsterraSocialBanner from './AdsterraSocialBanner';

// Lazy loaded components
const WishForm = lazy(() => import('./WishForm'));
const SuccessCard = lazy(() => import('./SuccessCard'));
const CelebrationScreen = lazy(() => import('./CelebrationScreen'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const TermsOfService = lazy(() => import('./TermsOfService'));
const About = lazy(() => import('./About'));
const Contact = lazy(() => import('./Contact'));
const ImageManager = lazy(() => import('./ImageManager'));
const MarriageInvitationFormNew = lazy(() => import('./MarriageInvitationFormNew'));
const RemoveBackground = lazy(() => import('./RemoveBackground'));
const LandingPage = lazy(() => import('./LandingPage'));

// Memoized components
const MemoizedHeader = React.memo(Header);

// Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
  </div>
);

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

// Auto-delete marriage invitations after marriage date
const cleanupExpiredInvitations = async () => {
  try {
    const now = new Date().toISOString();
    
    // Get expired invitations
    const { data: expiredInvitations } = await supabase
      .from('marriage_invitations')
      .select('id, images, image_ids')
      .lt('expires_at', now);
      
    if (expiredInvitations && expiredInvitations.length > 0) {
      // Delete images from storage
      for (const invitation of expiredInvitations) {
        if (invitation.image_ids && invitation.image_ids.length > 0) {
          const filesToDelete = invitation.image_ids.map((id: string) => {
            const files = invitation.images.filter((url: string) => url.includes(id));
            return files.map((url: string) => url.split('/').pop()).filter(Boolean);
          }).flat();
          
          if (filesToDelete.length > 0) {
            await supabase.storage.from('marriage-invitations').remove(filesToDelete);
          }
        }
      }
      
      // Delete invitations from database
      await supabase
        .from('marriage_invitations')
        .delete()
        .lt('expires_at', now);
        
      console.log(`Cleaned up ${expiredInvitations.length} expired invitations`);
    }
  } catch (error) {
    console.error('Marriage invitation cleanup failed:', error);
  }
};

interface MainAppProps {
  defaultPage?: string;
}

const MainApp: React.FC<MainAppProps> = ({ defaultPage }) => {
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'celebration' | 'loading'>('loading');
  const [currentPage, setCurrentPage] = useState<string>(defaultPage || 'home');
  const [shareUrl, setShareUrl] = useState('');
  const [celebrationWish, setCelebrationWish] = useState<Wish | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWish, setCurrentWish] = useState<Wish | null>(null);

  useEffect(() => {
    // Run cleanup on app start
    cleanupOldWishes();
    cleanupExpiredInvitations();
    
    const urlParams = new URLSearchParams(window.location.search);
    const wishId = urlParams.get('wish');

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

  const uploadImageToSupabase = async (file: File, fileName: string): Promise<{ url: string; fileId: string }> => {
    
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
    image: string | null;
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
      // Handle processed profile image (data URL)
      if (formData.image) {
        const response = await fetch(formData.image);
        const blob = await response.blob();
        const file = new File([blob], 'profile.png', { type: 'image/png' });
        const result = await uploadImageToSupabase(file, `${masterId}-main.webp`);
        imageUrl = result.url;
      }
      
      if (formData.journeyImages.length > 0) {
        for (let i = 0; i < formData.journeyImages.length; i++) {
          const result = await uploadImageToSupabase(formData.journeyImages[i], `${masterId}-journey-${i}.webp`);
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
    } else if (page === 'birthday-wishes') {
      setCurrentView('form');
      setCurrentPage('birthday-wishes');
    } else if (page === 'marriage') {
      setCurrentPage('marriage');
    } else if (page === 'remove-bg') {
      setCurrentPage('remove-bg');
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
  if (currentPage === 'home') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <LandingPage onNavigate={handleNavigate} />
      </>
    );
  }

  if (currentPage === 'birthday-wishes') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                {/* <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div> */}
                <h1 className="text-3xl font-bold text-white mb-2">Birthday Wishes</h1>
                <p className="text-white/80">Create personalized birthday celebrations</p>
              </div>
              <Suspense fallback={<div className="text-white text-center">Loading form...</div>}>
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
              </Suspense>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'marriage') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen">
          <div className="container mx-auto px-4 pt-24 pb-8">
            <MarriageInvitationFormNew />
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'remove-bg') {
    return (
      <>
        <Navigation onNavigate={handleNavigate} currentPage={currentPage} />
        <RemoveBackground />
      </>
    );
  }

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
            <div className="lg:col-span-2 mb-8 lg:mb-0 lg:sticky lg:top-24">
              <MemoizedHeader />
            </div>
            <div className="lg:col-span-3 w-full max-w-md mx-auto lg:max-w-none">
              <Suspense fallback={<div className="text-white text-center">Loading form...</div>}>
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
              </Suspense>
            </div>
          </div>
        </div>
        <AdsterraSocialBanner />
        <Footer onNavigate={handleNavigate} />
      </div>
    </>
  );
};

export default MainApp;
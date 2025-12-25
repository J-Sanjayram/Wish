import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import WishForm from './components/WishForm';
import SuccessCard from './components/SuccessCard';
import CelebrationScreen from './components/CelebrationScreen';
import AnimatedBackground from './components/AnimatedBackground';
import Header from './components/Header';

export interface Wish {
  id: string;
  from: string;
  to: string;
  message: string;
  imageUrl?: string;
  journeyImages?: string[];
  date: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'celebration' | 'loading'>('loading');
  const [shareUrl, setShareUrl] = useState('');
  const [celebrationWish, setCelebrationWish] = useState<Wish | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const wishId = urlParams.get('wish');

    if (wishId) {
      const fetchWish = async () => {
        try {
          const docRef = doc(db, 'wishes', wishId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setCelebrationWish(docSnap.data() as Wish);
          } else {
            setCelebrationWish({
              id: 'default',
              to: 'Friend',
              message: 'Wishing you a wonderful birthday filled with happiness and joy!',
              from: 'Someone Special',
              date: new Date().toLocaleString(),
              timestamp: Date.now()
            });
          }
          setCurrentView('celebration');
        } catch (error) {
          console.error('Error fetching wish:', error);
          setCelebrationWish({
            id: 'default',
            to: 'Friend',
            message: 'Wishing you a wonderful birthday filled with happiness and joy!',
            from: 'Someone Special',
            date: new Date().toLocaleString(),
            timestamp: Date.now()
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

  const uploadImageToFirebase = async (imageBlob: Blob, wishId: string): Promise<string> => {
    const storageRef = ref(storage, `wish-images/${wishId}.webp`);
    const snapshot = await uploadBytes(storageRef, imageBlob);
    return await getDownloadURL(snapshot.ref);
  };

  const handleFormSubmit = async (formData: {
    fromName: string;
    toName: string;
    message: string;
    image: File | null;
    journeyImages: File[];
  }) => {
    setIsSubmitting(true);
    const wishId = Date.now().toString();
    let imageUrl = '';
    let journeyImageUrls: string[] = [];
    
    try {
      if (formData.image) {
        const compressedImage = await compressImage(formData.image, 400);
        const imageBlob = dataURLtoBlob(compressedImage);
        imageUrl = await uploadImageToFirebase(imageBlob, wishId);
      }
      
      if (formData.journeyImages.length > 0) {
        for (let i = 0; i < formData.journeyImages.length; i++) {
          const compressedImage = await compressJourneyImage(formData.journeyImages[i]);
          const imageBlob = dataURLtoBlob(compressedImage);
          const storageRef = ref(storage, `journey-images/${wishId}_${i}.webp`);
          const snapshot = await uploadBytes(storageRef, imageBlob);
          const url = await getDownloadURL(snapshot.ref);
          journeyImageUrls.push(url);
        }
      }
      
      const wish: Wish = {
        id: wishId,
        from: formData.fromName,
        to: formData.toName,
        message: formData.message,
        imageUrl: imageUrl,
        journeyImages: journeyImageUrls,
        date: new Date().toLocaleString(),
        timestamp: Date.now()
      };
      
      await setDoc(doc(db, 'wishes', wishId), wish);
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
    setShareUrl('');
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

  return (
    <>
      <AnimatedBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <motion.div 
          className="w-full max-w-sm sm:max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Header />
          
          {currentView === 'form' && (
            <WishForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
          )}
          
          {currentView === 'success' && (
            <SuccessCard
              shareUrl={shareUrl}
              onCopyLink={handleCopyLink}
              onShareWhatsApp={handleShareWhatsApp}
              onCreateAnother={handleCreateAnother}
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default App;
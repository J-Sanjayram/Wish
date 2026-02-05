import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scissors, Check, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';

interface ProfilePictureUploadProps {
  userType: 'groom' | 'bride' | 'birthday';
  onImageProcessed: (processedImage: string) => void;
  className?: string;
}

const getCroppedImg = (imageSrc: string, crop: any): Promise<string> => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      
      ctx?.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      
      resolve(canvas.toDataURL('image/jpeg'));
    };
  });
};

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  userType,
  onImageProcessed,
  className = ''
}) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessingBg, setIsProcessingBg] = useState(false);
  const [bgProgress, setBgProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  
  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.2);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader();
      reader.onload = (e) => {
        console.log('Image uploaded, setting showCropper to true');
        setOriginalImage(e.target?.result as string);
        setShowCropper(true);
        setCroppedImage(null);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a file under 5MB');
    }
  }, []);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropDone = useCallback(async () => {
    if (!originalImage || !croppedAreaPixels) return;
    
    const croppedImg = await getCroppedImg(originalImage, croppedAreaPixels);
    setCroppedImage(croppedImg);
    setShowCropper(false);
    onImageProcessed(croppedImg); // Auto-use the cropped image
  }, [originalImage, croppedAreaPixels, onImageProcessed]);

  const removeBackground = useCallback(async () => {
    if (!croppedImage) return;
    setIsProcessingBg(true);
    setBgProgress(0);
    
    // 60-second countdown timer
    const totalTime = 60000; // 60 seconds
    const interval = 100; // Update every 100ms
    let elapsed = 0;
    
    const progressInterval = setInterval(() => {
      elapsed += interval;
      const progress = Math.min((elapsed / totalTime) * 100, 90);
      setBgProgress(Math.floor(progress));
    }, interval);
    
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      const blob = await removeBackground(croppedImage);
      setBgProgress(100);
      const processedImg = URL.createObjectURL(blob);
      setProcessedImage(processedImg);
      onImageProcessed(processedImg); // Auto-use the processed image
    } catch (error) {
      setBgProgress(100);
      setProcessedImage(croppedImage);
      onImageProcessed(croppedImage); // Auto-use the cropped image if processing fails
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsProcessingBg(false);
        setBgProgress(0);
      }, 500);
    }
  }, [croppedImage, onImageProcessed]);

  const handleConfirm = useCallback(() => {
    const finalImage = processedImage || croppedImage;
    if (finalImage) {
      onImageProcessed(finalImage);
    }
  }, [processedImage, croppedImage, onImageProcessed]);

  const reset = useCallback(() => {
    setOriginalImage(null);
    setCroppedImage(null);
    setProcessedImage(null);
    setShowCropper(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1.2);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'groom': return 'Groom';
      case 'bride': return 'Bride';
      case 'birthday': return 'Birthday Person';
      default: return 'Profile';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">
          {getUserTypeLabel()} Photo
        </h3>
        <p className="text-white/60 text-sm">Upload and crop your photo</p>
      </div>

      {!originalImage ? (
        <motion.div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center cursor-pointer hover:border-white/60 transition-all duration-300 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/15 hover:to-white/10 shadow-xl"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl" />
            <Upload className="w-12 h-12 text-white/70 mx-auto mb-4 relative z-10" />
          </div>
          <p className="text-white/90 mb-2 font-medium">Upload {getUserTypeLabel()} Photo</p>
          <p className="text-white/60 text-sm">JPG, PNG up to 5MB • Best quality for perfect results</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {showCropper && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-br from-white/15 to-white/5 rounded-2xl p-6 backdrop-blur-md border border-white/20 shadow-2xl"
              >
                <h4 className="text-white font-semibold mb-4 text-lg">Crop Your Photo</h4>
                
                <div className="relative h-80 bg-gradient-to-br from-black/30 to-black/10 rounded-xl overflow-hidden mb-6 border border-white/10">
                  <Cropper
                    image={originalImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    cropShape="round"
                    showGrid={false}
                  />
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCropDone}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Crop className="w-4 h-4" />
                    Crop Photo
                  </button>
                  <button
                    onClick={reset}
                    className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {croppedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
            >
              <h4 className="text-white font-medium mb-3">Cropped Photo</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="relative">
                  {/* Multi-layer Glow Effects */}
                  <div className="absolute -inset-3 rounded-full blur-xl bg-gradient-to-r from-purple-500/30 to-pink-500/30" />
                  <div className="absolute -inset-2 rounded-full blur-lg bg-gradient-to-r from-purple-400/40 to-pink-400/40" />
                  
                  {/* Premium Frame */}
                  <div className="relative p-2 rounded-full backdrop-blur-sm bg-gradient-to-br from-white/20 to-white/10 border border-white/30">
                    <div className="p-1 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                      <img
                        src={processedImage || croppedImage}
                        alt="Cropped"
                        className="w-32 h-32 object-cover rounded-full border-2 border-white/50 shadow-2xl"
                      />
                    </div>
                  </div>
                  
                  {processedImage && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full p-2 shadow-lg border-2 border-white/30">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <button
                    onClick={removeBackground}
                    disabled={isProcessingBg}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessingBg ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing... {bgProgress}% ({Math.ceil((60 - (bgProgress * 60 / 100)))}s)
                      </>
                    ) : (
                      <>
                        <Scissors className="w-4 h-4" />
                        Remove Background
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={reset}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
};
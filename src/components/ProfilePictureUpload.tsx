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
    
    const progressInterval = setInterval(() => {
      setBgProgress(prev => prev < 90 ? prev + 10 : 90);
    }, 200);
    
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
          className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-colors bg-white/5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-12 h-12 text-white/60 mx-auto mb-3" />
          <p className="text-white/80 mb-1">Upload {getUserTypeLabel()} Photo</p>
          <p className="text-white/60 text-sm">JPG, PNG up to 5MB</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {showCropper && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/10 rounded-xl p-4 backdrop-blur-sm"
              >
                <h4 className="text-white font-medium mb-3">Crop Your Photo</h4>
                
                <div className="relative h-80 bg-black/20 rounded-lg overflow-hidden mb-4">
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
                
                <div className="flex gap-2">
                  <button
                    onClick={handleCropDone}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Crop className="w-4 h-4" />
                    Crop Photo
                  </button>
                  <button
                    onClick={reset}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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
                  <img
                    src={processedImage || croppedImage}
                    alt="Cropped"
                    className="w-32 h-32 object-cover rounded-full border-2 border-white/20"
                  />
                  {processedImage && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
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
                        Processing {bgProgress}%
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
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react';


const RemoveBackground: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    
    try {
      const { removeBackground } = await import('@imgly/background-removal');
      
      const response = await fetch(originalImage);
      const blob = await response.blob();
      
      const resultBlob = await removeBackground(blob);
      
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Background removal service is currently unavailable. Please try again later.');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'removed-background.png';
    link.href = processedImage;
    link.click();
  };

  const resetImages = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Remove Background
          </h1>
          <p className="text-xl text-white/80">
            Professional AI background removal
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <ImageIcon className="w-6 h-6" />
              Original Image
            </h2>
            
            {!originalImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center cursor-pointer hover:border-white/50 transition-colors"
              >
                <Upload className="w-16 h-16 text-white/60 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">Click to upload image</p>
                <p className="text-white/60 text-sm">Supports JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={originalImage}
                  alt="Original"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
                <button
                  onClick={resetImages}
                  className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {originalImage && !processedImage && (
              <motion.button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Remove Background'
                )}
              </motion.button>
            )}
          </motion.div>

          {/* Result Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Download className="w-6 h-6" />
              Processed Image
            </h2>
            
            {!processedImage ? (
              <div className="border-2 border-dashed border-white/30 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-white/60" />
                </div>
                <p className="text-white/60 text-lg">Processed image will appear here</p>
              </div>
            ) : (
              <div className="relative">
                <div className="bg-white/20 rounded-2xl p-4">
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full h-auto rounded-xl shadow-lg"
                  />
                </div>
                <motion.button
                  onClick={downloadImage}
                  className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-5 h-5" />
                  Download Image
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-white/60 text-sm">
            Powered by IMG.LY background removal
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RemoveBackground;
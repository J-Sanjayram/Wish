import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MusicSelector from './MusicSelector';

interface WishFormProps {
  onSubmit: (formData: {
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
  }) => void;
  isSubmitting: boolean;
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    fromName: '',
    toName: '',
    message: '',
    image: null as File | null,
    journeyImages: [] as File[],
    song: undefined as {
      title: string;
      artist: string;
      previewUrl: string;
      startTime: number;
      duration: number;
    } | undefined
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [journeyPreviews, setJourneyPreviews] = useState<string[]>([]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image under 5MB');
    }
  };

  const handleJourneyImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      alert('Maximum 5 journey images allowed');
      return;
    }
    
    const validFiles = files.filter(file => file.size <= 5 * 1024 * 1024);
    if (validFiles.length !== files.length) {
      alert('Some images were too large (max 5MB each)');
    }
    
    setFormData(prev => ({ ...prev, journeyImages: validFiles }));
    
    const previews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push(e.target?.result as string);
        if (previews.length === validFiles.length) {
          setJourneyPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = () => {
    if (!formData.fromName || !formData.toName || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({
      ...formData,
      song: formData.song || undefined
    });
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Create Your Wish</h2>
        <p className="text-white/80 text-sm">Make someone's birthday magical</p>
      </div>
      
      <div className="space-y-4 sm:space-y-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">From (Your Name)</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-purple-300 text-xs">👤</span>
            </div>
            <input
              type="text"
              placeholder="Enter your name"
              value={formData.fromName}
              onChange={handleInputChange('fromName')}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-purple-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">To (Birthday Person)</label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-pink-500/20 rounded-full flex items-center justify-center">
              <span className="text-pink-300 text-xs">🎂</span>
            </div>
            <input
              type="text"
              placeholder="Birthday person's name"
              value={formData.toName}
              onChange={handleInputChange('toName')}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-pink-400 focus:outline-none transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">Photo (Optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            id="image-upload"
            onChange={handleImageUpload}
          />
          <motion.label
            htmlFor="image-upload"
            className="block border-2 border-dashed border-white/30 rounded-xl p-4 text-center cursor-pointer hover:border-white/50 hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!imagePreview ? (
              <div>
                <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-3">
                  <span className="text-blue-300 text-xl">📷</span>
                </div>
                <p className="text-white font-medium text-sm mb-1">Click to add photo</p>
                <span className="text-white/60 text-xs">JPG, PNG up to 5MB</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img src={imagePreview} className="w-16 h-16 rounded-full mx-auto object-cover shadow-lg mb-2" alt="Preview" />
                <p className="text-white font-medium text-sm">Click to change</p>
              </motion.div>
            )}
          </motion.label>
          
          {/* Privacy Notice */}
          <motion.div 
            className="mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-300 text-sm mt-0.5">🔒</span>
              <div className="text-xs text-blue-200 leading-relaxed">
                <p className="font-medium mb-1">Your Privacy Matters</p>
                <p>• We don't store, use, or collect your uploaded images</p>
                <p>• You can delete your images anytime using the sharing link</p>
                <p>• All wishes are automatically deleted after 24 hours</p>
                <p className="mt-1 text-blue-300 font-medium">Feel free to upload - your privacy is protected!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">Journey Images (Optional)</label>
          <p className="text-white/70 text-xs mb-2">Recommended: Landscape images (16:9 ratio) up to 5 images</p>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            id="journey-upload"
            onChange={handleJourneyImagesUpload}
          />
          <motion.label
            htmlFor="journey-upload"
            className="block border-2 border-dashed border-green-300 rounded-lg sm:rounded-2xl p-3 sm:p-6 text-center cursor-pointer hover:border-green-500 transition-all duration-300 bg-green-50/30 hover:bg-green-50/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {journeyPreviews.length === 0 ? (
              <div>
                <motion.i 
                  className="fas fa-images text-2xl sm:text-3xl text-green-500 mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-white font-medium text-sm mb-1">Add Journey Images</p>
                <span className="text-white/60 text-xs">JPG, PNG up to 5MB each (Max 5 images)</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-wrap gap-2 justify-center"
              >
                {journeyPreviews.map((preview, index) => (
                  <img key={index} src={preview} className="w-16 h-12 sm:w-20 sm:h-14 rounded object-cover shadow-lg" alt={`Journey ${index + 1}`} />
                ))}
                <p className="text-white font-medium mt-2 text-sm w-full">Click to change ({journeyPreviews.length}/5)</p>
              </motion.div>
            )}
          </motion.label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">Background Music (Optional)</label>
          <MusicSelector
            onSongSelect={(song) => setFormData(prev => ({ ...prev, song }))}
            selectedSong={formData.song}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">Birthday Message</label>
          <div className="relative group">
            <div className="absolute left-3 top-3 w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center">
              <span className="text-red-300 text-xs">💝</span>
            </div>
            <textarea
              placeholder="Write your heartfelt birthday message..."
              value={formData.message}
              onChange={handleInputChange('message')}
              className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:bg-white/20 focus:border-red-400 focus:outline-none transition-all duration-300 h-24 resize-none backdrop-blur-sm"
            />
          </div>
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`w-full ${isSubmitting ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-purple-500/25'} text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Magic...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">✨</span>
              Create & Share Wish
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WishForm;
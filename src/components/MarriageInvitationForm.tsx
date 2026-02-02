import React, { useState, useCallback } from 'react';
import { supabase, uploadMarriageImage } from '../supabase';
import { Heart, Calendar, MapPin, Music, Upload, X, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import MusicSelector from './MusicSelector';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface MarriageFormData {
  maleName: string;
  femaleName: string;
  date: string;
  place: string;
  song?: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  };
  additionalInfo: string;
  maleImage: string | null;
  femaleImage: string | null;
  loveImages: File[];
  primaryColor: string;
}

const MarriageInvitationForm: React.FC = () => {
  const [formData, setFormData] = useState<MarriageFormData>({
    maleName: '',
    femaleName: '',
    date: '',
    place: '',
    song: undefined,
    additionalInfo: '',
    maleImage: null,
    femaleImage: null,
    loveImages: [],
    primaryColor: '#10b981'
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Calculate form completion percentage
  React.useEffect(() => {
    const fields = [
      formData.maleName,
      formData.femaleName, 
      formData.date,
      formData.place,
      formData.maleImage,
      formData.femaleImage
    ];
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    setFormProgress(percentage);
  }, [formData]);
  const [formProgress, setFormProgress] = useState(0);

  // Calculate form completion percentage
  React.useEffect(() => {
    const fields = [
      formData.maleName,
      formData.femaleName, 
      formData.date,
      formData.place,
      formData.maleImage,
      formData.femaleImage
    ];
    const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    setFormProgress(percentage);
  }, [formData]);
  const [invitationUrl, setInvitationUrl] = useState('');
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);

  const handleLoveImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') && formData.loveImages.length + files.length <= 4
    );
    setFormData(prev => ({ ...prev, loveImages: [...prev.loveImages, ...validFiles] }));
  }, [formData.loveImages.length]);

  const removeLoveImage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      loveImages: prev.loveImages.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if music selector is open
    if (isMusicSelectorOpen) {
      return;
    }
    
    setLoading(true);
    setUploadProgress(0);
    
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => prev < 90 ? prev + 10 : 90);
    }, 300);

    try {
      const imageUrls = [];
      const imageIds = [];
      
      // Convert processed images to blobs and upload
      if (formData.maleImage) {
        const response = await fetch(formData.maleImage);
        const blob = await response.blob();
        const file = new File([blob], 'groom-profile.png', { type: 'image/png' });
        const result = await uploadMarriageImage(file);
        imageUrls.push(result.url);
        imageIds.push(result.fileId);
      }
      
      if (formData.femaleImage) {
        const response = await fetch(formData.femaleImage);
        const blob = await response.blob();
        const file = new File([blob], 'bride-profile.png', { type: 'image/png' });
        const result = await uploadMarriageImage(file);
        imageUrls.push(result.url);
        imageIds.push(result.fileId);
      }
      
      // Upload love images
      for (const file of formData.loveImages) {
        const result = await uploadMarriageImage(file);
        imageUrls.push(result.url);
        imageIds.push(result.fileId);
      }

      const invitationId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      
      const { error } = await supabase
        .from('marriage_invitations')
        .insert({
          id: invitationId,
          male_name: formData.maleName,
          female_name: formData.femaleName,
          marriage_date: formData.date,
          place: formData.place,
          song: formData.song ? JSON.stringify(formData.song) : null,
          additional_info: formData.additionalInfo,
          images: imageUrls,
          image_ids: imageIds,
          male_image: formData.maleImage ? imageUrls[0] : null,
          female_image: formData.femaleImage ? imageUrls[formData.maleImage ? 1 : 0] : null,
          love_images: imageUrls.slice((formData.maleImage ? 1 : 0) + (formData.femaleImage ? 1 : 0)),
          primary_color: formData.primaryColor,
          created_at: new Date().toISOString(),
          expires_at: new Date(new Date(formData.date).getTime() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      setUploadProgress(100);
      const url = `${window.location.origin}/marriage-invitation/${invitationId}`;
      setInvitationUrl(url);
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  if (invitationUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invitation Created! 💕</h2>
          <p className="text-gray-600 mb-6">Your beautiful marriage invitation is ready to share</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Share this link:</p>
            <p className="text-sm font-mono bg-white p-2 rounded border break-all">{invitationUrl}</p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(invitationUrl)}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Copy Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-purple-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-white/20 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span className="text-gray-700 font-semibold">Marriage Invitation</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Dream Invitation</h1>
          <p className="text-gray-600">Design a beautiful invitation that captures your love story</p>
        </motion.div>

        <motion.form 
          onSubmit={handleSubmit} 
          className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <label className="block text-gray-700 font-semibold mb-2">Groom's Name</label>
              <input
                type="text"
                required
                value={formData.maleName}
                onChange={(e) => setFormData(prev => ({ ...prev, maleName: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter groom's name"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <label className="block text-gray-700 font-semibold mb-2">Bride's Name</label>
              <input
                type="text"
                required
                value={formData.femaleName}
                onChange={(e) => setFormData(prev => ({ ...prev, femaleName: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Enter bride's name"
              />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                Wedding Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" />
                Venue
              </label>
              <input
                type="text"
                required
                value={formData.place}
                onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                placeholder="Wedding venue"
              />
            </motion.div>
          </div>

          <motion.div className="mb-6" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <Music className="w-4 h-4 text-rose-500" />
              Wedding Song (Optional)
            </label>
            
            {/* Song Selection Status */}
            {formData.song ? (
              <div className="mb-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{formData.song.title}</p>
                      <p className="text-sm text-green-600">{formData.song.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, song: undefined }))}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-sm">No song selected. Click below to add a wedding song.</p>
              </div>
            )}
            
            <MusicSelector
              onSongSelect={(song) => setFormData(prev => ({ ...prev, song }))}
              selectedSong={formData.song}
              onModalStateChange={setIsMusicSelectorOpen}
            />
          </motion.div>

          <motion.div className="mb-6" whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }}>
            <label className="block text-gray-700 font-semibold mb-2">Additional Information</label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 h-24 resize-none bg-white/50 backdrop-blur-sm"
              placeholder="Special message, dress code, or other details..."
            />
          </motion.div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Theme Color</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                className="w-16 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
              />
              <div className="flex-1">
                <p className="text-gray-600 text-sm mb-2">Choose your wedding theme color</p>
                <div className="flex gap-2">
                  {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, primaryColor: color }))}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        formData.primaryColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Profile Photos (1:1 Cropped)
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <ProfilePictureUpload
                userType="groom"
                onImageProcessed={(processedImage) => 
                  setFormData(prev => ({ ...prev, maleImage: processedImage }))
                }
              />
              
              <ProfilePictureUpload
                userType="bride"
                onImageProcessed={(processedImage) => 
                  setFormData(prev => ({ ...prev, femaleImage: processedImage }))
                }
              />
            </div>
            
            <label className="block text-gray-600 font-medium mb-4">Love Photos (Up to 4)</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.loveImages.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Love ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border-2 border-red-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeLoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {formData.loveImages.length < 4 && (
                <label className="w-full h-24 border-2 border-dashed border-red-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-red-500 transition-colors duration-300">
                  <Heart className="w-6 h-6 text-red-400" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleLoveImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading || isMusicSelectorOpen}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group ${
              loading || isMusicSelectorOpen 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-xl'
            }`}
            whileHover={!loading && !isMusicSelectorOpen ? { scale: 1.02 } : {}}
            whileTap={!loading && !isMusicSelectorOpen ? { scale: 0.98 } : {}}
          >
            {!loading && !isMusicSelectorOpen && (
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12" />
            )}
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Invitation... {uploadProgress}%
              </>
            ) : isMusicSelectorOpen ? (
              <>
                <Music className="w-5 h-5" />
                Complete Song Selection First
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Create Invitation
              </>
            )}
            
            {loading && (
              <div className="absolute bottom-0 left-0 w-full bg-white/30 h-1 rounded-full overflow-hidden">
                <motion.div 
                  className="bg-white h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.button>
        </motion.form>
        
        {/* Form Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm font-bold text-gray-900">{formProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
        
        {/* Form Progress Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Form Progress</span>
              <span className="text-sm font-bold text-gray-900">{formProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarriageInvitationForm;

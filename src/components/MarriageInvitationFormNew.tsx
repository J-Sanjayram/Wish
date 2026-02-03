import React, { useState, useCallback, useMemo } from 'react';
import { supabase, uploadMarriageImage } from '../supabase';
import { Heart, Calendar, MapPin, Music, Upload, X, Sparkles, User, Users, MessageCircle, Palette, Camera, Plus, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [invitationUrl, setInvitationUrl] = useState('');
  const [isMusicSelectorOpen, setIsMusicSelectorOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState({
    photos: false,
    theme: false
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isFormValid = useMemo(() => {
    return formData.maleName.trim() && formData.femaleName.trim() && formData.date && formData.place.trim();
  }, [formData.maleName, formData.femaleName, formData.date, formData.place]);

  const isStepComplete = useMemo(() => {
    switch (currentStep) {
      case 1: return formData.maleName && formData.femaleName && formData.date && formData.place;
      case 2: return true; // Music is optional
      case 3: return true; // Theme is optional
      case 4: return true; // Photos are optional
      default: return false;
    }
  }, [formData, currentStep]);

  const progressPercentage = useMemo(() => {
    let completed = 0;
    if (formData.maleName && formData.femaleName && formData.date && formData.place) completed += 25;
    if (formData.song) completed += 25;
    if (formData.primaryColor !== '#10b981') completed += 25;
    if (formData.maleImage || formData.femaleImage || formData.loveImages.length > 0) completed += 25;
    return completed;
  }, [formData]);

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
    e.stopPropagation();
    
    console.log('Submit triggered, loading:', loading, 'musicSelector:', isMusicSelectorOpen);
    
    if (loading) {
      console.log('Form submission blocked: Already loading');
      return;
    }
    
    if (isMusicSelectorOpen) {
      console.log('Form submission blocked: Music selector is open');
      return;
    }
    
    // Validate and set errors
    const newErrors: Record<string, string> = {};
    if (!formData.maleName.trim()) newErrors.maleName = 'Groom name is required';
    if (!formData.femaleName.trim()) newErrors.femaleName = 'Bride name is required';
    if (!formData.date) newErrors.date = 'Wedding date is required';
    if (!formData.place.trim()) newErrors.place = 'Venue is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    console.log('Proceeding with form submission');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 max-w-md w-full text-center"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Success! 🎉</h2>
          <p className="text-gray-600 mb-6">Your wedding invitation is ready to share</p>
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-2">Invitation Link:</p>
            <p className="text-sm font-mono bg-white p-3 rounded-xl border break-all select-all">{invitationUrl}</p>
          </div>
          <motion.button
            onClick={() => navigator.clipboard.writeText(invitationUrl)}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Copy & Share
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div> */}
          <h1 className="text-3xl font-bold text-white mb-2">Create Wedding Invitation</h1>
          <p className="text-white/80">Design your perfect love story</p>
        </motion.div>

        {/* Progress Bar */}
        {/* <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm font-medium">Progress</span>
              <span className="text-white text-sm font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div> */}

        <div className="space-y-6">
          {/* Essential Details */}
          <motion.div 
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Essential Details</h2>
                  <p className="text-sm text-white/80">Basic information about your wedding</p>
                </div>
              </div>
              {isStepComplete && (
                <motion.div 
                  className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                </motion.div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-white font-semibold">
                    Groom's Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-blue-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.maleName}
                      onChange={(e) => setFormData(prev => ({ ...prev, maleName: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 ${
                        errors.maleName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : formData.maleName 
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none`}
                      placeholder="Enter groom's name"
                    />
                    {formData.maleName && !errors.maleName && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.maleName && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.maleName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  <label className="block text-white font-semibold">
                    Bride's Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-pink-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.femaleName}
                      onChange={(e) => setFormData(prev => ({ ...prev, femaleName: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 ${
                        errors.femaleName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : formData.femaleName 
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                            : 'border-gray-200 focus:border-pink-500 focus:ring-pink-100'
                      } focus:ring-4 focus:outline-none`}
                      placeholder="Enter bride's name"
                    />
                    {formData.femaleName && !errors.femaleName && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.femaleName && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.femaleName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Date & Venue */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-white font-semibold">
                    Wedding Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white text-gray-800 ${
                        errors.date 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : formData.date 
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                            : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                      } focus:ring-4 focus:outline-none`}
                    />
                    {formData.date && !errors.date && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.date && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.date}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="space-y-3">
                  <label className="block text-white font-semibold">
                    Venue *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <MapPin className="w-5 h-5 text-emerald-400" />
                    </div>
                    <input
                      type="text"
                      value={formData.place}
                      onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 transition-all duration-300 bg-white text-gray-800 placeholder-gray-400 ${
                        errors.place 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : formData.place 
                            ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-100'
                            : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                      } focus:ring-4 focus:outline-none`}
                      placeholder="Wedding venue location"
                    />
                    {formData.place && !errors.place && (
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <Check className="w-5 h-5 text-emerald-500" />
                      </div>
                    )}
                  </div>
                  <AnimatePresence>
                    {errors.place && (
                      <motion.p 
                        className="text-red-500 text-sm flex items-center gap-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.place}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <label className="block text-white font-semibold">
                  Additional Information
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <MessageCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <textarea
                    value={formData.additionalInfo}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all duration-300 h-24 resize-none bg-white text-gray-800 placeholder-gray-400"
                    placeholder="Special message, dress code, RSVP details..."
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Music Section */}
          <motion.div 
            className={`bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 ${isMusicSelectorOpen ? 'relative z-50' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Music className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Wedding Song</h2>
                  <p className="text-sm text-white/80">Add a special soundtrack to your invitation</p>
                </div>
              </div>
              {formData.song && (
                <motion.div 
                  className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15 }}
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                </motion.div>
              )}
            </div>
            
            {formData.song ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-800 text-lg truncate">{formData.song.title}</p>
                      <p className="text-emerald-600 truncate">{formData.song.artist}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, song: undefined }))}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors p-2 hover:bg-emerald-100 rounded-full flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-200 rounded-2xl text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Music className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No song selected</p>
                <p className="text-gray-400 text-sm">Choose a song to make your invitation more special</p>
              </div>
            )}

            <div onClick={(e) => e.stopPropagation()}>
              <MusicSelector
                onSongSelect={(song) => setFormData(prev => ({ ...prev, song }))}
                selectedSong={formData.song}
                onModalStateChange={setIsMusicSelectorOpen}
              />
            </div>
          </motion.div>

          {/* Theme & Photos - Collapsible Sections */}
          <div className="space-y-4">
            {/* Theme Section */}
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, theme: !prev.theme }))}
                className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-white">Theme Color</h2>
                    <p className="text-sm text-white/80">Customize your invitation's appearance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {formData.primaryColor !== '#10b981' && (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.theme ? 'rotate-180' : ''}`} />
                </div>
              </button>
            
              <AnimatePresence>
                {expandedSections.theme && (
                  <motion.div 
                    className="px-6 pb-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg cursor-pointer"
                      />
                      <div>
                        <p className="text-white font-semibold">Custom Color</p>
                        <p className="text-white/80 font-mono text-sm">{formData.primaryColor}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-6 gap-3">
                      {['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7'].map(color => (
                        <motion.button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, primaryColor: color }))}
                          className={`w-12 h-12 rounded-xl border-3 transition-all duration-200 shadow-md ${
                            formData.primaryColor === color ? 'border-gray-800 scale-110' : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Photos Section */}
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <button
                type="button"
                onClick={() => setExpandedSections(prev => ({ ...prev, photos: !prev.photos }))}
                className="w-full flex items-center justify-between p-6 hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-white">Photos</h2>
                    <p className="text-sm text-white/80">Add personal photos to your invitation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(formData.maleImage || formData.femaleImage || formData.loveImages.length > 0) && (
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                  )}
                  <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.photos ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {expandedSections.photos && (
                  <motion.div 
                    className="px-6 pb-6 space-y-6"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                {/* Individual Photos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <ProfilePictureUpload
                      userType="groom"
                      onImageProcessed={(processedImage) => 
                        setFormData(prev => ({ ...prev, maleImage: processedImage }))
                      }
                      className="w-full"
                    />
                    {formData.maleImage && (
                      <div className="flex justify-center">
                        <img
                          src={formData.maleImage}
                          alt="Groom Preview"
                          className="w-20 h-20 object-cover rounded-full border-4 border-blue-200 shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <ProfilePictureUpload
                      userType="bride"
                      onImageProcessed={(processedImage) => 
                        setFormData(prev => ({ ...prev, femaleImage: processedImage }))
                      }
                      className="w-full"
                    />
                    {formData.femaleImage && (
                      <div className="flex justify-center">
                        <img
                          src={formData.femaleImage}
                          alt="Bride Preview"
                          className="w-20 h-20 object-cover rounded-full border-4 border-pink-200 shadow-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Love Photos */}
                <div>
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-3 sm:mb-4">Love Story Photos (Up to 4)</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {formData.loveImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Love ${index + 1}`}
                          className="w-full h-20 sm:h-24 lg:h-32 object-cover rounded-xl sm:rounded-2xl border-4 border-rose-200 shadow-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeLoveImage(index)}
                          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <X className="w-2 h-2 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {formData.loveImages.length < 4 && (
                      <label className="w-full h-20 sm:h-24 lg:h-32 border-4 border-dashed border-rose-300 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-500 transition-colors duration-300 ">
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-rose-400 mb-1" />
                        <span className="text-rose-600 text-xs sm:text-sm font-medium">Add</span>
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
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          

          {/* Submit Button */}
          <motion.div 
            className="sticky bottom-0 bg-gradient-to-t from-purple-900 to-transparent pt-8 -mx-4 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.button
              type="submit"
              disabled={loading || isMusicSelectorOpen || !isFormValid}
              onClick={(e) => {
                if (loading || isMusicSelectorOpen) {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Submission blocked: form is loading or music selector is open.');
                  return;
                }
                else {
                  handleSubmit(e);
                }
              }}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                loading || isMusicSelectorOpen || !isFormValid
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white hover:shadow-rose-500/25'
              }`}
              whileHover={!loading && !isMusicSelectorOpen && isFormValid ? { scale: 1.02, y: -2 } : {}}
              whileTap={!loading && !isMusicSelectorOpen && isFormValid ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <div className="flex flex-col items-center gap-1">
                    <span>Creating Your Invitation...</span>
                    <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-white transition-all duration-300"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-xs">{uploadProgress}%</span>
                  </div>
                </>
              ) : isMusicSelectorOpen ? (
                <>
                  <Music className="w-5 h-5" />
                  Complete Song Selection
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Create Wedding Invitation
                </>
              )}
            </motion.button>
          </motion.div>
        </div>

        
      </div>
    </div>
  );
};

export default MarriageInvitationForm;
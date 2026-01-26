import React, { useState, useCallback } from 'react';
import { supabase, uploadMarriageImage } from '../supabase';
import { Heart, Calendar, MapPin, Music, Upload, X, Sparkles } from 'lucide-react';

interface MarriageFormData {
  maleName: string;
  femaleName: string;
  date: string;
  place: string;
  song: string;
  additionalInfo: string;
  maleImage: File | null;
  femaleImage: File | null;
  loveImages: File[];
}

const MarriageInvitationForm: React.FC = () => {
  const [formData, setFormData] = useState<MarriageFormData>({
    maleName: '',
    femaleName: '',
    date: '',
    place: '',
    song: '',
    additionalInfo: '',
    maleImage: null,
    femaleImage: null,
    loveImages: []
  });
  const [loading, setLoading] = useState(false);
  const [invitationUrl, setInvitationUrl] = useState('');

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
    setLoading(true);

    try {
      const imageUrls = [];
      const imageIds = [];
      
      // Upload male image
      if (formData.maleImage) {
        const result = await uploadMarriageImage(formData.maleImage);
        imageUrls.push(result.url);
        imageIds.push(result.fileId);
      }
      
      // Upload female image
      if (formData.femaleImage) {
        const result = await uploadMarriageImage(formData.femaleImage);
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
          song: formData.song,
          additional_info: formData.additionalInfo,
          images: imageUrls,
          image_ids: imageIds,
          male_image: formData.maleImage ? imageUrls[0] : null,
          female_image: formData.femaleImage ? imageUrls[formData.maleImage ? 1 : 0] : null,
          love_images: imageUrls.slice((formData.maleImage ? 1 : 0) + (formData.femaleImage ? 1 : 0)),
          created_at: new Date().toISOString(),
          expires_at: new Date(new Date(formData.date).getTime() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      const url = `${window.location.origin}/marriage-invitation/${invitationId}`;
      setInvitationUrl(url);
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      setLoading(false);
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-xl rounded-full px-6 py-3 shadow-lg border border-white/20 mb-4">
            <Sparkles className="w-5 h-5 text-rose-500" />
            <span className="text-gray-700 font-semibold">Marriage Invitation</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Dream Invitation</h1>
          <p className="text-gray-600">Design a beautiful invitation that captures your love story</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Groom's Name</label>
              <input
                type="text"
                required
                value={formData.maleName}
                onChange={(e) => setFormData(prev => ({ ...prev, maleName: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                placeholder="Enter groom's name"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Bride's Name</label>
              <input
                type="text"
                required
                value={formData.femaleName}
                onChange={(e) => setFormData(prev => ({ ...prev, femaleName: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                placeholder="Enter bride's name"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Wedding Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Venue
              </label>
              <input
                type="text"
                required
                value={formData.place}
                onChange={(e) => setFormData(prev => ({ ...prev, place: e.target.value }))}
                className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
                placeholder="Wedding venue"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Wedding Song
            </label>
            <input
              type="text"
              value={formData.song}
              onChange={(e) => setFormData(prev => ({ ...prev, song: e.target.value }))}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300"
              placeholder="Your special song (optional)"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Additional Information</label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalInfo: e.target.value }))}
              className="w-full p-4 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all duration-300 h-24 resize-none"
              placeholder="Special message, dress code, or other details..."
            />
          </div>

          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Individual Photos
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Groom Photo */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Groom's Photo</label>
                {formData.maleImage ? (
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(formData.maleImage)}
                      alt="Groom"
                      className="w-full h-32 object-cover rounded-xl border-2 border-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, maleImage: null }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-blue-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors duration-300">
                    <Upload className="w-6 h-6 text-blue-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData(prev => ({ ...prev, maleImage: file }));
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Bride Photo */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Bride's Photo</label>
                {formData.femaleImage ? (
                  <div className="relative group">
                    <img
                      src={URL.createObjectURL(formData.femaleImage)}
                      alt="Bride"
                      className="w-full h-32 object-cover rounded-xl border-2 border-pink-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, femaleImage: null }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-pink-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors duration-300">
                    <Upload className="w-6 h-6 text-pink-400" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormData(prev => ({ ...prev, femaleImage: file }));
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Invitation...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Create Invitation
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MarriageInvitationForm;
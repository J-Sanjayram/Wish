import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { Heart, Calendar, MapPin, Music, Sparkles, Star } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface MarriageInvitation {
  id: string;
  male_name: string;
  female_name: string;
  marriage_date: string;
  place: string;
  song: string;
  additional_info: string;
  images: string[];
}

const MarriageInvitationDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<MarriageInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('marriage_invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setInvitation(data);
      setLoading(false);
      
      // Trigger entrance animation
      setTimeout(() => setShowContent(true), 500);
    };

    fetchInvitation();
  }, [id]);

  useEffect(() => {
    if (invitation?.images && invitation.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % invitation.images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [invitation?.images]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-600 font-semibold">Loading your invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-100 to-purple-200 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation Not Found</h2>
          <p className="text-gray-600">This invitation may have expired or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-100 to-purple-200 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            {i % 3 === 0 ? (
              <Heart className="w-4 h-4 text-rose-300/40" />
            ) : i % 3 === 1 ? (
              <Star className="w-3 h-3 text-pink-300/40" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-300/40" />
            )}
          </div>
        ))}
      </div>

      <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-4xl w-full">
          {/* Main Invitation Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
            {/* Header with Images */}
            <div className="relative h-80 overflow-hidden">
              {invitation.images.length > 0 ? (
                <div className="relative w-full h-full">
                  {invitation.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Couple ${index + 1}`}
                      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Image Indicators */}
                  {invitation.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {invitation.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                  <Heart className="w-24 h-24 text-white/80" />
                </div>
              )}
              
              {/* Floating Hearts Animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <Heart
                    key={i}
                    className="absolute w-6 h-6 text-white/60 animate-bounce"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${20 + (i % 2) * 40}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              {/* Names */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{invitation.male_name}</h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 mx-auto"></div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{invitation.female_name}</h2>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 mx-auto"></div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full px-6 py-3">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <span className="text-gray-700 font-semibold text-lg">are getting married!</span>
                  <Sparkles className="w-5 h-5 text-rose-500" />
                </div>
              </div>

              {/* Wedding Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Wedding Date</h3>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold">{formatDate(invitation.marriage_date)}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Venue</h3>
                  </div>
                  <p className="text-gray-700 text-lg font-semibold">{invitation.place}</p>
                </div>
              </div>

              {/* Additional Info */}
              {invitation.additional_info && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100 mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Special Message
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{invitation.additional_info}</p>
                </div>
              )}

              {/* Music Player */}
              {invitation.song && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Our Song</h3>
                  </div>
                  <AudioPlayer 
                    song={invitation.song}
                    artist="Wedding Music"
                    albumArt={invitation.images[0] || ''}
                  />
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-gray-600 mb-4">Join us as we celebrate our love and begin our journey together</p>
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                  <span className="text-gray-500 font-medium">With love and joy</span>
                  <Heart className="w-5 h-5 text-rose-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MarriageInvitationDisplay;
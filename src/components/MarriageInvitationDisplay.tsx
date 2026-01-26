import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
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
          <div className="text-6xl mb-4">💕</div>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float text-sm sm:text-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            {i % 4 === 0 ? (
              <span className="text-orange-300/40">🪔</span>
            ) : i % 4 === 1 ? (
              <span className="text-red-300/40">🌺</span>
            ) : i % 4 === 2 ? (
              <span className="text-yellow-300/40">🕉️</span>
            ) : (
              <span className="text-pink-300/40">🌸</span>
            )}
          </div>
        ))}
      </div>

      <div className={`relative z-10 min-h-screen flex items-center justify-center p-4 transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl w-full">
          {/* Main Invitation Card */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border-4 border-orange-200 overflow-hidden relative">
            {/* Decorative Border Pattern */}
            <div className="absolute inset-0 border-8 border-transparent bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 rounded-2xl sm:rounded-3xl opacity-20"></div>
            
            {/* Header with Images */}
            <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden border-b-4 border-orange-200">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-transparent to-transparent" />
                  
                  {/* Decorative Corner Elements */}
                  <div className="absolute top-2 left-2 text-yellow-400 text-xl sm:text-2xl">🪔</div>
                  <div className="absolute top-2 right-2 text-yellow-400 text-xl sm:text-2xl">🪔</div>
                  <div className="absolute bottom-8 left-2 text-red-400 text-xl sm:text-2xl">🌺</div>
                  <div className="absolute bottom-8 right-2 text-red-400 text-xl sm:text-2xl">🌺</div>
                  
                  {/* Image Indicators */}
                  {invitation.images.length > 1 && (
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2">
                      {invitation.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex ? 'bg-yellow-400' : 'bg-yellow-400/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                  <div className="text-4xl sm:text-6xl text-yellow-100">🕉️</div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 relative">
              {/* Decorative Top Border */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full p-2">
                <span className="text-yellow-100 text-lg sm:text-xl">🕉️</span>
              </div>
              
              {/* Sanskrit Blessing */}
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-orange-700 font-bold text-sm sm:text-base italic">Auspicious Wedding</p>
                <p className="text-orange-600 text-xs sm:text-sm">(Sacred Union)</p>
              </div>
              
              {/* Names */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-2 font-serif">{invitation.male_name}</h2>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center animate-pulse border-2 border-yellow-400">
                    <span className="text-sm sm:text-lg md:text-xl text-yellow-100">💐</span>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-red-800 mb-2 font-serif">{invitation.female_name}</h2>
                    <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                  </div>
                </div>
                
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-4 sm:px-6 py-2 sm:py-3 border-2 border-orange-300">
                  <span className="text-orange-600 text-sm sm:text-base">🌺</span>
                  <span className="text-red-700 font-bold text-sm sm:text-base md:text-lg font-serif">Sacred Union</span>
                  <span className="text-orange-600 text-sm sm:text-base">🌺</span>
                </div>
              </div>

              {/* Wedding Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-orange-200 relative">
                  <div className="absolute top-2 right-2 text-orange-400 text-sm">🪔</div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center border border-yellow-400">
                      <span className="text-yellow-100 text-sm sm:text-base">📅</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-800 font-serif">Auspicious Date</h3>
                  </div>
                  <p className="text-red-700 text-sm sm:text-base md:text-lg font-semibold">{formatDate(invitation.marriage_date)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-red-200 relative">
                  <div className="absolute top-2 right-2 text-red-400 text-sm">🌺</div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center border border-yellow-400">
                      <span className="text-yellow-100 text-sm sm:text-base">🏛️</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-800 font-serif">Venue</h3>
                  </div>
                  <p className="text-red-700 text-sm sm:text-base md:text-lg font-semibold">{invitation.place}</p>
                </div>
              </div>

              {/* Additional Info */}
              {invitation.additional_info && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-yellow-200 mb-6 sm:mb-8 relative">
                  <div className="absolute top-2 right-2 text-yellow-500 text-sm">🕉️</div>
                  <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3 sm:mb-4 flex items-center gap-2 font-serif">
                    <span className="text-yellow-600">🌸</span>
                    Special Message
                  </h3>
                  <p className="text-orange-700 leading-relaxed text-sm sm:text-base font-medium">{invitation.additional_info}</p>
                </div>
              )}

              {/* Music Player */}
              {invitation.song && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-200 mb-6 sm:mb-8 relative">
                  <div className="absolute top-2 right-2 text-purple-400 text-sm">🎵</div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center border border-yellow-400">
                      <span className="text-yellow-100 text-sm sm:text-base">🎶</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-purple-800 font-serif">Music</h3>
                  </div>
                  <AudioPlayer 
                    song={{
                      title: invitation.song,
                      artist: "Wedding Music",
                      previewUrl: "",
                      startTime: 0,
                      duration: 30
                    }}
                    wisherName="Wedding Couple"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="text-center pt-6 sm:pt-8 border-t-2 border-orange-200 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full p-1">
                  <span className="text-yellow-100 text-sm">🌺</span>
                </div>
                <p className="text-orange-700 mb-3 sm:mb-4 text-sm sm:text-base font-medium">Your presence will make our auspicious ceremony complete</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-red-500 animate-pulse">🪔</span>
                  <span className="text-orange-600 font-bold text-sm sm:text-base font-serif">Cordial Invitation</span>
                  <span className="text-red-500 animate-pulse">🪔</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
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
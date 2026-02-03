import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from './AudioPlayer';
import { generateColorTheme, generateThemeCSS, ColorTheme } from '../utils/colorTheme';

interface MarriageInvitation {
  id: string;
  male_name: string;
  female_name: string;
  marriage_date: string;
  place: string;
  song: string;
  additional_info: string;
  images: string[];
  male_image?: string;
  female_image?: string;
  love_images?: string[];
  primary_color?: string;
}

const MarriageInvitationDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<MarriageInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [showFullInvitation, setShowFullInvitation] = useState(false);
  const [theme, setTheme] = useState<ColorTheme>(generateColorTheme('#10b981'));
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [parsedSong, setParsedSong] = useState<{
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  } | null>(null);

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
      setTheme(generateColorTheme(data.primary_color || '#10b981'));
      
      // Parse song data if it exists
      if (data.song) {
        try {
          const songData = JSON.parse(data.song);
          setParsedSong(songData);
        } catch (e) {
          console.error('Error parsing song data:', e);
        }
      }
      
      setLoading(false);
    };

    fetchInvitation();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            className="w-20 h-20 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-rose-300 text-xl font-light"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading 
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">💔</div>
          <h2 className="text-3xl font-light mb-4">Invitation Not Found</h2>
          <p className="text-rose-300">This invitation may have expired or doesn't exist.</p>
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

  if (!showFullInvitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 flex items-center justify-center relative overflow-hidden p-4 sm:p-8">
        {/* Animated Background Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
        
        {/* Main Card */}
        <motion.div
          className="bg-white/8 backdrop-blur-3xl rounded-3xl sm:rounded-[2.5rem] border border-white/15 shadow-2xl overflow-hidden relative max-w-4xl w-full"
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5 }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 40px 80px -12px rgba(0, 0, 0, 0.7)",
            borderColor: "rgba(255, 255, 255, 0.25)"
          }}
        >
          {/* Premium Border Glow */}
          <div className="absolute inset-0 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-cyan-500/15 blur-xl -z-10" />
          
          <div className="p-4 sm:p-6 md:p-8 text-center text-white z-10">
            <motion.div
              className="text-6xl sm:text-8xl mb-8"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              💕
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl font-thin mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {invitation.male_name} & {invitation.female_name}
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-emerald-300 font-light mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              are getting married
            </motion.p>
            
            {/* Buttons Container */}
            <div className="flex items-center justify-center">
              {/* Single Open Button that also plays song */}
              <motion.button
                onClick={() => {
                  setShowFullInvitation(true);
                  if (parsedSong) {
                    setShowAudioPlayer(true);
                  }
                }}
                className="px-8 py-4 rounded-full text-white font-medium text-lg transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                }}
                whileHover={{ 
                  boxShadow: `0 8px 25px rgba(${theme.glow}, 0.3)` 
                }}
              >
                {parsedSong ? 'Open Invitation' : '💕 Open Invitation'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        background: `linear-gradient(135deg, rgba(${theme.glow}, 0.1) 0%, rgba(${theme.glow}, 0.05) 50%, rgba(${theme.glow}, 0.1) 100%), linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)`
      }}
    >
      {/* Audio Player - Better positioned */}
      {showAudioPlayer && parsedSong && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-xs">
          <AudioPlayer 
            song={parsedSong} 
            wisherName={`${invitation.male_name} & ${invitation.female_name}`}
            theme={theme}
            isMarriage={true}
          />
        </div>
      )}
      
      <style>{`
        :root { ${generateThemeCSS(theme)} }
        @import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap');
      `}</style>
      <motion.div 
        className="relative z-10 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Hero Section */}
        <motion.section 
          className="min-h-screen p-2 sm:p-4 md:p-6 pt-20 sm:pt-24 md:pt-32 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Floating Decorative Elements */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: `rgba(${theme.glow}, 0.3)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
          
          <div className="w-full relative">
            {/* Premium Content */}
            <div className="w-full">
                {/* Wedding Invitation Header */}
                <motion.div 
                  className="text-center mb-4 sm:mb-6 md:mb-8 pt-2 sm:pt-4"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                >
                  <motion.div
                    className="mb-8 sm:mb-12"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 
                      className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight mb-6 sm:mb-8 tracking-wide"
                      style={{
                        fontFamily: '"Tangerine", cursive',
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700
                      }}
                    >
                      Wedding Invitation
                    </h1>
                    
                    {/* Simple Divider */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
                      <div 
                        className="w-12 sm:w-20 md:w-32 h-px"
                        style={{
                          background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)`
                        }}
                      />
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                      />
                      <div 
                        className="w-16 sm:w-24 md:w-40 h-px"
                        style={{
                          background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary}, ${theme.accent})`
                        }}
                      />
                      <div 
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <div 
                        className="w-12 sm:w-20 md:w-32 h-px"
                        style={{
                          background: `linear-gradient(to right, transparent, ${theme.accent}, transparent)`
                        }}
                      />
                    </div>
                    
                    {/* Subtitle */}
                    <p 
                      className="text-base sm:text-xl md:text-2xl lg:text-3xl font-light italic tracking-wide leading-relaxed px-4"
                      style={{ color: theme.text }}
                    >
                       Together with our families,<br/> we joyfully invite you to celebrate our sacred union 💕
                    </p>
                  </motion.div>
                </motion.div>

                {/* Simple Elegant Couple Photos */}
                <motion.div 
                  className="mb-20 relative"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <div className="max-w-4xl mx-auto text-center">

                    
                    {/* Photos Side by Side */}
                    <motion.div 
                      className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-12"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.8 }}
                    >
                      {/* Groom Photo */}
                      {invitation.male_image && (
                        <motion.div
                          className="relative group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div 
                            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white"
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}20, ${theme.secondary}20)`
                            }}
                          >
                            <img
                              src={invitation.male_image}
                              alt={invitation.male_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Center Content - Names and Heart */}
                      <motion.div 
                        className="flex flex-col items-center text-center mx-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                      >
                        <h2 
                          className="text-3xl sm:text-5xl font-thin mb-2"
                          style={{
                            fontFamily: '"Tangerine", cursive',
                            fontWeight: 700
                          }}
                        >
                          <span 
                            style={{
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                          <h3 
                      className="text-3xl sm:text-3xl md:text-5xl font-thin tracking-[0.2em]"
                      style={{
                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.text}, ${theme.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {invitation.male_name}
                    </h3>
                          </span>
                          {' '}
                          💕{' '}
                          <span 
                            style={{
                              background: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                          <h3 
                      className="text-3xl sm:text-3xl md:text-5xl font-thin tracking-[0.2em]"
                      style={{
                        background: `linear-gradient(135deg, ${theme.secondary}, ${theme.text}, ${theme.primary})`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}
                    >
                      {invitation.female_name}
                    </h3>
                          </span>
                        </h2>
                        
                      </motion.div>
                      
                      {/* Bride Photo */}
                      {invitation.female_image && (
                        <motion.div
                          className="relative group"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div 
                            className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl border-4 border-white"
                            style={{
                              background: `linear-gradient(135deg, ${theme.secondary}20, ${theme.accent}20)`
                            }}
                          >
                            <img
                              src={invitation.female_image}
                              alt={invitation.female_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                    
                    {/* Wedding Details */}
                    <motion.div 
                      className="max-w-2xl mx-auto"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 }}
                    >
                      <div 
                        className="p-6 rounded-2xl border border-white/20 backdrop-blur-sm"
                        style={{
                          background: `linear-gradient(145deg, ${theme.background}50, ${theme.backgroundSecondary}30)`
                        }}
                      >
                        <h3 
                          className="text-2xl font-light mb-4"
                          style={{ color: theme.text }}
                        >
                          {formatDate(invitation.marriage_date)}
                        </h3>
                        
                        <p 
                          className="text-lg font-light mb-4"
                          style={{ color: theme.textSecondary }}
                        >
                          {invitation.place}
                        </p>
                        
                        {invitation.additional_info && (
                          <p 
                            className="text-base font-light italic leading-relaxed border-t pt-4 mt-4"
                            style={{ 
                              color: theme.text,
                              borderColor: `${theme.primary}30`
                            }}
                          >
                            "{invitation.additional_info}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>



                {/* Love Journey with Wedding Info - True Zig Zag Layout */}
                {invitation.love_images && invitation.love_images.length > 0 && (
                  <motion.div 
                    className="mb-32 sm:mb-40 relative overflow-hidden"
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1.5, ease: "easeOut" }}
                  >
                    <div className="max-w-7xl mx-auto ">
                      {/* Title */}
                      {/* <motion.div className="text-center mb-20">
                        <h3 
                          className="text-2xl sm:text-3xl md:text-4xl font-thin mb-8 tracking-wide"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                          }}
                        >
                          Our Journey Together
                        </h3>
                      </motion.div> */}

                      {/* Dynamic Zig Zag Items */}
                      <div>
                        {invitation.love_images?.map((image, index) => {
                          const items = [
                            { title: 'Save the Date', icon: '📅', content: formatDate(invitation.marriage_date), desc: 'The day our hearts become one forever', color: theme.primary, gradient: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` },
                            { title: 'Sacred Venue', icon: '🏛️', content: invitation.place, desc: 'Where our souls unite in eternal love', color: theme.secondary, gradient: `linear-gradient(135deg, ${theme.secondary}, ${theme.accent})` },
                            { title: 'From Our Hearts', icon: '💌', content: invitation.additional_info || 'A special message of love', desc: 'A message filled with love and gratitude', color: theme.accent, gradient: `linear-gradient(135deg, ${theme.accent}, ${theme.primary})` },
                            { title: 'Our Promise', icon: '💍', content: 'Forever and Always', desc: 'A bond that will never break', color: theme.primary, gradient: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }
                          ];
                          const item = items[index] || items[index % items.length];
                          const isEven = index % 2 === 0;
                          return (
                            <motion.div 
                              key={index}
                              className={`flex ${isEven ? 'flex-row' : 'flex-row-reverse'} md:flex-row items-center mb-20`}
                              initial={{ x: isEven ? -100 : 100, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: 1.5 + index * 0.3, duration: 1 }}
                            >
                              <div className="w-4/5">
                                <motion.div className="relative group cursor-pointer" whileHover={{ scale: 1.05 }}>
                                  <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-50" style={{ background: `linear-gradient(135deg, rgba(${theme.glow}, 0.3), rgba(${theme.glow}, 0.1))` }} />
                                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                                    <img src={image} alt={item.title} className="w-full h-full sm:h-96 object-cover" />
                                  </div>
                                </motion.div>
                              </div>
                              <div className={`w-2/5 ${!isEven ? 'md:order-1' : ''}`}>
                                <div className="p-4 md:p-8">
                                  <div className="flex items-center mb-3 md:mb-6">
                                    {/* <div className="w-8 h-8 md:w-16 md:h-16 rounded-full flex items-center justify-center mr-3 md:mr-6" style={{ background: item.gradient }}>
                                      <span className="text-sm md:text-2xl">{item.icon}</span>
                                    </div> */}
                                    <div>
                                      <h4 className="text-sm md:text-2xl lg:text-3xl font-light mb-1 md:mb-2" style={{ color: theme.text }}>{item.title}</h4>
                                      <div className="w-8 md:w-20 h-0.5 md:h-1 rounded-full" style={{ background: item.gradient }} />
                                    </div>
                                  </div>
                                  <p className="text-lg md:text-3xl lg:text-4xl font-thin mb-2 md:mb-4" style={{ color: item.color }}>{item.content}</p>
                                  <p className="text-xs md:text-lg font-light italic" style={{ color: theme.textSecondary }}>{item.desc}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                    </div>
                  </motion.div>
                )}

                {/* Elegant Footer */}
                <motion.div 
                  className="text-center pt-6 sm:pt-8 border-t relative"
                  style={{ borderColor: theme.border }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 1 }}
                >
                  <div 
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 rounded-full blur-xl"
                    style={{
                      background: `linear-gradient(135deg, rgba(${theme.glow}, 0.2), rgba(${theme.glow}, 0.1))`
                    }}
                  />
                  
                  <motion.div
                    className="mb-6 sm:mb-8"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <p 
                      className="text-base sm:text-lg md:text-xl font-light mb-2 sm:mb-3 tracking-wide"
                      style={{ color: theme.text }}
                    >
                      🌹 Join us as we unite in holy matrimony 🌹
                    </p>
                    <p 
                      className="text-sm sm:text-base font-light italic"
                      style={{ color: theme.textSecondary }}
                    >
                      💒 Your blessed presence would make our sacred day complete 💒
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col items-center gap-4 sm:gap-6"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                      <motion.span 
                        className="text-2xl sm:text-3xl"
                        style={{ color: theme.primary }}
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💖
                      </motion.span>
                      <span 
                        className="font-light text-sm sm:text-base md:text-lg tracking-widest text-center"
                        style={{ color: theme.text }}
                      >
                        💕 With Eternal Love & Divine Blessings 💕
                      </span>
                      <motion.span 
                        className="text-2xl sm:text-3xl"
                        style={{ color: theme.primary }}
                        animate={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      >
                        💖
                      </motion.span>
                    </div>
                    
                    <div 
                      className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm tracking-widest"
                      style={{ color: theme.textSecondary }}
                    >
                      <div 
                        className="w-4 h-px"
                        style={{ backgroundColor: theme.textSecondary }}
                      />
                      <span className="font-light">💌 BLESSED RSVP REQUESTED 💌</span>
                      <div 
                        className="w-4 h-px"
                        style={{ backgroundColor: theme.textSecondary }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default MarriageInvitationDisplay;

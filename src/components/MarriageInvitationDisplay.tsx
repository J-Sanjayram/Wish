import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase, checkAndDeleteExpiredInvitations } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from './AudioPlayer';
import { generateColorTheme, generateThemeCSS, ColorTheme } from '../utils/colorTheme';

// Declare dotlottie-player for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any;
    }
  }
}

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
  const [isExpired, setIsExpired] = useState(false);
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    if (showFullInvitation) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const duration = scrollHeight * 20; // 20ms per pixel for slow scroll
      
      const startTime = Date.now();
      const startPosition = window.pageYOffset;
      
      const scroll = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const position = startPosition + (scrollHeight * progress);
        
        window.scrollTo(0, position);
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };
      
      setTimeout(() => scroll(), 2000); // Start after 1 second
    }
  }, [showFullInvitation]);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!id) return;

      // Check and delete expired invitations first
      await checkAndDeleteExpiredInvitations();

      const { data, error } = await supabase
        .from('marriage_invitations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Check if this invitation has expired (1 day after wedding date)
      const weddingDate = new Date(data.marriage_date);
      const today = new Date();
      const oneDayAfterWedding = new Date(weddingDate.getTime() + 24 * 60 * 60 * 1000);
      
      if (today > oneDayAfterWedding) {
        setIsExpired(true);
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

    // Load dotlottie-player script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs';
    script.type = 'module';
    document.head.appendChild(script);

    fetchInvitation();

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
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

  if (!invitation || isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-8xl mb-6">❤️</div>
          <h2 className="text-3xl font-light mb-4">
            {isExpired ? 'Invitation Expired' : 'Invitation Not Found'}
          </h2>
          <p className="text-rose-300">
            {isExpired 
              ? 'This wedding invitation has expired and is no longer available.' 
              : 'This invitation may have expired or doesn\'t exist.'}
          </p>
          <motion.button
            onClick={() => window.location.href = '/'}
            className="mt-8 px-6 py-3 bg-rose-600 hover:bg-rose-700 rounded-full text-white font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create New Invitation
          </motion.button>
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
              className="text-6xl sm:text-8xl mb-8 flex items-center justify-center"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
             <dotlottie-player
                ref={lottieRef}
                src="/Wedding.lottie"
                background="transparent"
                speed="0.7"
                style={{ width: '140px', height: '140px' }}
                loop
                playmode='bounce'
                autoplay
                className="mx-auto"
              />
            </motion.div>
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-7xl font-thin mb-6 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {invitation.male_name} <br/>&<br/> {invitation.female_name}
            </motion.h1>
            <motion.div 
              className="text-xl sm:text-2xl text-emerald-300 font-light mb-8 flex items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span>are getting married</span>
              {/* <dotlottie-player
                ref={lottieRef}
                src="/Wedding.lottie"
                background="transparent"
                speed="1"
                style={{ width: '40px', height: '40px' }}
                loop
                autoplay
              /> */}
            </motion.div>
            
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

                    
                    {/* Photos Left and Right Layout */}
<motion.div 
  className="flex items-center justify-center sm:gap-1 md:gap-2 max-w-5xl mx-auto mb-8 px-4"
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ delay: 1.2, duration: 0.8 }}
>
  {/* Groom Photo - Left */}
  {invitation.male_image && (
    <motion.div
      className="relative group flex-shrink-0  z-10" // Added negative margin for overlap and z-index for layering
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      whileHover={{ scale: 1.05 }}
    >
      <div 
        className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl border-b-2 border-white"
        style={{
          borderColor:theme.primary,
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
  
  {/* Bride Photo - Right */}
  {invitation.female_image && (
    <motion.div
      className="relative group flex-shrink-0 " // Added negative margin for overlap
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      whileHover={{ scale: 1.05 }}
    >
      <div 
        className="w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden shadow-2xl border-b-2 border-white"
        style={{
          borderColor:theme.primary,
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

                    
                    {/* Names Below Photos */}
                    <motion.div 
                      className="text-center mb-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6 }}
                    >
                      <h2 
                        className="text-3xl sm:text-5xl font-thin mb-2"
                        style={{
                          fontFamily: '"Tangerine", cursive',
                          fontWeight: 700
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
                        {' '}
                        💕{' '}
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
                      </h2>
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

                {/* Premium Elegant Footer */}
                <motion.div 
                  className="relative  sm:pt-20 pb-12 sm:pb-16 overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 1 }}
                >
                  {/* Modern Content Container */}
                  <div className="relative max-w-4xl mx-auto">
                    <motion.div
                      className="relative backdrop-blur-xl rounded-3xl border border-white/10 p-8 sm:p-12"
                      style={{
                        background: `linear-gradient(145deg, rgba(${theme.glow}, 0.05), rgba(${theme.glow}, 0.02))`
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: `0 25px 50px -12px rgba(${theme.glow}, 0.25)`
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Main Content Grid */}
                      <div className="grid md:grid-cols-2 gap-8 sm:gap-12">
                        {/* Left Column - Invitation Text */}
                        <motion.div
                          className="text-center md:text-left"
                          initial={{ x: -50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 2.6, duration: 1 }}
                        >
                          <h3 
                            className="text-2xl sm:text-3xl md:text-4xl font-thin mb-4 sm:mb-6 leading-relaxed"
                            style={{
                              fontFamily: '"Tangerine", cursive',
                              fontWeight: 700,
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text'
                            }}
                          >
                            Join Our Celebration
                          </h3>
                          
                          <p 
                            className="text-base sm:text-lg font-light mb-4 leading-relaxed"
                            style={{ color: theme.text }}
                          >
                            We would be honored to have you witness our union and share in the joy of our special day.
                          </p>
                          
                          <p 
                            className="text-sm sm:text-base font-light italic"
                            style={{ color: theme.textSecondary }}
                          >
                            Your presence is the greatest gift we could ask for.
                          </p>
                        </motion.div>
                        
                        {/* Right Column - Details */}
                        <motion.div
                          className="text-center md:text-right"
                          initial={{ x: 50, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 2.8, duration: 1 }}
                        >
                          <div
                            className="inline-block px-6 sm:px-8 py-4 sm:py-6 rounded-2xl border border-white/20 backdrop-blur-sm mb-6"
                            style={{
                              background: `linear-gradient(135deg, rgba(${theme.glow}, 0.1), rgba(${theme.glow}, 0.05))`
                            }}
                          >
                            <h4 
                              className="text-lg sm:text-xl font-light mb-3 tracking-wide"
                              style={{ color: theme.text }}
                            >
                              SAVE THE DATE
                            </h4>
                            
                            <p 
                              className="text-sm sm:text-base font-light"
                              style={{ color: theme.textSecondary }}
                            >
                              Mark your calendar for our special day
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <p 
                              className="text-sm font-light tracking-wider"
                              style={{ color: theme.textSecondary }}
                            >
                              WITH LOVE & GRATITUDE
                            </p>
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Bottom Decorative Line */}
                      <motion.div 
                        className="flex justify-center mt-8 sm:mt-12"
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 5, repeat: Infinity }}
                      >
                        <div 
                          className="w-32 sm:w-48 h-px"
                          style={{
                            background: `linear-gradient(to right, transparent, ${theme.primary}, transparent)`
                          }}
                        />
                      </motion.div>
                      
                      {/* Create Another Invitation Button */}
                      <motion.div 
                        className="flex justify-center mt-8 sm:mt-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3, duration: 1 }}
                      >
                        <motion.button
                          onClick={() => window.open('/', '_blank')}
                          className="px-6 py-3 rounded-full text-white font-medium text-sm transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{
                            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                          }}
                          whileHover={{ 
                            boxShadow: `0 8px 25px rgba(${theme.glow}, 0.3)` 
                          }}
                        >
                          Create Another Invitation
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default MarriageInvitationDisplay;

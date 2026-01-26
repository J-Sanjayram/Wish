import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'framer-motion';
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
  male_image?: string;
  female_image?: string;
  love_images?: string[];
}

const MarriageInvitationDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [invitation, setInvitation] = useState<MarriageInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [showFullInvitation, setShowFullInvitation] = useState(false);

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
      
      // Auto-start full invitation after 2 seconds
      setTimeout(() => setShowFullInvitation(true), 2000);
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
            Loading your magical invitation...
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
      <div className="min-h-screen bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden p-4 sm:p-8">
        {/* Animated Background Particles */}
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-rose-400 rounded-full opacity-30"
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
          <div className="absolute inset-0 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-indigo-500/15 blur-xl -z-10" />
          
          <div className="p-8 sm:p-12 md:p-16 text-center text-white z-10">
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
              className="text-4xl sm:text-5xl md:text-7xl font-thin mb-6 bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {invitation.male_name} & {invitation.female_name}
            </motion.h1>
            <motion.p 
              className="text-xl sm:text-2xl text-rose-300 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              are getting married
            </motion.p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-rose-900 relative">
      <motion.div 
        className="relative z-10 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        {/* Hero Section */}
        <motion.section 
          className="min-h-screen flex items-center justify-center p-4 sm:p-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="max-w-none w-full">
            {/* Main Card */}
            <motion.div 
              className="bg-white/8 backdrop-blur-3xl rounded-3xl sm:rounded-[2.5rem] border border-white/15 shadow-2xl overflow-hidden relative"
              whileHover={{ 
                scale: 1.01,
                boxShadow: "0 40px 80px -12px rgba(0, 0, 0, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.25)"
              }}
              transition={{ duration: 0.4 }}
            >
              {/* Premium Border Glow */}
              <div className="absolute inset-0 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-r from-rose-500/15 via-purple-500/15 to-indigo-500/15 blur-xl -z-10" />

              {/* Premium Content */}
              <div className="p-8 sm:p-12 md:p-16">
                {/* Wedding Invitation Header */}
                <motion.div 
                  className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
                >
                  <motion.div
                    className="mb-8 sm:mb-12"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-9xl font-extralight text-transparent bg-gradient-to-r from-rose-300 via-purple-300 to-indigo-300 bg-clip-text mb-6 sm:mb-8 tracking-widest">
                      Wedding Invitation
                    </h1>
                    
                    {/* Elegant Divider */}
                    <div className="flex items-center justify-center gap-3 sm:gap-6 mb-6 sm:mb-8">
                      <div className="w-12 sm:w-20 md:w-32 h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-rose-400 rounded-full animate-pulse" />
                      <div className="w-16 sm:w-24 md:w-40 h-px bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400" />
                      <div className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-400 rounded-full animate-pulse" />
                      <div className="w-12 sm:w-20 md:w-32 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
                    </div>
                    
                    {/* Subtitle */}
                    <p className="text-white/80 text-base sm:text-xl md:text-2xl lg:text-3xl font-light italic tracking-wide leading-relaxed px-4">
                       Together with our families,<br/> we joyfully invite you to celebrate our sacred union 💕
                    </p>
                  </motion.div>
                </motion.div>

                {/* Couple Photos Section */}
                <motion.div 
                  className="flex items-center justify-center mb-12 sm:mb-16"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                >
                  <div className="relative flex items-center justify-center">
                    {/* Groom Photo */}
                    {invitation.male_image && (
                      <motion.div
                        className="relative z-10"
                        whileHover={{ scale: 1.05, x: -10 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/40 to-cyan-400/40 rounded-full blur-lg" />
                          <img
                            src={invitation.male_image}
                            alt="Groom"
                            className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-white/60 shadow-2xl"
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Bride Photo - Overlapping */}
                    {invitation.female_image && (
                      <motion.div
                        className="relative z-20 -ml-8 sm:-ml-12 md:-ml-16"
                        whileHover={{ scale: 1.05, x: 10 }}
                        style={{ transformStyle: 'preserve-3d' }}
                      >
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/40 to-rose-400/40 rounded-full blur-lg" />
                          <img
                            src={invitation.female_image}
                            alt="Bride"
                            className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52 rounded-full object-cover border-4 border-white/60 shadow-2xl"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Names */}
                <motion.div
                  className="text-center mb-12 sm:mb-16"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                >
                  <div className="relative">
                    <h3 className="text-transparent bg-gradient-to-r from-rose-200 via-white to-purple-200 bg-clip-text text-3xl sm:text-4xl md:text-6xl font-thin tracking-[0.2em] mb-4">
                      {invitation.male_name}
                    </h3>
                    <div className="flex items-center justify-center my-6 sm:my-8">
                      <div className="w-16 h-px bg-gradient-to-r from-transparent to-rose-300" />
                      <span className="mx-6 text-rose-300 text-2xl sm:text-3xl md:text-4xl font-thin">&</span>
                      <div className="w-16 h-px bg-gradient-to-r from-purple-300 to-transparent" />
                    </div>
                    <h3 className="text-transparent bg-gradient-to-r from-purple-200 via-white to-rose-200 bg-clip-text text-3xl sm:text-4xl md:text-6xl font-thin tracking-[0.2em]">
                      {invitation.female_name}
                    </h3>
                    <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/10 to-purple-500/10 rounded-3xl blur-2xl opacity-50" />
                  </div>
                </motion.div>

                {/* Elegant Love Gallery */}
                {invitation.love_images && invitation.love_images.length > 1 && (
                  <motion.div 
                    className="mb-16 sm:mb-20 relative overflow-hidden"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.2, duration: 1 }}
                  >

                    
                    <div className="relative z-10">
                      {/* Premium Title Section */}
                      <div className="text-center mb-16 sm:mb-20">
                        <motion.div
                          className="relative"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                        >
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-thin text-transparent bg-gradient-to-r from-rose-300 via-pink-200 via-white via-purple-200 to-indigo-300 bg-clip-text mb-10 tracking-[0.1em] leading-tight">
                            💕 Our Love 💕<br/>Journey 
                          </h3>
                          <div className="absolute -inset-8 bg-gradient-to-r from-rose-500/10 to-purple-500/10 rounded-full blur-2xl opacity-60" />
                        </motion.div>
                        
                        <motion.div 
                          className="flex items-center justify-center gap-6 mb-10"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          transition={{ delay: 1.6, duration: 1.2 }}
                        >
                          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-rose-400 to-rose-500 shadow-lg" />
                          <motion.div 
                            className="w-4 h-4 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full shadow-xl"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                          <div className="w-32 h-0.5 bg-gradient-to-r from-rose-400 via-pink-400 via-purple-400 to-indigo-400 shadow-lg" />
                          <motion.div 
                            className="w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full shadow-xl"
                            animate={{ scale: [1, 1.3, 1], rotate: [360, 180, 0] }}
                            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                          />
                          <div className="w-20 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-400 to-transparent shadow-lg" />
                        </motion.div>
                        
                        <motion.p 
                          className="text-white/80 text-lg sm:text-xl font-light italic leading-relaxed max-w-3xl mx-auto px-6"
                          initial={{ y: 30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 1.8, duration: 1 }}
                        >
                          Timeless moments that painted our hearts with eternal love
                        </motion.p>
                      </div>
                      
                      {/* Cinematic Image Gallery */}
                      <div className="relative">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
                          {invitation.love_images.slice(1).map((image, index) => (
                            <motion.div
                              key={index}
                              className="relative group cursor-pointer"
                              initial={{ scale: 0, opacity: 0, rotateY: -20, z: -100 }}
                              animate={{ scale: 1, opacity: 1, rotateY: 0, z: 0 }}
                              transition={{ 
                                delay: 2 + index * 0.3, 
                                duration: 1, 
                                ease: "easeOut"
                              }}
                              whileHover={{ 
                                scale: 1.12,
                                rotateY: 12,
                                z: 50,
                                transition: { duration: 0.4, ease: "easeOut" }
                              }}
                              style={{ transformStyle: 'preserve-3d' }}
                            >
                              {/* Main Image Container */}
                              <div className="relative overflow-hidden rounded-3xl border-3 border-white/40 group-hover:border-rose-300/80 transition-all duration-700 shadow-2xl group-hover:shadow-rose-500/30">
                                <img
                                  src={image}
                                  alt={`Love Memory ${index + 1}`}
                                  className="w-full h-48 sm:h-52 md:h-60 object-cover transition-all duration-1000 group-hover:scale-125 group-hover:brightness-110 group-hover:contrast-110"
                                />
                                
                                {/* Cinematic Overlays */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 via-transparent to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-pink-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                {/* Floating Love Elements */}
                                <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 transform scale-75 group-hover:scale-100">
                                  <motion.span 
                                    className="text-rose-300 text-xl"
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    💖
                                  </motion.span>
                                </div>
                                
                                {/* Bottom Info Bar */}
                                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-center pb-4">
                                  <span className="text-white/90 text-sm font-light tracking-wider">
                                    Memory {index + 1}
                                  </span>
                                </div>
                                
                                {/* Sparkle Effects */}
                                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                  <motion.div 
                                    className="absolute top-4 left-4 text-yellow-300 text-sm"
                                    animate={{ 
                                      scale: [0, 1, 0],
                                      rotate: [0, 180, 360],
                                      opacity: [0, 1, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                                  >
                                    ✨
                                  </motion.div>
                                  <motion.div 
                                    className="absolute bottom-6 left-6 text-rose-300 text-sm"
                                    animate={{ 
                                      scale: [0, 1, 0],
                                      y: [0, -10, 0],
                                      opacity: [0, 1, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
                                  >
                                    💕
                                  </motion.div>
                                  <motion.div 
                                    className="absolute top-8 right-8 text-purple-300 text-sm"
                                    animate={{ 
                                      scale: [0, 1, 0],
                                      x: [0, 5, 0],
                                      opacity: [0, 1, 0]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
                                  >
                                    ✨
                                  </motion.div>
                                </div>
                              </div>
                              
                              {/* Premium Glow Effects */}
                              <div className="absolute -inset-3 bg-gradient-to-r from-rose-500/40 via-pink-500/30 via-purple-500/30 to-indigo-500/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                              <div className="absolute -inset-1 bg-gradient-to-r from-rose-400/20 to-purple-400/20 rounded-3xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                              
                              {/* 3D Shadow */}
                              <div className="absolute inset-0 bg-black/30 rounded-3xl blur-lg transform translate-y-4 translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-20" />
                            </motion.div>
                          ))}
                        </div>
                        
                        {/* Decorative Elements */}
                        <motion.div 
                          className="absolute -top-10 left-1/4 text-rose-300/30 text-6xl pointer-events-none"
                          animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 10, 0],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ duration: 6, repeat: Infinity }}
                        >
                          💕
                        </motion.div>
                        <motion.div 
                          className="absolute -bottom-10 right-1/4 text-purple-300/30 text-5xl pointer-events-none"
                          animate={{ 
                            y: [0, 15, 0],
                            rotate: [0, -15, 0],
                            opacity: [0.3, 0.7, 0.3]
                          }}
                          transition={{ duration: 8, repeat: Infinity, delay: 3 }}
                        >
                          ✨
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Premium Wedding Details - Three Column Layout */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 1 }}
                >
                  {/* Date Section */}
                  <motion.div 
                    className="group bg-white/8 backdrop-blur-3xl rounded-2xl p-4 border border-white/20 relative overflow-hidden shadow-xl"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.8, duration: 1 }}
                    whileHover={{ 
                      scale: 1.01,
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/8 to-purple-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-light text-white tracking-wide mb-1">Wedding Ceremony</h3>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-rose-400 to-purple-400" />
                        </div>
                      </div>
                      <div className="ml-11">
                        <p className="text-rose-100 text-sm font-medium mb-1">
                          {formatDate(invitation.marriage_date)}
                        </p>
                        <p className="text-white/70 text-xs">
                          Mark your calendar for this celebration
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Venue Section */}
                  <motion.div 
                    className="group bg-white/8 backdrop-blur-3xl rounded-2xl p-4 border border-white/20 relative overflow-hidden shadow-xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    whileHover={{ 
                      scale: 1.01,
                      backgroundColor: 'rgba(255, 255, 255, 0.12)',
                      borderColor: 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-indigo-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-light text-white tracking-wide mb-1">Ceremony Venue</h3>
                          <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-indigo-400" />
                        </div>
                      </div>
                      <div className="ml-11">
                        <p className="text-purple-100 text-sm font-medium mb-1">
                          {invitation.place}
                        </p>
                        <p className="text-white/70 text-xs">
                          Join us at this location for our union
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Additional Info Section */}
                  {invitation.additional_info && (
                    <motion.div 
                      className="group bg-white/8 backdrop-blur-3xl rounded-2xl p-4 border border-white/20 relative overflow-hidden shadow-xl"
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 2.2, duration: 1 }}
                      whileHover={{ 
                        scale: 1.01,
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-teal-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative z-10">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-teal-600 rounded-lg flex items-center justify-center mr-3 shadow-lg">
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-light text-white tracking-wide mb-1">Special Message</h3>
                            <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-teal-400" />
                          </div>
                        </div>
                        <div className="ml-11">
                          <p className="text-indigo-100 text-sm font-medium mb-1">
                            {invitation.additional_info}
                          </p>
                          <p className="text-white/70 text-xs">
                            A message from the couple
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Premium Music Section */}
                {invitation.song && (
                  <motion.div 
                    className="bg-white/5 backdrop-blur-2xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-8 sm:mb-12 relative overflow-hidden"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2.2, duration: 1 }}
                    whileHover={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="absolute top-4 right-4 text-2xl text-purple-400/30">
                      <motion.span
                        animate={{ y: [-5, -15, -5], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                      >
                        ♪
                      </motion.span>
                      <motion.span
                        className="ml-2"
                        animate={{ y: [-10, -20, -10], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      >
                        ♫
                      </motion.span>
                    </div>
                    
                    <div className="flex items-center justify-center mb-4 sm:mb-6">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent to-purple-400" />
                      <h3 className="text-lg sm:text-xl md:text-2xl font-extralight text-white mx-4 tracking-widest">🎵 Our Wedding Melody 🎵</h3>
                      <div className="w-8 h-px bg-gradient-to-r from-purple-400 to-transparent" />
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-3 sm:p-4">
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
                  </motion.div>
                )}

                {/* Elegant Footer */}
                <motion.div 
                  className="text-center pt-6 sm:pt-8 border-t border-white/15 relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.4, duration: 1 }}
                >
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-rose-500/20 to-purple-500/20 rounded-full blur-xl" />
                  
                  <motion.div
                    className="mb-6 sm:mb-8"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <p className="text-white/90 text-base sm:text-lg md:text-xl font-light mb-2 sm:mb-3 tracking-wide">
                      🌹 Join us as we unite in holy matrimony 🌹
                    </p>
                    <p className="text-white/60 text-sm sm:text-base font-light italic">
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
                        className="text-rose-400 text-2xl sm:text-3xl"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        💖
                      </motion.span>
                      <span className="text-white font-light text-sm sm:text-base md:text-lg tracking-widest text-center">💕 With Eternal Love & Divine Blessings 💕</span>
                      <motion.span 
                        className="text-rose-400 text-2xl sm:text-3xl"
                        animate={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      >
                        💖
                      </motion.span>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:gap-3 text-white/40 text-xs sm:text-sm tracking-widest">
                      <div className="w-4 h-px bg-white/40" />
                      <span className="font-light">💌 BLESSED RSVP REQUESTED 💌</span>
                      <div className="w-4 h-px bg-white/40" />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default MarriageInvitationDisplay;
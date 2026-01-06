import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <div className="text-left">
      <motion.div 
        className="inline-flex items-center gap-4 mb-8"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        
      </motion.div>
      
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Create Magical
            <span className="block bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              Birthday Moments
            </span>
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Design personalized birthday wishes with photos, music, and heartfelt messages that create lasting memories.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-white font-semibold text-sm mb-1">Personalized</h3>
            <p className="text-white/70 text-xs">Custom messages & photos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">🎵</div>
            <h3 className="text-white font-semibold text-sm mb-1">Interactive</h3>
            <p className="text-white/70 text-xs">Music & animations</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="text-white font-semibold text-sm mb-1">Shareable</h3>
            <p className="text-white/70 text-xs">Instant social sharing</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl mb-2">🌍</div>
            <h3 className="text-white font-semibold text-sm mb-1">Global</h3>
            <p className="text-white/70 text-xs">Reach anyone, anywhere</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/80 text-sm font-medium">Best Wishes</span>
          </div>
          <div className="flex items-center gap-2">
            
            <span className="text-white/80 text-sm">Trustable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Header;
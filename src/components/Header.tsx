import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  return (
    <div className="text-center mb-6 sm:mb-8">
      <motion.div 
        className="text-4xl sm:text-6xl mb-3 sm:mb-4"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        🎂
      </motion.div>
      
      <motion.h1 
        className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.i 
          className="fas fa-birthday-cake mr-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        Birthday Wishes
      </motion.h1>
      
      <motion.p 
        className="text-white/80 text-base sm:text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Create magical birthday moments 🌍
      </motion.p>
      
      <motion.div 
        className="mt-3 sm:mt-4 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 inline-block"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <span className="text-white font-medium text-sm sm:text-base">
          🎉 <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ∞
          </motion.span> Wishes Created
        </span>
      </motion.div>
    </div>
  );
};

export default Header;
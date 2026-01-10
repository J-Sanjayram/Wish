import React from 'react';
import { motion } from 'framer-motion';
import AdsterraBanner from './AdsterraBanner';

interface SuccessCardProps {
  shareUrl: string;
  masterId?: string;
  onCopyLink: () => void;
  onShareWhatsApp: () => void;
  onCreateAnother: () => void;
}

const SuccessCard: React.FC<SuccessCardProps> = ({
  shareUrl,
  masterId,
  onCopyLink,
  onShareWhatsApp,
  onCreateAnother
}) => {
  return (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        <motion.div 
          className="text-4xl sm:text-5xl mb-4"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        
        <motion.h3 
          className="text-xl sm:text-2xl font-bold text-green-600 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <i className="fas fa-check-circle mr-2"></i>Wish Created!
        </motion.h3>
        
        <motion.p 
          className="text-gray-700 mb-6 text-sm sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Share this magical link:
        </motion.p>
        
        <motion.div 
          className="bg-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 break-all text-xs sm:text-sm font-mono"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {shareUrl}
        </motion.div>
        
        {masterId && (
          <motion.div 
            className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="font-semibold text-yellow-800 mb-2">Master ID (for image management):</h4>
            <div className="text-xs font-mono bg-white p-2 rounded border">
              {masterId}
            </div>
          </motion.div>
        )}
        
        <div className="space-y-2 sm:space-y-3">
          <motion.button
            onClick={onCopyLink}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-copy mr-2"></i>Copy Link
          </motion.button>
          
          <AdsterraBanner />
          
          <motion.button
            onClick={onShareWhatsApp}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fab fa-whatsapp mr-2"></i>Share on WhatsApp
          </motion.button>
          
          <motion.button
            onClick={onCreateAnother}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 text-sm sm:text-base"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <i className="fas fa-plus mr-2"></i>Create Another
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default SuccessCard;
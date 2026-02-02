import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Wish } from './MainApp';
import AudioPlayer from './AudioPlayer';

interface CelebrationScreenProps {
  wish: Wish;
}

const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ wish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [startCelebration, setStartCelebration] = useState(false);

  useEffect(() => {
    if (startCelebration) {
      setTimeout(() => setShowConfetti(true), 1500);
    }
  }, [startCelebration]);

  useEffect(() => {
    if (wish.journeyImages && wish.journeyImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % wish.journeyImages!.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [wish.journeyImages]);

  const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  const handleTakeCake = () => {
    setShowOverlay(false);
    setStartCelebration(true);
  };

  const decodedMessage = decodeHtml(wish.message);
  const decodedFrom = decodeHtml(wish.from);
  const decodedTo = decodeHtml(wish.to);

  return (
    <>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; transform: perspective(500px) rotateX(15deg) scale(1); }
            25% { background-position: 100% 50%; transform: perspective(500px) rotateX(15deg) scale(1.02); }
            50% { background-position: 100% 100%; transform: perspective(500px) rotateX(15deg) scale(1); }
            75% { background-position: 0% 100%; transform: perspective(500px) rotateX(15deg) scale(1.02); }
            100% { background-position: 0% 50%; transform: perspective(500px) rotateX(15deg) scale(1); }
          }
        `}
      </style>
      {showOverlay && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <motion.div
              className="text-8xl mb-6"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎂
            </motion.div>
            <motion.h2
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Take the cake and get your wish!
            </motion.h2>
            <motion.button
              onClick={handleTakeCake}
              className="bg-white text-purple-600 px-8 py-4 rounded-full text-xl font-bold hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🎂 Take Cake
            </motion.button>
          </div>
        </motion.div>
      )}
      
      <div className="fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'linear-gradient(45deg, #9333ea, #ec4899, #ef4444)',
              'linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b)',
              'linear-gradient(135deg, #10b981, #06b6d4, #8b5cf6)',
              'linear-gradient(180deg, #f59e0b, #ef4444, #ec4899)',
              'linear-gradient(225deg, #ec4899, #9333ea, #3b82f6)',
              'linear-gradient(270deg, #8b5cf6, #10b981, #ef4444)',
              'linear-gradient(315deg, #06b6d4, #f59e0b, #9333ea)',
              'linear-gradient(360deg, #ef4444, #3b82f6, #10b981)'
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        {/* Simple continuous animations */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
              style={{
                left: `${(i * 13) % 100}%`,
                top: `${(i * 17) % 100}%`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
        
        {wish.song && startCelebration && <AudioPlayer song={wish.song} wisherName={decodedFrom} />}
        
        {/* Balloons */}
        <motion.div
          className="absolute text-4xl sm:text-5xl"
          style={{ left: '5%', bottom: '10%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, -6, 6, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        >
          🎈
        </motion.div>
        <motion.div
          className="absolute text-4xl sm:text-5xl"
          style={{ right: '5%', bottom: '10%' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 6, -6, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
        >
          🎈
        </motion.div>
        
        {/* Confetti */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: '-5%'
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  rotate: [0, 360],
                  x: [0, Math.random() * 100 - 50]
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>
        )}
        
        {/* Share Button */}
        <motion.button
          onClick={() => {
            const text = `🎉 Check out this amazing birthday wish for ${decodedTo}! ${window.location.href}`;
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }}
          className="fixed bottom-4 right-4 bg-green-500/90 backdrop-blur-sm text-white p-3 rounded-full shadow-lg hover:bg-green-600/90 transition-all duration-300 z-20"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          📤
        </motion.button>
        
        {/* Main Content - Centered between balloons */}
        <div className="flex items-center justify-center min-h-screen px-4 sm:px-16 md:px-24">
          <div className="text-center text-white w-full max-w-md mx-auto">
            {/* Profile Image */}
            {wish.imageUrl && (
              <div className="mb-6 relative">
                <img 
                  src={wish.imageUrl} 
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full mx-auto"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
                    objectFit: 'cover'
                  }}
                  alt="Birthday Person"
                  onLoad={() => setImageLoaded(true)}
                />
              </div>
            )}
            
            {/* Title */}
            <div className="relative mb-4">
              <h1 
                className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 relative z-20 tracking-tight" 
                style={{
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
                  display: 'block',
                  visibility: 'visible',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #ffc3a0 75%, #ffafbd 100%)',
                  backgroundSize: '400% 400%',
                  animation: 'gradientShift 3s ease infinite',
                  transform: 'perspective(500px) rotateX(15deg)'
                }}
              >
                Happy Birthday
              </h1>
            </div>
            
            {/* Name */}
            <div className="relative mb-6">
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white relative z-20 tracking-wide"
                style={{
                  display: 'block',
                  visibility: 'visible',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.5))',
                  transform: 'perspective(300px) rotateX(10deg)',
                  color: '#fff',
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)'
                }}
              >
                {decodedTo}!
              </h2>
            </div>
            
            {/* Journey Images */}
            {wish.journeyImages && wish.journeyImages.length > 0 && (
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl mb-6 border border-white/30 shadow-2xl relative overflow-hidden">
                <div className="relative overflow-hidden">
                  <div
                    className="flex"
                    style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: 'transform 0.6s ease-in-out' }}
                  >
                    {wish.journeyImages.map((image: string, index: number) => (
                      <div key={index} className="w-full flex-shrink-0 flex justify-center">
                        <img
                          src={image}
                          className="max-h-48 max-w-full rounded-2xl"
                          alt={`Journey ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                  {wish.journeyImages.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                      {wish.journeyImages.map((_: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Message */}
            <div className="mb-6 relative z-20">
              <p 
                className="text-sm sm:text-base italic mb-4 leading-relaxed text-white px-2"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  display: 'block',
                  visibility: 'visible'
                }}
              >
                "{decodedMessage}"
              </p>
              <p 
                className="text-sm sm:text-base font-semibold text-yellow-300"
                style={{
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  display: 'block',
                  visibility: 'visible'
                }}
              >
                - From {decodedFrom} ❤️
              </p>
            </div>
            
            {/* Create Another Button */}
            <button
              onClick={() => window.location.href = window.location.origin + window.location.pathname}
              className="bg-white/20 backdrop-blur-sm text-white py-2 px-6 rounded-full text-sm hover:bg-white/30 transition-all duration-300 shadow-lg"
            >
              Create Another Wish
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CelebrationScreen;
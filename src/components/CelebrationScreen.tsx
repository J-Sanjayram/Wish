import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Wish } from '../App';
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      life: number;
    }> = [];
    
    const createFirework = () => {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
      for(let i = 0; i < 15; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 1,
          life: 1
        });
      }
    };
    
    // Remove floating hearts
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Animate firework particles
      for(let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        p.vy += 0.1;
        
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        if(p.life <= 0) particles.splice(i, 1);
      }
      
      if(particles.length > 0) requestAnimationFrame(animate);
    };
    
    const interval = setInterval(createFirework, 2000);
    createFirework();
    animate();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
          @import url('https://fonts.googleapis.com/css2?family=Tangerine:wght@400;700&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Alan+Sans:wght@300..900&display=swap');
          
          .alan-sans-<uniquifier> {
            font-family: "Alan Sans", sans-serif;
            font-optical-sizing: auto;
            font-weight: <weight>;
            font-style: normal;
          }
          .tangerine-regular {
            font-family: "Tangerine", cursive;
            font-weight: 700;
            font-style: normal;
          }
          .tangerine-bold {
            font-family: "Tangerine", cursive;
            font-weight: 700;
            font-style: normal;
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
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
      
      <motion.div 
        className="fixed inset-0 flex items-center justify-center overflow-hidden relative min-h-screen"
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
      >
        {wish.song && startCelebration && <AudioPlayer song={wish.song} wisherName={decodedFrom} />}
        
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        
        {/* Floating Balloons - Bottom Corners Only */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bottom corner balloons */}
          <motion.div
            className="absolute text-5xl"
            style={{ left: '5%', bottom: '15%' }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, -6, 6, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
          >
            🎈
          </motion.div>
          <motion.div
            className="absolute text-5xl"
            style={{ right: '5%', bottom: '15%' }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 6, -6, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, delay: 0.8 }}
          >
            🎈
          </motion.div>
        </div>
        
        {/* Confetti Rain - Particles Only */}
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
        
        <motion.div 
          className="relative z-10 text-center text-white max-w-xs sm:max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          
          
          {/* Sparkle Effects around image - Particles Only */}
          {wish.imageUrl && imageLoaded && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  style={{
                    left: '50%',
                    top: '20%',
                    transform: `rotate(${i * 45}deg) translateY(-80px)`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>
          )}
          
          {wish.imageUrl && (
            <motion.div 
              className="mb-6 sm:mb-8 relative mt-10"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {!imageLoaded && (
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full mx-auto bg-white/20 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <motion.div className="relative inline-block">
                {/* Enhanced frame layers */}
                <div className="absolute inset-0 rounded-full">
                  {/* Outer glow ring */}
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 opacity-60"
                    style={{
                      background: 'linear-gradient(45deg, #fbbf24, #f472b6, #a855f7)',
                      padding: '8px',
                      borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Middle decorative ring */}
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-white/40"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Inner sparkle ring */}
                  <motion.div
                    className="absolute inset-4 rounded-full border border-yellow-300/60"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 3, repeat: Infinity }
                    }}
                  />
                </div>
                
                <motion.img 
                  src={wish.imageUrl} 
                  className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full mx-auto relative z-10 ${!imageLoaded ? 'hidden' : ''}`}
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
                    objectFit: 'cover',
                    backgroundColor: 'transparent'
                  }}
                  alt="Birthday Person"
                  onLoad={() => setImageLoaded(true)}
                  animate={{ 
                    scale: [1, 1.05, 1],
                    filter: [
                      'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))',
                      'drop-shadow(0 0 30px rgba(147, 51, 234, 1))',
                      'drop-shadow(0 0 20px rgba(236, 72, 153, 0.8))'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>
          )}
          
          <motion.h1 
            className="text-3xl sm:text-6xl md:text-8xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-pink-300 bg-clip-text text-transparent drop-shadow-2xl alan-sans-700" 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.span
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Happy Birthday
            </motion.span>
          </motion.h1>
          
          <motion.h2 
            className="text-2xl sm:text-4xl md:text-6xl font-bold mb-6 sm:mb-8 text-white drop-shadow-lg"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {decodedTo}!
            </motion.span>
          </motion.h2>
          
          <motion.div 
            className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 border border-white/30 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            {wish.journeyImages && wish.journeyImages.length > 0 ? (
              <div className="relative overflow-hidden p-2">
                <motion.div
                  className="flex"
                  animate={{ x: -currentImageIndex * 100 + '%' }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  {wish.journeyImages.map((image, index) => (
                    <div key={index} className="w-full flex-shrink-0 flex justify-center">
                      <img
                        src={image}
                        className="max-h-48 max-w-full rounded-2xl sm:rounded-3xl"
                        alt={`Journey ${index + 1}`}
                      />
                    </div>
                  ))}
                </motion.div>
                {wish.journeyImages.length > 1 && (
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {wish.journeyImages.map((_, index) => (
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
            ) : (
              <div className="h-32 sm:h-48 flex flex-col items-center justify-center p-4 sm:p-8">
                <motion.div
                  className="relative"
                  animate={{ 
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="text-6xl sm:text-7xl mb-2">🎂</div>
                  <motion.div 
                    className="absolute -top-2 -right-2 text-yellow-400"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✨
                  </motion.div>
                  <motion.div 
                    className="absolute -top-1 -left-3 text-pink-400"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}
                  >
                    🎉
                  </motion.div>
                </motion.div>
                <motion.p 
                  className="text-white/80 text-sm mt-2"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Many More Happy Returns!
                </motion.p>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="text-center">
              <motion.p 
                className="text-base sm:text-xl md:text-2xl italic mb-4 sm:mb-6 leading-relaxed relative text-xl"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3s ease-in-out infinite',
                  fontSize: '1.0rem'
                }}
              >
                "{decodedMessage}"
              </motion.p>
              <motion.p 
                className="text-sm sm:text-lg md:text-xl font-semibold relative text-lg"
                style={{
                  background: 'linear-gradient(90deg, rgba(255,235,59,0.8) 0%, rgba(255,235,59,1) 50%, rgba(255,235,59,0.8) 100%)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: 'shimmer 3.5s ease-in-out infinite 0.5s',
                  fontSize: '1.2rem'
                }}
              >
                - From {decodedFrom} ❤️
              </motion.p>
            </div>
          </motion.div>
          
          <motion.button
            onClick={() => window.location.href = window.location.origin + window.location.pathname}
            className="bg-white/20 backdrop-blur-sm border-white text-white py-1 sm:py-1 px-4 sm:px-4 rounded-full text-sm sm:text-sm hover:bg-white/30 transition-all duration-300 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Another Wish
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CelebrationScreen;
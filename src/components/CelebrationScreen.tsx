import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Wish } from '../App';

interface CelebrationScreenProps {
  wish: Wish;
}

const CelebrationScreen: React.FC<CelebrationScreenProps> = ({ wish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      for(let i = 0; i < 30; i++) {
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
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
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
    
    const interval = setInterval(createFirework, 800);
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

  const decodedMessage = decodeHtml(wish.message);
  const decodedFrom = decodeHtml(wish.from);
  const decodedTo = decodeHtml(wish.to);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      
      <motion.div 
        className="relative z-10 text-center text-white max-w-xs sm:max-w-4xl mx-auto"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="text-4xl sm:text-6xl mb-4 sm:mb-6"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨🎉✨
        </motion.div>
        
        {wish.imageUrl && (
          <motion.div 
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.img 
              src={wish.imageUrl} 
              className="w-32 h-32 sm:w-48 sm:h-48 rounded-full mx-auto object-cover shadow-2xl shadow-pink-500/60 hover:shadow-purple-500/80" 
              alt="Birthday Person"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 25px 50px -12px rgba(236, 72, 153, 0.6)',
                  '0 25px 50px -12px rgba(147, 51, 234, 0.8)',
                  '0 25px 50px -12px rgba(236, 72, 153, 0.6)'
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        )}
        
        <motion.h1 
          className="text-4xl sm:text-6xl md:text-8xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent drop-shadow-2xl" 
          style={{fontFamily: 'Brush Script MT, cursive'}}
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
          className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 sm:mb-8 border border-white/30 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <motion.div 
            className="text-2xl sm:text-4xl mb-3 sm:mb-4"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎂🎁🎂
          </motion.div>
          <p className="text-base sm:text-xl md:text-2xl italic mb-4 sm:mb-6 leading-relaxed text-white/95">
            "{decodedMessage}"
          </p>
          <p className="text-sm sm:text-lg md:text-xl font-semibold text-yellow-200">
            - From {decodedFrom} ❤️
          </p>
        </motion.div>
        
        <motion.div 
          className="text-6xl sm:text-8xl mb-6 sm:mb-8"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          🎂
        </motion.div>
        
        <motion.button
          onClick={() => window.location.href = window.location.origin + window.location.pathname}
          className="bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          🎉 Create Another Wish
        </motion.button>
      </motion.div>
    </div>
  );
};

export default CelebrationScreen;
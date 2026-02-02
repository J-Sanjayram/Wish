import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ColorTheme } from '../utils/colorTheme';

interface AudioPlayerProps {
  song: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
    albumArt?: string;
  };
  wisherName: string;
  theme?: ColorTheme;
  isMarriage?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ song, wisherName, theme, isMarriage = false }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const artistRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [titleOverflows, setTitleOverflows] = useState(false);
  const [artistOverflows, setArtistOverflows] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (titleRef.current) {
        setTitleOverflows(titleRef.current.scrollWidth > titleRef.current.clientWidth);
      }
      if (artistRef.current) {
        setArtistOverflows(artistRef.current.scrollWidth > artistRef.current.clientWidth);
      }
    };
    
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(checkOverflow, 100);
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [song.title, song.artist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      audio.currentTime = song.startTime;
      // Play immediately when audio loads
      audio.play().then(() => {
        setIsPlaying(true);
        // Stop after 30 seconds
        setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, song.duration * 1000);
      }).catch(() => {
        console.log('Autoplay blocked');
      });
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('ended', handleEnded);

    // Also try to play immediately on mount
    setTimeout(() => {
      if (audio.readyState >= 2) {
        audio.currentTime = song.startTime;
        audio.play().then(() => {
          setIsPlaying(true);
          setTimeout(() => {
            audio.pause();
            setIsPlaying(false);
          }, song.duration * 1000);
        }).catch(() => {
          console.log('Autoplay blocked');
        });
      }
    }, 100);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [song]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.currentTime = song.startTime;
      audio.play().then(() => {
        setIsPlaying(true);
        // Stop after 30 seconds
        setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, song.duration * 1000);
      }).catch(console.error);
    }
  };

  return (
    <motion.div
      className="rounded-xl shadow-lg backdrop-blur-sm border"
      style={{
        background: isMarriage && theme ? 
          `linear-gradient(135deg, ${theme.background}, ${theme.backgroundSecondary})` : 
          'rgba(255, 255, 255, 0.2)',
        borderColor: isMarriage && theme ? theme.border : 'rgba(255, 255, 255, 0.3)'
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
    >
      <style>
        {`
          @keyframes marqueeTitle {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          @keyframes marqueeArtist {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-marquee-title {
            animation: marqueeTitle 12s linear infinite;
          }
          .animate-marquee-artist {
            animation: marqueeArtist 15s linear infinite;
          }
          .marquee-container {
            mask: linear-gradient(90deg, white, white);
          }
        `}
      </style>
      <audio ref={audioRef} src={song.previewUrl} />
      
      <div className="flex items-center justify-between p-3">
        <div 
          className="text-left flex-1 overflow-hidden mr-4"
          style={{
            color: isMarriage && theme ? theme.text : 'white'
          }}
        >
          <div className="font-medium text-xs whitespace-nowrap overflow-hidden marquee-container" ref={titleRef}>
            <div className={titleOverflows ? "animate-marquee-title" : ""}>
              {song.title}
            </div>
          </div>
          <div 
            className="text-xs whitespace-nowrap overflow-hidden marquee-container" 
            ref={artistRef}
            style={{
              color: isMarriage && theme ? theme.textSecondary : 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <div className={artistOverflows ? "animate-marquee-artist" : ""}>
              {song.artist}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <motion.button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-300"
            style={{
              background: isMarriage && theme ? 
                `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` : 
                'linear-gradient(135deg, #8b5cf6, #a855f7)'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {!isMarriage && (
              <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`} />
            )}
            {isMarriage && (
              <div className="text-xs font-bold">
                {isPlaying ? '⏸' : '▶'}
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
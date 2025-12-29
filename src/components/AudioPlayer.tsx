import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface AudioPlayerProps {
  song: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  };
  wisherName: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ song, wisherName }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      audio.currentTime = song.startTime;
      // Play immediately when audio loads
      audio.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
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
          setHasStarted(true);
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
        setHasStarted(true);
        // Stop after 30 seconds
        setTimeout(() => {
          audio.pause();
          setIsPlaying(false);
        }, song.duration * 1000);
      }).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      className="fixed top-4 left-4 right-4 mx-auto   rounded-xl pb-4 z-50"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, duration: 0.8 }}
    >
      <audio ref={audioRef} src={song.previewUrl} />
      
      <div className="flex items-center justify-between px-4">
        <div className="flex justify-start w-8">
          <motion.button
            onClick={toggleMute}
            className="w-6 h-6 flex items-center justify-center text-white hover:text-white/70 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-xs`} />
          </motion.button>
        </div>
        
        <div className="text-white text-center flex-1">
          <div className="font-medium text-xs">{wisherName}</div>
          <div className="text-xs text-white/70">Dedicated a song for you</div>
        </div>
        
        <div className="flex justify-end w-8">
          <motion.button
            onClick={togglePlay}
            className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white hover:bg-purple-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-xs`} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
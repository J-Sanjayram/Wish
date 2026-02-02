import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Search, Play, Pause, Check, ArrowLeft, Sparkles, Volume2 } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  duration: number;
  image?: string;
}

interface MusicSelectorProps {
  onSongSelect: (song: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  }) => void;
  selectedSong?: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  };
  onModalStateChange?: (isOpen: boolean) => void;
  context?: 'birthday' | 'wedding';
}

const MusicSelector: React.FC<MusicSelectorProps> = ({ onSongSelect, selectedSong, onModalStateChange, context = 'wedding' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<'search' | 'edit'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState(new Audio());
  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const updateModalState = (open: boolean) => {
    setIsOpen(open);
    onModalStateChange?.(open);
    if (!open) {
      setCurrentStep('search');
      setEditingSong(null);
      setSearchQuery('');
      setSearchResults([]);
      audioRef.pause();
      setIsPlaying(false);
      if (playTimeout) {
        clearTimeout(playTimeout);
        setPlayTimeout(null);
      }
    }
  };

  const cleanText = (text: string): string => {
    return text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_MUSIC_API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=0&limit=50`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.results) {
        const songs = data.data.results.map((song: any) => ({
          id: song.id,
          title: cleanText(song.name),
          artist: cleanText(song.artists.primary.map((a: any) => a.name).join(', ')),
          previewUrl: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[1]?.url || song.downloadUrl?.[0]?.url || '',
          duration: song.duration || 180,
          image: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url
        }));
        
        setSearchResults(songs);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      setSearchResults([
        {
          id: '1',
          title: 'Happy Birthday Song',
          artist: 'Birthday Band',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          duration: 180
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongClick = (song: Song) => {
    setEditingSong(song);
    setStartTime(0);
    setCurrentStep('edit');
    audioRef.pause();
    setIsPlaying(false);
    if (playTimeout) {
      clearTimeout(playTimeout);
      setPlayTimeout(null);
    }
  };

  const goBackToSearch = () => {
    setCurrentStep('search');
    setEditingSong(null);
    audioRef.pause();
    setIsPlaying(false);
    if (playTimeout) {
      clearTimeout(playTimeout);
      setPlayTimeout(null);
    }
  };

  const togglePreview = () => {
    if (!editingSong) return;
    
    if (isPlaying) {
      audioRef.pause();
      setIsPlaying(false);
      if (playTimeout) {
        clearTimeout(playTimeout);
        setPlayTimeout(null);
      }
    } else {
      audioRef.src = editingSong.previewUrl;
      audioRef.currentTime = startTime;
      audioRef.play().then(() => {
        setIsPlaying(true);
        const timeout = setTimeout(() => {
          audioRef.pause();
          setIsPlaying(false);
          setPlayTimeout(null);
        }, 30000);
        setPlayTimeout(timeout);
      }).catch(() => {
        console.log('Audio preview not available');
      });
    }
  };

  const handleStartTimeChange = (newStartTime: number) => {
    setStartTime(newStartTime);
    
    if (isPlaying) {
      audioRef.currentTime = newStartTime;
      
      if (playTimeout) {
        clearTimeout(playTimeout);
      }
      
      const timeout = setTimeout(() => {
        audioRef.pause();
        setIsPlaying(false);
      }, 30000);
      
      setPlayTimeout(timeout);
    }
  };

  const handleConfirmSong = () => {
    if (editingSong) {
      onSongSelect({
        title: editingSong.title,
        artist: editingSong.artist,
        previewUrl: editingSong.previewUrl,
        startTime: startTime,
        duration: 30
      });
      updateModalState(false);
      setEditingSong(null);
      audioRef.pause();
      setIsPlaying(false);
      if (playTimeout) {
        clearTimeout(playTimeout);
        setPlayTimeout(null);
      }
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => updateModalState(true)}
        className={`group relative overflow-hidden w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-500 ${
          selectedSong 
            ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white shadow-xl shadow-emerald-500/25' 
            : 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 hover:from-rose-600 hover:via-pink-600 hover:to-purple-600 text-white shadow-xl shadow-rose-500/25'
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center gap-2 sm:gap-3">
          <div className={`p-2 sm:p-3 rounded-xl backdrop-blur-sm flex-shrink-0 ${
            selectedSong ? 'bg-white/20' : 'bg-white/20'
          }`}>
            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm sm:text-base font-bold mb-1 truncate">
              {selectedSong ? 'Song Selected' : context === 'birthday' ? 'Choose Song' : 'Choose Wedding Song'}
            </div>
            {selectedSong ? (
              <div className="text-xs sm:text-sm opacity-90 truncate">
                {selectedSong.title} - {selectedSong.artist}
              </div>
            ) : (
              <div className="text-xs sm:text-sm opacity-80 truncate">
                {context === 'birthday' ? 'Add background music' : 'Add wedding soundtrack'}
              </div>
            )}
          </div>
          <Sparkles className="w-4 h-4 flex-shrink-0 opacity-80" />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[999999] p-3 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                updateModalState(false);
              }
            }}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[85vh] sm:max-h-[90vh] flex flex-col relative border border-white/20"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  {currentStep === 'edit' && (
                    <motion.button
                      onClick={goBackToSearch}
                      className="p-2 hover:bg-gray-100/80 rounded-xl transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </motion.button>
                  )}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">
                      {currentStep === 'search' ? '🎵 Discover Your Song' : '✨ Perfect Your Choice'}
                    </h2>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1">
                      {currentStep === 'search' 
                        ? 'Search and select the perfect song for your special day' 
                        : 'Choose the perfect 30-second moment'
                      }
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => updateModalState(false)}
                  className="p-2 hover:bg-gray-100/80 rounded-xl transition-colors ml-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <AnimatePresence>
                  {currentStep === 'search' ? (
                    <SearchStep 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      searchResults={searchResults}
                      isLoading={isLoading}
                      onSearch={searchSongs}
                      onSongSelect={handleSongClick}
                    />
                  ) : (
                    <EditStep 
                      song={editingSong!}
                      startTime={startTime}
                      setStartTime={handleStartTimeChange}
                      isPlaying={isPlaying}
                      onTogglePreview={togglePreview}
                      onConfirm={handleConfirmSong}
                      onBack={goBackToSearch}
                    />
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Search Step Component
const SearchStep: React.FC<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Song[];
  isLoading: boolean;
  onSearch: (query: string) => void;
  onSongSelect: (song: Song) => void;
}> = ({ searchQuery, setSearchQuery, searchResults, isLoading, onSearch, onSongSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search for your perfect wedding song..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch(searchQuery)}
          className="w-full pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 text-sm sm:text-base bg-white/80 backdrop-blur-sm"
        />
      </div>
      
      <motion.button
        onClick={() => onSearch(searchQuery)}
        disabled={isLoading || !searchQuery.trim()}
        className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white py-3 sm:py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-xl disabled:shadow-none"
        whileHover={!isLoading ? { scale: 1.02 } : {}}
        whileTap={!isLoading ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Searching...
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Search Songs
          </>
        )}
      </motion.button>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3 max-h-[50vh] overflow-y-auto relative z-[100000]">
          <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-rose-500" />
            Choose from {searchResults.length} results:
          </h3>
          {searchResults.map((song, index) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSongSelect(song)}
              className="group p-4 border-2 border-gray-100 hover:border-rose-300 rounded-2xl cursor-pointer hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition-all duration-300 flex items-center gap-4"
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="relative flex-shrink-0">
                {song.image ? (
                  <img 
                    src={song.image} 
                    alt={song.title}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Music className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 truncate text-base leading-tight">{song.title}</h4>
                <p className="text-gray-600 truncate text-xs mt-1">{song.artist}</p>
                <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                  <Volume2 className="w-4 h-4" />
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="text-rose-400 group-hover:text-rose-600 transition-colors">
                <Play className="w-8 h-8" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Edit Step Component
const EditStep: React.FC<{
  song: Song;
  startTime: number;
  setStartTime: (time: number) => void;
  isPlaying: boolean;
  onTogglePreview: () => void;
  onConfirm: () => void;
  onBack: () => void;
}> = ({ song, startTime, setStartTime, isPlaying, onTogglePreview, onConfirm, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Song Info */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-rose-50 via-pink-50 to-purple-50 rounded-2xl border-2 border-rose-100">
        <div className="relative flex-shrink-0">
          {song.image ? (
            <img 
              src={song.image} 
              alt={song.title}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-rose-400 to-pink-400 rounded-2xl flex items-center justify-center shadow-xl">
              <Music className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 truncate">{song.title}</h3>
          <p className="text-gray-600 text-sm sm:text-base truncate">{song.artist}</p>
          <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
            <Volume2 className="w-4 h-4" />
            Duration: {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
          </p>
        </div>
        <motion.button
          onClick={onTogglePreview}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1" />}
        </motion.button>
      </div>

      {/* Timeline Selector */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 rounded-3xl shadow-2xl">
        <div className="text-center mb-6">
          <h4 className="text-white text-xl font-bold mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            Select Your Perfect 30-Second Moment
          </h4>
          <p className="text-gray-300">Drag to find the most magical part of your song</p>
        </div>
        
        <div className="space-y-6">
          {/* Visual Timeline */}
          <div className="relative">
            <div className="relative h-12 bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 rounded-2xl overflow-hidden shadow-inner">
              {/* Time markers */}
              {Array.from({ length: Math.floor(song.duration / 30) }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-0.5 bg-white/50"
                  style={{ left: `${(i * 30 / song.duration) * 100}%` }}
                />
              ))}
              
              {/* Selected segment */}
              <div 
                className="absolute top-1 bottom-1 bg-white/40 border-2 border-white rounded-xl backdrop-blur-sm shadow-lg"
                style={{
                  left: `${(startTime / song.duration) * 100}%`,
                  width: `${(30 / song.duration) * 100}%`
                }}
              />
              
              {/* Drag handle */}
              <div 
                className="absolute top-0 bottom-0 w-6 bg-white rounded-full shadow-xl border-4 border-gray-800 transition-all duration-200 flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{
                  left: `calc(${(startTime / song.duration) * 100}% - 12px)`
                }}
              >
                <div className="w-2 h-2 bg-gray-800 rounded-full" />
              </div>
              
              <input
                type="range"
                min="0"
                max={Math.max(0, song.duration - 30)}
                value={startTime}
                onChange={(e) => setStartTime(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            
            {/* Time labels */}
            <div className="flex justify-between text-sm text-gray-300 mt-4">
              <span>0:00</span>
              <span className="text-white font-bold text-center flex-1 px-4">
                Selected: {Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, '0')} - {Math.floor((startTime + 30) / 60)}:{((startTime + 30) % 60).toString().padStart(2, '0')}
              </span>
              <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={onBack}
          className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 font-bold text-base transition-all duration-300 flex items-center justify-center gap-3"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </motion.button>
        <motion.button
          type="button"
          onClick={onConfirm}
          className="flex-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Check className="w-5 h-5" />
          Perfect! Use This Song
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MusicSelector;
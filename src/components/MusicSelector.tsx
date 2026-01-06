import React, { useState } from 'react';
import { motion } from 'framer-motion';

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
}

const MusicSelector: React.FC<MusicSelectorProps> = ({ onSongSelect, selectedSong }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [startTime, setStartTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioRef] = useState(new Audio());

  const [playTimeout, setPlayTimeout] = useState<NodeJS.Timeout | null>(null);

  const cleanText = (text: string): string => {
    return text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Use direct API call for now since Netlify function isn't deployed
      const response = await fetch(`${process.env.REACT_APP_MUSIC_API_BASE_URL}/search/songs?query=${encodeURIComponent(query)}&page=0&limit=50`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      console.log('Full API response:', data);
      
      if (data.success && data.data.results) {
        console.log('API returned', data.data.results.length, 'songs');
        // Process songs with new structure
        const songs = data.data.results.map((song: any) => ({
          id: song.id,
          title: cleanText(song.name),
          artist: cleanText(song.artists.primary.map((a: any) => a.name).join(', ')),
          previewUrl: song.downloadUrl?.[4]?.url || song.downloadUrl?.[3]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[1]?.url || song.downloadUrl?.[0]?.url || '',
          duration: song.duration || 180,
          image: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url
        }));
        
        console.log('Processed', songs.length, 'songs');
        setSearchResults(songs);
      }
    } catch (error) {
      console.error('Error searching songs:', error);
      // Fallback to mock data if API fails
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
    audioRef.pause();
    setIsPlaying(false);
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
        // Stop after 30 seconds
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
    
    // If audio is playing, restart from new position
    if (isPlaying) {
      audioRef.currentTime = newStartTime;
      
      // Clear existing timeout and set new one
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
      setIsOpen(false);
      setEditingSong(null);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <i className="fas fa-music" />
        <span>{selectedSong ? selectedSong.title : 'Add Music'}</span>
      </motion.button>

      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {!editingSong ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Add Music</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-times" />
                  </button>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search for a song..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSongs(searchQuery)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => searchSongs(searchQuery)}
                    className="mt-2 w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {searchResults.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => handleSongClick(song)}
                      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center space-x-3"
                    >
                      {song.image && (
                        <img 
                          src={song.image} 
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 truncate">{song.title}</div>
                        <div className="text-sm text-gray-600 truncate">{song.artist}</div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400" />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Edit Song</h3>
                  <button
                    onClick={() => setEditingSong(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="fas fa-arrow-left" />
                  </button>
                </div>

                <div className="mb-4 flex items-center space-x-3">
                  {editingSong.image && (
                    <img 
                      src={editingSong.image} 
                      alt={editingSong.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{editingSong.title}</div>
                    <div className="text-sm text-gray-600">{editingSong.artist}</div>
                  </div>
                  <button
                    onClick={togglePreview}
                    className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors"
                  >
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`} />
                  </button>
                </div>

                <div className="mb-6 bg-gray-900 p-6 rounded-2xl">
                  <label className="block text-sm font-medium text-white mb-4 text-center">
                    Select 30-second clip
                  </label>
                  
                  <div className="flex items-center justify-center gap-6">
                    {/* Progress Bar Container */}
                    <div className="relative flex-1 max-w-md">
                      {/* Main progress bar with gradient */}
                      <div className="relative h-8 bg-gradient-to-r from-orange-400 to-purple-500 rounded-lg overflow-hidden">
                        {/* Segment markers */}
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 w-0.5 bg-white opacity-60"
                            style={{ left: `${(i + 1) * 10}%` }}
                          />
                        ))}
                        
                        {/* Selected 30-second segment overlay */}
                        <div 
                          className="absolute top-0 bottom-0 bg-white/20 border-2 border-white rounded"
                          style={{
                            left: `${(startTime / editingSong.duration) * 100}%`,
                            width: `${(30 / editingSong.duration) * 100}%`
                          }}
                        />
                        
                        {/* Circular progress indicator */}
                        <div 
                          className="absolute -top-1 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-800 transition-all duration-150"
                          style={{
                            left: `calc(${(startTime / editingSong.duration) * 100}% - 8px)`
                          }}
                        />
                        
                        {/* Hidden range input */}
                        <input
                          type="range"
                          min="0"
                          max={Math.max(0, editingSong.duration - 30)}
                          value={startTime}
                          onChange={(e) => handleStartTimeChange(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      
                      {/* Time labels */}
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>0:00</span>
                        <span>{Math.floor(editingSong.duration / 60)}:{(editingSong.duration % 60).toString().padStart(2, '0')}</span>
                      </div>
                    </div>
                    
                    
                  </div>
                  
                  {/* Selected time range */}
                  <div className="text-center mt-4">
                    <span className="text-sm text-orange-400 font-medium">
                      Selected: {Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, '0')} - {Math.floor((startTime + 30) / 60)}:{((startTime + 30) % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingSong(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSong}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default MusicSelector;
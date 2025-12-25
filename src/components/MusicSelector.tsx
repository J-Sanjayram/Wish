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

  const cleanText = (text: string): string => {
    return text.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  };

  const searchSongs = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      // Use direct API call for now since Netlify function isn't deployed
      const response = await fetch(`${process.env.REACT_APP_MUSIC_API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      if (data.success && data.data.songs.results) {
        // Get song details with download URLs
        const songPromises = data.data.songs.results.slice(0, 5).map(async (song: any) => {
          try {
            const detailResponse = await fetch(`${process.env.REACT_APP_MUSIC_API_BASE_URL}/songs/${song.id}`);
            const detailData = await detailResponse.json();
            return {
              id: song.id,
              title: cleanText(song.title),
              artist: cleanText(song.primaryArtists || song.singers),
              previewUrl: detailData.data[0]?.downloadUrl?.[4]?.url || detailData.data[0]?.downloadUrl?.[3]?.url || detailData.data[0]?.downloadUrl?.[2]?.url || detailData.data[0]?.downloadUrl?.[1]?.url || detailData.data[0]?.downloadUrl?.[0]?.url || '',
              duration: 180,
              image: song.image[2]?.url || song.image[1]?.url || song.image[0]?.url
            };
          } catch {
            return {
              id: song.id,
              title: cleanText(song.title),
              artist: cleanText(song.primaryArtists || song.singers),
              previewUrl: '',
              duration: 180,
              image: song.image[2]?.url || song.image[1]?.url || song.image[0]?.url
            };
          }
        });
        
        const songs = await Promise.all(songPromises);
        setSearchResults(songs.filter(song => song.previewUrl));
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
    } else {
      audioRef.src = editingSong.previewUrl;
      audioRef.currentTime = startTime;
      audioRef.play().then(() => {
        setIsPlaying(true);
        // Stop after 30 seconds
        setTimeout(() => {
          audioRef.pause();
          setIsPlaying(false);
        }, 30000);
      }).catch(() => {
        console.log('Audio preview not available');
      });
    }
  };

  const handleStartTimeChange = (newStartTime: number) => {
    setStartTime(newStartTime);
    if (isPlaying) {
      audioRef.currentTime = newStartTime;
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto"
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

                <div className="space-y-2">
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time (seconds)
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, editingSong.duration - 30)}
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(startTime / Math.max(1, editingSong.duration - 30)) * 100}%, #e5e7eb ${(startTime / Math.max(1, editingSong.duration - 30)) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                    <div 
                      className="absolute top-0 w-1 h-2 bg-purple-600 rounded-full pointer-events-none"
                      style={{
                        left: `${(startTime / Math.max(1, editingSong.duration - 30)) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mt-1">
                    <span>{Math.floor(startTime / 60)}:{(startTime % 60).toString().padStart(2, '0')}</span>
                    <span>30 second clip</span>
                    <span>{Math.floor((startTime + 30) / 60)}:{((startTime + 30) % 60).toString().padStart(2, '0')}</span>
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
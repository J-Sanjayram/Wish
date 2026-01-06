import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

interface ImageManagerProps {
  onNavigate: (page: string) => void;
}

const ImageManager: React.FC<ImageManagerProps> = ({ onNavigate }) => {
  const [fileId, setFileId] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const searchImages = async () => {
    if (!fileId.trim()) return;
    
    setLoading(true);
    try {
      // Extract wish ID from URL if full URL is provided
      let wishId = fileId;
      if (fileId.includes('?wish=')) {
        wishId = fileId.split('?wish=')[1];
      }
      
      // Search by wish ID
      const { data: wish, error: wishError } = await supabase
        .from('wishes')
        .select('id, imageUrl, journeyImages')
        .eq('id', wishId)
        .single();
        
      console.log('Found wish:', wish);
      if (wishError || !wish) {
        setImages([]);
        alert('No wish found with this ID');
        return;
      }
      
      // Check if images exist
      if (!wish.imageUrl && (!wish.journeyImages || wish.journeyImages.length === 0)) {
        setImages([]);
        alert('No images found for this wish');
        return;
      }
      
      // Collect all image URLs
      const imageUrls = [];
      if (wish.imageUrl) imageUrls.push(wish.imageUrl);
      if (wish.journeyImages) imageUrls.push(...wish.journeyImages);
      
      // Convert URLs to image objects
      const imageList = imageUrls.map((url, index) => {
        const fileName = url.split('/').pop() || '';
        return {
          name: fileName,
          id: wishId,
          url: url,
          wishId: wish.id
        };
      });
      
      setImages(imageList);
    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllImages = async () => {
    if (images.length === 0) return;
    
    setDeleting('all');
    try {
      // Extract file names from URLs
      const fileNames = images.map(img => img.name);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('wishes')
        .remove(fileNames);
        
      if (storageError) throw storageError;
      
      // Update wish record to remove image URLs using wish ID
      const { error: dbError } = await supabase
        .from('wishes')
        .update({ imageUrl: null, journeyImages: [] })
        .eq('id', images[0]?.wishId);
        
      console.log('Database update error:', dbError);
      if (dbError) {
        console.error('Database update failed:', dbError);
        // Continue anyway - at least delete from storage
      }
      
      setImages([]);
      alert('All images deleted successfully!');
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete images');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 mx-2 sm:mx-0"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">Image Manager</h2>
        <p className="text-sm sm:text-base text-gray-600">Paste the wish sharing link to manage images</p>
      </div>

        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              placeholder="Enter wish URL or ID (e.g., https://yoursite.com?wish=abc123)"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={searchImages}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Found {images.length} Images:</h3>
              <button
                onClick={deleteAllImages}
                disabled={deleting === 'all'}
                className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold disabled:opacity-50 text-sm sm:text-base"
              >
                {deleting === 'all' ? 'Deleting All...' : 'Delete All Images'}
              </button>
            </div>
            {images.map((image, index) => (
              <motion.div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <img 
                    src={image.url} 
                    alt="Uploaded" 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">{image.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Master ID: {image.id}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      <div className="mt-6 sm:mt-8 text-center">
        <button
          onClick={() => onNavigate('home')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base"
        >
          Back to Home
        </button>
      </div>
    </motion.div>
  );
};

export default ImageManager;
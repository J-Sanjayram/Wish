import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WishFormProps {
  onSubmit: (formData: {
    fromName: string;
    toName: string;
    message: string;
    image: File | null;
  }) => void;
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    fromName: '',
    toName: '',
    message: '',
    image: null as File | null
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select an image under 5MB');
    }
  };

  const handleSubmit = () => {
    if (!formData.fromName || !formData.toName || !formData.message) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <motion.div 
      className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 mb-4 sm:mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-4 sm:mb-6">
        <motion.div 
          className="text-2xl sm:text-3xl mb-2"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          🎁
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Create Your Wish</h2>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">From (Your Name)</label>
          <div className="relative group">
            <motion.i 
              className="fas fa-user absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-sm sm:text-base"
              whileHover={{ scale: 1.2 }}
            />
            <input
              type="text"
              placeholder="Enter your name"
              value={formData.fromName}
              onChange={handleInputChange('fromName')}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-purple-200 rounded-xl sm:rounded-2xl focus:border-purple-500 focus:outline-none transition-all duration-300 text-sm sm:text-base bg-purple-50/50 focus:shadow-lg"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">To (Birthday Person)</label>
          <div className="relative group">
            <motion.i 
              className="fas fa-birthday-cake absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-pink-500 text-sm sm:text-base"
              whileHover={{ scale: 1.2 }}
            />
            <input
              type="text"
              placeholder="Birthday person's name"
              value={formData.toName}
              onChange={handleInputChange('toName')}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-pink-200 rounded-xl sm:rounded-2xl focus:border-pink-500 focus:outline-none transition-all duration-300 text-sm sm:text-base bg-pink-50/50 focus:shadow-lg"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Photo (Optional)</label>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="image-upload"
            onChange={handleImageUpload}
          />
          <motion.label
            htmlFor="image-upload"
            className="block border-2 border-dashed border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 bg-blue-50/30 hover:bg-blue-50/50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {!imagePreview ? (
              <div>
                <motion.i 
                  className="fas fa-camera text-2xl sm:text-3xl text-blue-500 mb-2"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-blue-600 font-medium text-sm sm:text-base">Click to add photo</p>
                <span className="text-xs sm:text-sm text-gray-500">JPG, PNG up to 5MB</span>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img src={imagePreview} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto object-cover shadow-2xl shadow-purple-500/50 hover:shadow-pink-500/70 transition-all duration-300" alt="Preview" />
                <p className="text-blue-600 font-medium mt-2 text-sm sm:text-base">Click to change</p>
              </motion.div>
            )}
          </motion.label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Birthday Message</label>
          <div className="relative group">
            <motion.i 
              className="fas fa-heart absolute left-3 sm:left-4 top-3 sm:top-4 text-red-500 text-sm sm:text-base"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <textarea
              placeholder="Write your heartfelt birthday message..."
              value={formData.message}
              onChange={handleInputChange('message')}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-red-200 rounded-xl sm:rounded-2xl focus:border-red-500 focus:outline-none transition-all duration-300 text-sm sm:text-base bg-red-50/50 h-24 sm:h-32 resize-none focus:shadow-lg"
            />
          </div>
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.i 
            className="fas fa-paper-plane mr-2"
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Create & Share Wish 🎉
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WishForm;
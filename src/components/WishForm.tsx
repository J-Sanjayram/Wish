import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Cake, MessageSquare } from 'lucide-react';
import { useFormValidation } from '../hooks/useFormValidation';
import { TextInput, TextArea } from './ui/FormInputs';
import { FileUpload } from './ui/FileUpload';
import { ProfilePictureUpload } from './ProfilePictureUpload';
import MusicSelector from './MusicSelector';

interface WishFormProps {
  onSubmit: (formData: {
    fromName: string;
    toName: string;
    message: string;
    image: string | null;
    journeyImages: File[];
    song?: {
      title: string;
      artist: string;
      previewUrl: string;
      startTime: number;
      duration: number;
    };
  }) => void;
  isSubmitting: boolean;
}

interface FormData {
  fromName: string;
  toName: string;
  message: string;
  image: string | null;
  journeyImages: File[];
  song?: {
    title: string;
    artist: string;
    previewUrl: string;
    startTime: number;
    duration: number;
  };
}

const WishForm: React.FC<WishFormProps> = ({ onSubmit, isSubmitting }) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [journeyImages, setJourneyImages] = useState<File[]>([]);
  const [selectedSong, setSelectedSong] = useState<FormData['song']>();

  const { values, errors, isValid, setValue, validateAll } = useFormValidation<Omit<FormData, 'image' | 'journeyImages' | 'song'>>({
    fromName: '',
    toName: '',
    message: ''
  }, {
    fromName: { required: true, minLength: 2, maxLength: 50 },
    toName: { required: true, minLength: 2, maxLength: 50 },
    message: { required: true, minLength: 10, maxLength: 500 }
  });

  const handleSubmit = () => {
    if (!validateAll()) {
      return;
    }

    onSubmit({
      ...values,
      image: profileImage,
      journeyImages,
      song: selectedSong
    });
  };

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center mb-6">
        {/* <motion.div 
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Cake className="w-8 h-8 text-white" />
        </motion.div> */}
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Wish</h2>
        <p className="text-white/80 text-sm">Make someone's birthday magical with a personalized message</p>
      </div>
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <TextInput
            label="From (Your Name)"
            placeholder="Enter your name"
            value={values.fromName}
            onChange={(value) => setValue('fromName', value)}
            error={errors.fromName}
            required
            icon={<User className="w-4 h-4" />}
            maxLength={50}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TextInput
            label="To (Birthday Person)"
            placeholder="Birthday person's name"
            value={values.toName}
            onChange={(value) => setValue('toName', value)}
            error={errors.toName}
            required
            icon={<Cake className="w-4 h-4" />}
            maxLength={50}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ProfilePictureUpload
            userType="birthday"
            onImageProcessed={setProfileImage}
            className="mb-4"
          />
          
          {/* Privacy Notice */}
          <motion.div 
            className="mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-2">
              <span className="text-blue-300 text-sm mt-0.5">🔒</span>
              <div className="text-xs text-blue-200 leading-relaxed">
                <p className="font-medium mb-1">Your Privacy Matters</p>
                <p>• We don't store, use, or collect your uploaded images</p>
                <p>• You can delete your images anytime using the sharing link</p>
                <p>• All wishes are automatically deleted after 24 hours</p>
                <p className="mt-1 text-blue-300 font-medium">Feel free to upload - your privacy is protected!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <FileUpload
            label="Journey Images (Optional)"
            hint="Add up to 5 images showing your journey together (recommended: landscape 16:9 ratio)"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            maxSize={5}
            maxFiles={5}
            multiple
            files={journeyImages}
            onFilesChange={setJourneyImages}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45 }}
        >
          <label className="block text-sm font-semibold text-white/90 mb-2">Background Music (Optional)</label>
          <MusicSelector
            onSongSelect={setSelectedSong}
            selectedSong={selectedSong}
            context="birthday"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <TextArea
            label="Birthday Message"
            placeholder="Write your heartfelt birthday message..."
            value={values.message}
            onChange={(value) => setValue('message', value)}
            error={errors.message}
            required
            rows={4}
            maxLength={500}
            hint="Share your wishes, memories, or what makes this person special"
          />
        </motion.div>

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting || !isValid}
          className={`w-full ${isSubmitting || !isValid ? 'bg-gray-500/50 cursor-not-allowed' : 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 shadow-xl hover:shadow-purple-500/40'} text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 backdrop-blur-md border border-white/10 relative overflow-hidden group`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={!isSubmitting && isValid ? { scale: 1.02, translateY: -2 } : {}}
          whileTap={!isSubmitting && isValid ? { scale: 0.98, translateY: 0 } : {}}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out skew-y-12" />
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Magic...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">✨</span>
              Create & Share Wish
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default WishForm;

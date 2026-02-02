import React, { useEffect } from 'react';
import { deleteMarriageImage } from '../supabase';

const DeleteMarriageHandler: React.FC = () => {
  useEffect(() => {
    const deleteId = window.location.pathname.match(/\/delete-marriage\/(.+)$/)?.[1];
    if (deleteId) {
      const handleDelete = async () => {
        try {
          const success = await deleteMarriageImage(deleteId);
          alert(success ? 'Image deleted successfully!' : 'Image not found or already deleted.');
        } catch (error) {
          alert('Failed to delete image.');
        }
        window.location.href = '/';
      };
      handleDelete();
    }
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
        <p className="text-xl font-semibold">Deleting marriage invitation...</p>
      </div>
    </div>
  );
};

export default DeleteMarriageHandler;
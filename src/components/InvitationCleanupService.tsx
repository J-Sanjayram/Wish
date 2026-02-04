import { useEffect } from 'react';
import { checkAndDeleteExpiredInvitations } from '../supabase';

const InvitationCleanupService: React.FC = () => {
  useEffect(() => {
    // Run cleanup immediately
    checkAndDeleteExpiredInvitations();
    
    // Set up interval to run cleanup every 6 hours
    const cleanupInterval = setInterval(() => {
      checkAndDeleteExpiredInvitations();
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return null; // This component doesn't render anything
};

export default InvitationCleanupService;
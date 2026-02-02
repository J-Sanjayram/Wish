import React from 'react';
import Navigation from './Navigation';
import MarriageInvitationFormNew from './MarriageInvitationFormNew';
import { useNavigate } from 'react-router-dom';

const MarriageInvitationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'birthday-wishes':
        navigate('/tools/birthday-wishes');
        break;
      case 'marriage-invitation':
        navigate('/tools/marriage-invitation');
        break;
      case 'remove-background':
        navigate('/tools/remove-background');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation onNavigate={handleNavigate} currentPage="marriage-invitation" />
      <MarriageInvitationFormNew />
    </div>
  );
};

export default MarriageInvitationPage;
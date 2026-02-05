import React from 'react';
import Navigation from './Navigation';
import RemoveBackground from './RemoveBackground';

const RemoveBackgroundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Navigation onNavigate={() => {}} currentPage="remove-background" />
      <RemoveBackground />
    </div>
  );
};

export default RemoveBackgroundPage;
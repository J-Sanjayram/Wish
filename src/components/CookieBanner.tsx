import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      setTimeout(() => setIsVisible(true), 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm text-white p-4 z-50 transform transition-transform duration-300">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
        <div className="flex-1">
          <p className="text-sm">
            🍪 We use cookies to enhance your experience and analyze our traffic. 
            By continuing to use this site, you consent to our use of cookies.
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={acceptCookies}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
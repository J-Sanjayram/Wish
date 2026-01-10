import React, { useEffect } from 'react';

const AdsterraSocialBanner: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://pl28444507.effectivegatecpm.com/ea/2a/98/ea2a98fcee971005a92bac85df049c55.js';
    
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return <div className="my-4 flex justify-center w-full"></div>;
};

export default AdsterraSocialBanner;
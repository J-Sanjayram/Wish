import React, { useEffect } from 'react';

const AdsterraDisplayBanner: React.FC = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.innerHTML = `
      atOptions = {
        'key' : '7a7a9fff6de4fbca15af1c05a801a213',
        'format' : 'iframe',
        'height' : 60,
        'width' : 468,
        'params' : {}
      };
    `;
    
    const script2 = document.createElement('script');
    script2.src = 'https://www.highperformanceformat.com/7a7a9fff6de4fbca15af1c05a801a213/invoke.js';
    
    document.head.appendChild(script1);
    document.head.appendChild(script2);
    
    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  return <div className="my-4 flex justify-center w-full max-w-lg mx-auto"></div>;
};

export default AdsterraDisplayBanner;
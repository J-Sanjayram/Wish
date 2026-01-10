import React, { useEffect } from 'react';

const AdsterraBanner: React.FC = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl28444255.effectivegatecpm.com/987c5f9597c3c3dfec69ef3694462e23/invoke.js';
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="my-4 flex justify-center">
      <div id="container-987c5f9597c3c3dfec69ef3694462e23"></div>
    </div>
  );
};

export default AdsterraBanner;
import React from 'react';

const UnfoldlyLogo: React.FC<{ size?: number; className?: string }> = ({ size = 32, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="unfoldlyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill="url(#unfoldlyGradient)" />
      <path 
        d="M25 25 L25 55 Q25 75 45 75 Q65 75 65 55 L65 25" 
        stroke="white" 
        strokeWidth="8" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
  );
};

export default UnfoldlyLogo;
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Waves at the bottom */}
      <path 
        d="M20 85C30 80 40 85 50 85C60 85 70 80 80 85" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        opacity="0.4"
      />
      <path 
        d="M25 90C35 85 45 90 55 90C65 90 75 85 85 90" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.2"
      />

      {/* Anchor Body */}
      <path 
        d="M50 25V70M50 70C35 70 25 55 25 45M50 70C65 70 75 55 75 45" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeJoin="round"
      />
      
      {/* Anchor Crossbar */}
      <path 
        d="M35 40H65" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round"
      />

      {/* Anchor Ring */}
      <circle 
        cx="50" 
        cy="20" 
        r="8" 
        stroke="currentColor" 
        strokeWidth="6"
      />

      {/* Leaves at the top */}
      <path 
        d="M45 10C42 5 48 2 50 5C52 2 58 5 55 10" 
        fill="#4ADE80" 
        opacity="0.8"
      />

      {/* Sparkles */}
      <circle cx="20" cy="25" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="85" cy="35" r="1.5" fill="currentColor" opacity="0.4" />
      <circle cx="75" cy="15" r="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
};

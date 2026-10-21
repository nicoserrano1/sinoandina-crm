'use client';

import React from 'react';

interface ColmenaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function ColmenaLogo({ 
  className = '', 
  size = 'md',
  showText = false 
}: ColmenaLogoProps) {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex items-center justify-center flex-shrink-0`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/25 rounded-xl blur-md" />
        
        {/* Logo SVG Icon */}
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_10px_rgba(245,158,11,0.45)]"
        >
          <defs>
            <linearGradient id="colmena-grad-top" x1="7" y1="5" x2="33" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="colmena-grad-left" x1="7" y1="14" x2="20" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="colmena-grad-right" x1="21" y1="14" x2="33" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="1" stopColor="#92400E" />
            </linearGradient>
            <radialGradient id="colmena-core-glow" cx="20" cy="20" r="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" stopOpacity="0.5" />
              <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Core Glow */}
          <circle cx="20" cy="20" r="15" fill="url(#colmena-core-glow)" />

          {/* Top Isometric Facet */}
          <path 
            d="M 20 5 L 32.5 12.2 L 20 19.5 L 7.5 12.2 Z" 
            fill="url(#colmena-grad-top)" 
            stroke="#FFFBEB"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />

          {/* Bottom Left Facet */}
          <path 
            d="M 7.5 14.5 L 19 21.2 L 19 34.8 L 7.5 28.2 Z" 
            fill="url(#colmena-grad-left)" 
            stroke="#FEF3C7"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />

          {/* Bottom Right Facet */}
          <path 
            d="M 21 21.2 L 32.5 14.5 L 32.5 28.2 L 21 34.8 Z" 
            fill="url(#colmena-grad-right)" 
            stroke="#FDE68A"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />

          {/* Center Precision Node */}
          <circle cx="20" cy="20" r="1.6" fill="#FFFBEB" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm tracking-tight leading-none truncate">
              Colmena
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shadow-[0_0_6px_#f59e0b]" />
          </div>
          <span className="text-[10px] text-amber-400/90 font-medium tracking-wider uppercase mt-1 truncate">
            CRM & Ventas B2B
          </span>
        </div>
      )}
    </div>
  );
}

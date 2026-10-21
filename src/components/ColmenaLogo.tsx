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
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} flex items-center justify-center flex-shrink-0`}>
        {/* Isotipo 100% Plano Minimalista (Flat Vector Scout Bee) */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10"
        >
          {/* Ala Superior (Blanco Puro Stark White) */}
          <path 
            d="M 15 30 L 48 40 L 29 49 L 14 49 Z" 
            fill="#FFFFFF" 
          />

          {/* Ala Inferior (Blanco Puro Stark White) */}
          <path 
            d="M 14 51 L 32 51 L 19 63 L 14 63 Z" 
            fill="#FFFFFF" 
          />

          {/* Antenas de Radar (Ámbar Eléctrico) */}
          <path 
            d="M 70 34 L 75 30 L 80 30" 
            stroke="#FFB800" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M 73 39 L 79 36 L 83 37" 
            stroke="#FFB800" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Cabeza Geométrica (Ámbar Eléctrico) */}
          <path 
            d="M 64 36 L 73 39 L 76 49 L 68 49 L 63 43 Z" 
            fill="#FFB800" 
          />

          {/* Tórax Central (Ámbar Eléctrico) */}
          <path 
            d="M 52 42 L 67 43 L 67 56 L 56 61 L 52 53 Z" 
            fill="#FFB800" 
          />

          {/* Pata Estilizada / Vector de Apoyo */}
          <path 
            d="M 60 58 L 65 64 L 61 68" 
            stroke="#FFB800" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Abdomen - Franja 1 */}
          <path 
            d="M 49 52 L 54 60 L 46 68 L 41 60 Z" 
            fill="#FFB800" 
          />

          {/* Abdomen - Franja 2 */}
          <path 
            d="M 39 62 L 44 70 L 36 78 L 31 70 Z" 
            fill="#FFB800" 
          />

          {/* Abdomen - Aguijón Terminal de Cierre */}
          <path 
            d="M 30 72 L 34 80 L 22 83 Z" 
            fill="#FFB800" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-black text-white text-base tracking-wider uppercase leading-none truncate">
              Colmena
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB800] inline-block" />
          </div>
          <span className="text-[9px] text-[#FFB800] font-bold tracking-widest uppercase mt-1 truncate">
            Commercial Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

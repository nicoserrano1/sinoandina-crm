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
        {/* Glow cálido ambiental */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md" />
        
        {/* Isotipo: Abeja Exploradora Geométrica (Scout Bee) */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-[0_2px_12px_rgba(245,158,11,0.45)]"
        >
          <defs>
            {/* Gradientes dorados y ámbar de alta definición */}
            <linearGradient id="scout-gold-light" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>

            <linearGradient id="scout-gold-dark" x1="40" y1="30" x2="80" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="1" stopColor="#78350F" />
            </linearGradient>

            <linearGradient id="wing-primary" x1="15" y1="20" x2="65" y2="50" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="0.6" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="wing-secondary" x1="25" y1="35" x2="60" y2="55" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#92400E" />
            </linearGradient>
          </defs>

          {/* Ala Superior Principal (Facetada Aerodinámica) */}
          <path 
            d="M 58 43 L 15 25 L 35 48 L 56 47 Z" 
            fill="url(#wing-primary)" 
            stroke="#FFFBEB" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Ala Secundaria (Sombra y Profundidad) */}
          <path 
            d="M 55 49 L 23 45 L 42 60 L 53 53 Z" 
            fill="url(#wing-secondary)" 
            stroke="#FEF3C7" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Cabeza & Antenas de Radar */}
          <path 
            d="M 72 38 L 84 41 L 79 50 L 69 44 Z" 
            fill="url(#scout-gold-light)" 
            stroke="#FFFBEB" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />
          {/* Antena estilizada */}
          <path 
            d="M 80 40 L 89 36 L 93 39" 
            stroke="#FDE68A" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Tórax Central Facetado */}
          <path 
            d="M 57 44 L 69 44 L 66 58 L 55 56 Z" 
            fill="url(#scout-gold-light)" 
            stroke="#FEF3C7" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Pata / Gancho de Precisión */}
          <path 
            d="M 64 56 L 68 64 L 62 67" 
            stroke="#F59E0B" 
            strokeWidth="1.6" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Abdomen Segmentado - Franja 1 */}
          <path 
            d="M 55 57 L 50 51 L 44 60 L 50 67 Z" 
            fill="url(#scout-gold-light)" 
            stroke="#FEF3C7" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Abdomen Segmentado - Franja 2 */}
          <path 
            d="M 48 65 L 43 59 L 37 68 L 42 75 Z" 
            fill="url(#scout-gold-dark)" 
            stroke="#FDE68A" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />

          {/* Abdomen Segmentado - Franja 3 / Aguijón de Cierre */}
          <path 
            d="M 41 74 L 36 68 L 30 75 L 34 83 C 35 84, 38 82, 41 74 Z" 
            fill="url(#scout-gold-light)" 
            stroke="#FFFBEB" 
            strokeWidth="0.8" 
            strokeLinejoin="round" 
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white text-sm tracking-widest uppercase leading-none truncate">
              Colmena
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#f59e0b]" />
          </div>
          <span className="text-[9px] text-amber-400/90 font-bold tracking-widest uppercase mt-1 truncate">
            Commercial Intelligence
          </span>
        </div>
      )}
    </div>
  );
}

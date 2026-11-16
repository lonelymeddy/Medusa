import React from "react";

interface MedusaLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const MedusaLogo: React.FC<MedusaLogoProps> = ({
  className = "",
  size = 32,
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200"
        aria-label="Medusa Logo"
      >
        <defs>
          <linearGradient id="medusa-crimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E50914" />
            <stop offset="100%" stopColor="#B00020" />
          </linearGradient>
        </defs>

        {/* Serpentine Hair - Left Symmetry */}
        <g stroke="url(#medusa-crimson)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 50 28 C 36 12 18 20 16 36 C 14 50 26 56 22 70 C 20 78 12 84 14 90 C 16 95 24 93 26 86" />
          <circle cx="26" cy="85" r="2.2" fill="#E50914" />
          <circle cx="25" cy="84" r="0.6" fill="#000000" />
          <path d="M 54 22 C 40 8 28 16 26 30 C 24 44 38 48 34 62 C 30 74 24 78 28 84" />
          <circle cx="29" cy="83" r="2" fill="#E50914" />
          <path d="M 58 20 C 48 10 38 18 38 28 C 38 40 48 46 42 60 C 38 68 34 72 38 78" />
          <circle cx="39" cy="77" r="1.8" fill="#E50914" />
          <path d="M 60 16 C 52 4 36 6 34 18 C 32 26 40 32 36 40" />
          <circle cx="36" cy="41" r="1.8" fill="#E50914" />
        </g>

        {/* Serpentine Hair - Right Symmetry */}
        <g stroke="url(#medusa-crimson)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 70 28 C 84 12 102 20 104 36 C 106 50 94 56 98 70 C 100 78 108 84 106 90 C 104 95 96 93 94 86" />
          <circle cx="94" cy="85" r="2.2" fill="#E50914" />
          <circle cx="95" cy="84" r="0.6" fill="#000000" />
          <path d="M 66 22 C 80 8 92 16 94 30 C 96 44 82 48 86 62 C 90 74 96 78 92 84" />
          <circle cx="91" cy="83" r="2" fill="#E50914" />
          <path d="M 62 20 C 72 10 82 18 82 28 C 82 40 72 46 78 60 C 82 68 86 72 82 78" />
          <circle cx="81" cy="77" r="1.8" fill="#E50914" />
          <path d="M 60 16 C 68 4 84 6 86 18 C 88 26 80 32 84 40" />
          <circle cx="84" cy="41" r="1.8" fill="#E50914" />
        </g>

        {/* Medusa Facial Contours */}
        <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 44 42 C 40 54 40 66 46 78 C 50 86 56 96 60 98 C 64 96 70 86 74 78 C 80 66 80 54 76 42" />
          <path d="M 46 51 C 50 49 55 50 57 52" strokeWidth="1.8" stroke="#E50914" />
          <path d="M 74 51 C 70 49 65 50 63 52" strokeWidth="1.8" stroke="#E50914" />
          <path d="M 46 56 C 49 53 54 53 57 56 C 54 58 49 58 46 56 Z" fill="rgba(229, 9, 20, 0.2)" strokeWidth="1.6" stroke="#FFFFFF" />
          <circle cx="51.5" cy="55.5" r="1.5" fill="#E50914" />
          <path d="M 74 56 C 71 53 66 53 63 56 C 66 58 71 58 74 56 Z" fill="rgba(229, 9, 20, 0.2)" strokeWidth="1.6" stroke="#FFFFFF" />
          <circle cx="68.5" cy="55.5" r="1.5" fill="#E50914" />
          <path d="M 60 52 L 59.5 67 C 58.5 68.5 61.5 68.5 60.5 67" strokeWidth="1.6" />
          <path d="M 53 75 C 57 73 63 73 67 75" strokeWidth="1.8" stroke="#E50914" />
          <path d="M 55 75 C 58 78 62 78 65 75" strokeWidth="1.4" stroke="#E50914" />
        </g>

        {/* Neck */}
        <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round">
          <path d="M 54 94 C 54 102 50 108 44 112" />
          <path d="M 66 94 C 66 102 70 108 76 112" />
        </g>
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-white text-base font-sans">
              MEDUSA
            </span>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30 font-medium">
              CYBER DEFENSE
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#A1A1AA] -mt-0.5">
            Autonomous Security Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import './EnergyWaves.css';

const EnergyWaves: React.FC = () => {
  return (
    <div className="global-waves-background">
      <svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        {/* Energy Wave Lines - Enhanced to match original image */}
        {/* First wave group - natural energy oscillations */}
        <path className="wave-line" d="M 0 32 Q 18 26 36 32 Q 54 38 72 32 Q 90 26 108 32 T 120 32" />
        <path className="wave-line" d="M 0 33 Q 16 27 32 33 Q 48 39 64 33 Q 80 27 96 33 T 120 33" />
        <path className="wave-line" d="M 0 34 Q 20 28 40 34 Q 60 40 80 34 Q 100 28 120 34" />
        <path className="wave-line" d="M 0 35 Q 17 29 34 35 Q 51 41 68 35 Q 85 29 102 35 T 120 35" />
        <path className="wave-line" d="M 0 36 Q 19 30 38 36 Q 57 42 76 36 Q 95 30 114 36 T 120 36" />
        
        {/* Second wave group - deeper troughs with natural flow */}
        <path className="wave-line" d="M 0 38 Q 15 44 30 38 Q 45 32 60 38 Q 75 44 90 38 Q 105 32 120 38" />
        <path className="wave-line" d="M 0 39 Q 14 45 28 39 Q 42 33 56 39 Q 70 45 84 39 Q 98 33 112 39 T 120 39" />
        <path className="wave-line" d="M 0 40 Q 16 46 32 40 Q 48 34 64 40 Q 80 46 96 40 Q 112 34 120 40" />
        <path className="wave-line" d="M 0 41 Q 13 47 26 41 Q 39 35 52 41 Q 65 47 78 41 Q 91 35 104 41 T 120 41" />
        <path className="wave-line" d="M 0 42 Q 17 48 34 42 Q 51 36 68 42 Q 85 48 102 42 Q 119 36 120 42" />
        
        {/* Leaf-like intersection area - organic crossing patterns */}
        <path className="wave-line" d="M 0 44 Q 25 38 50 44 Q 70 50 85 44 Q 100 38 115 44 T 120 44" />
        <path className="wave-line" d="M 0 45 Q 22 39 44 45 Q 66 51 88 45 Q 110 39 120 45" />
        <path className="wave-line" d="M 0 46 Q 24 40 48 46 Q 72 52 96 46 Q 120 40 120 46" />
        <path className="wave-line" d="M 0 47 Q 21 41 42 47 Q 63 53 84 47 Q 105 41 120 47" />
      </svg>
    </div>
  );
};

export default EnergyWaves;

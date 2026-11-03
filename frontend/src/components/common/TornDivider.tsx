import React from 'react';

interface TornDividerProps {
  fill: string;
  flip?: boolean;
  className?: string;
  height?: number;
}

export const TornDivider: React.FC<TornDividerProps> = ({
  fill,
  flip = false,
  className = '',
  height = 42,
}) => {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: `${height}px`,
        overflow: 'hidden',
        lineHeight: 0,
        transform: flip ? 'rotate(180deg)' : 'none',
        pointerEvents: 'none',
        position: 'relative',
        zIndex: 4,
      }}
    >
      <svg
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <path
          d="M0,24 C45,34 95,12 140,28 C185,44 235,16 280,32 C325,48 375,18 420,34 C465,50 515,14 560,30 C605,46 655,18 700,32 C745,46 795,12 840,30 C885,48 935,16 980,34 C1025,52 1075,14 1120,28 C1165,42 1215,18 1260,34 C1305,50 1355,16 1400,28 C1420,32 1435,26 1440,24 L1440,60 L0,60 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
};


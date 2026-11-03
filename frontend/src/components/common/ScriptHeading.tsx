import React from 'react';
import { motion } from 'framer-motion';
import styles from './ScriptHeading.module.scss';

interface ScriptHeadingProps {
  text: string;
  color?: string;
  underlineColor?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ScriptHeading: React.FC<ScriptHeadingProps> = ({
  text,
  color = '#32190F',
  underlineColor = '#EFBF35',
  align = 'center',
  size = 'md',
  className = '',
}) => {
  const alignClass =
    align === 'left' ? styles.alignLeft : align === 'right' ? styles.alignRight : styles.alignCenter;

  const sizeClass =
    size === 'sm' ? styles.sizeSm : size === 'lg' ? styles.sizeLg : styles.sizeMd;

  // Approximate width calculation for dynamic wavy line
  const approxWidth = Math.max(90, Math.min(260, text.length * 12 + 20));

  return (
    <div className={`${styles.scriptHeadingWrapper} ${alignClass} ${className}`}>
      <motion.span
        initial={{ opacity: 0, y: 8, rotate: -2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`${styles.scriptText} ${sizeClass}`}
        style={{ color }}
      >
        {text}
      </motion.span>
      <motion.svg
        className={styles.wavyUnderline}
        width={approxWidth}
        height="12"
        viewBox={`0 0 ${approxWidth} 12`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeInOut' }}
      >
        <path
          d={`M2 7 C${approxWidth * 0.2} 2, ${approxWidth * 0.35} 11, ${approxWidth * 0.55} 6 C${approxWidth * 0.75} 2, ${approxWidth * 0.9} 10, ${approxWidth - 2} 6`}
          stroke={underlineColor}
          strokeWidth="3.2"
        />
      </motion.svg>
    </div>
  );
};


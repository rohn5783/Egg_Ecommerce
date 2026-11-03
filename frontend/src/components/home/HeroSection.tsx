import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { ChickenMotionCanvas } from '../common/ChickenMotionCanvas.js';
import { TornDivider } from '../common/TornDivider.js';
import styles from './HeroSection.module.scss';

export const HeroSection: React.FC = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Graceful automatic reveal fallback after 2.8s
    const timer = setTimeout(() => setIsReady(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.container}>
        {/* Left Column: Headline, Subtitle & Meet the eggs button */}
        <motion.div
          className={styles.contentCol}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: isReady ? 1 : 0, y: isReady ? 0 : 18 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h1 className={styles.headline}>
            Good <span className={styles.accentText}>eggs.</span>
            <br />
            Better
            <br />
            <span className={styles.accentText}>mornings.</span>
          </h1>

          <p className={styles.subheadline}>
            Fresh brown and white eggs, from our flock to your pan.
          </p>

          <div className={styles.ctaWrapper}>
            <a href="#egg-comparison" className={styles.primaryBtn}>
              <span>Meet the eggs</span>
              <ArrowDown size={17} />
            </a>
          </div>
        </motion.div>

        {/* Right Column: 3D Animated Walking Hen with Egg-Laying & Speech Bubble */}
        <div className={styles.visualCol}>
          <div className={styles.canvasContainer}>
            <ChickenMotionCanvas onReady={() => setIsReady(true)} />
          </div>
        </div>
      </div>

      {/* Torn Paper Boundary into Yellow Meet the Eggs Section */}
      <div className={styles.tornBottom}>
        <TornDivider fill="#F5D85E" height={42} />
      </div>
    </section>
  );
};

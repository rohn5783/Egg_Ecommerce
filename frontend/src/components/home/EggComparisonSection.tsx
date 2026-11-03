import React from 'react';
import { motion } from 'framer-motion';
import { EggComparison3DScene } from '../common/EggComparison3DScene.js';
import { TornDivider } from '../common/TornDivider.js';
import { ScriptHeading } from '../common/ScriptHeading.js';
import styles from './EggComparisonSection.module.scss';

export const EggComparisonSection: React.FC = () => {
  return (
    <section id="egg-comparison" className={styles.section}>
      {/* Torn Top Boundary into Warm Buttery Yellow */}
      <div className={styles.tornTop}>
        <TornDivider fill="#F5D85E" height={42} />
      </div>

      <div className={styles.container}>
        {/* Eyebrow & Title */}
        <div className={styles.header}>
          <ScriptHeading text="meet the eggs" color="#24120D" underlineColor="#EFBF35" />
          <h2 className={styles.title}>
            Two shells. <span>Same good egg.</span>
          </h2>
          <p className={styles.subtitle}>
            The shell colour is just the breed of hen. The goodness inside is the same.
          </p>
        </div>

        {/* 3D Showcase with Side Callouts & Center Ampersand */}
        <div className={styles.showcaseWrapper}>
          {/* Left Callouts: Brown Egg Features */}
          <div className={styles.calloutsLeft}>
            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Warm, rich shell</h4>
              <p className={styles.calloutText}>
                That deep colour is all down to the breed: brown feathered hens lay brown eggs
              </p>
              <svg className={styles.arrowSvg} viewBox="0 0 50 20" fill="none">
                <path d="M5 10 Q 30 12, 45 6" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="45,6 40,4 42,9" fill="#24120D" />
              </svg>
            </div>

            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Natural freckles</h4>
              <p className={styles.calloutText}>
                Tiny speckles of pigment make every single shell a one-off
              </p>
              <svg className={styles.arrowSvg} viewBox="0 0 50 20" fill="none">
                <path d="M5 10 Q 30 10, 45 10" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="45,10 40,7 41,13" fill="#24120D" />
              </svg>
            </div>

            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Sunny yolk inside</h4>
              <p className={styles.calloutText}>
                Well-fed hens, deep golden yolks. Crack one open and see
              </p>
              <svg className={styles.arrowSvg} viewBox="0 0 50 20" fill="none">
                <path d="M5 6 Q 30 10, 45 14" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="45,14 41,10 40,16" fill="#24120D" />
              </svg>
            </div>
          </div>

          {/* 3D Canvas Area */}
          <div className={styles.canvasArea}>
            <EggComparison3DScene />
          </div>

          {/* Central Stylized Ampersand with Chick */}
          <div className={styles.ampersandWrapper}>
            <div className={styles.ampersandBadge}>
              <span className={styles.ampersand}>&amp;</span>
              <span className={styles.chickIcon} role="img" aria-label="Chick">🐥</span>
            </div>
          </div>

          {/* Right Callouts: White Egg Features */}
          <div className={styles.calloutsRight}>
            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Classic white shell</h4>
              <p className={styles.calloutText}>
                Clean, bright and timeless: the egg you grew up with
              </p>
              <svg className={styles.arrowSvgLeft} viewBox="0 0 50 20" fill="none">
                <path d="M45 10 Q 20 12, 5 6" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="5,6 10,4 8,9" fill="#24120D" />
              </svg>
            </div>

            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Smooth as can be</h4>
              <p className={styles.calloutText}>
                A baker's best friend, and the perfect canvas for egg dyeing
              </p>
              <svg className={styles.arrowSvgLeft} viewBox="0 0 50 20" fill="none">
                <path d="M45 10 Q 20 10, 5 10" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="5,10 10,7 9,13" fill="#24120D" />
              </svg>
            </div>

            <div className={styles.calloutItem}>
              <h4 className={styles.calloutTitle}>Same good stuff</h4>
              <p className={styles.calloutText}>
                Brown or white, the nutrition inside is just the same
              </p>
              <svg className={styles.arrowSvgLeft} viewBox="0 0 50 20" fill="none">
                <path d="M45 6 Q 20 10, 5 14" stroke="#24120D" strokeWidth="1.5" strokeDasharray="3 2" />
                <polygon points="5,14 9,10 10,16" fill="#24120D" />
              </svg>
            </div>
          </div>

          {/* Bottom Descriptive Cards for Each Shell */}
          <div className={styles.cardsRow}>
            {/* Left Card: The Brown One */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={styles.eggCard}
            >
              <h3 className={styles.cardTitle}>The Brown One</h3>
              <p className={styles.cardDesc}>laid by our brown feathered hens</p>
            </motion.div>

            {/* Spacer for ampersand alignment */}
            <div className={styles.cardSpacer} />

            {/* Right Card: The White One */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={styles.eggCard}
            >
              <h3 className={styles.cardTitle}>The White One</h3>
              <p className={styles.cardDesc}>laid by our white feathered hens</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Torn Bottom Boundary into Cream Shop Section */}
      <div className={styles.tornBottom}>
        <TornDivider fill="#F8F4E8" height={42} />
      </div>
    </section>
  );
};

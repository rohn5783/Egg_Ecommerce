import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { TornDivider } from '../common/TornDivider.js';
import { ScriptHeading } from '../common/ScriptHeading.js';
import styles from './FarmStorySection.module.scss';

export const FarmStorySection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="farm-story" className={styles.section}>
      {/* Torn Top Boundary into Warm Buttery Yellow */}
      <div className={styles.tornTop}>
        <TornDivider fill="#F5D85E" height={42} />
      </div>

      <div className={styles.container}>
        {/* Header: our poultry / Meet the farm behind the eggs */}
        <div className={styles.header}>
          <ScriptHeading text="our poultry" color="#24120D" underlineColor="#EFBF35" />
          <h2 className={styles.title}>
            Meet the <span className={styles.farmPill}>farm</span> behind the eggs.
          </h2>
          <p className={styles.subtitle}>
            A peek at where our hens live and where every egg begins.
          </p>
        </div>

        {/* Split Photography Cards */}
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsRow}>
            {/* Left Card: The Farm */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.25 }}
              className={styles.photoCard}
            >
              <img
                src="/assets/farm-exterior--2lQgt58.jpg"
                alt="The farm pasture at sunset"
                className={styles.photoImg}
              />
              <div className={styles.photoBadge}>
                <span>the farm</span>
              </div>
            </motion.div>

            {/* Right Card: Inside the Barn */}
            <motion.div
              whileHover={{ scale: 1.015 }}
              transition={{ duration: 0.25 }}
              className={styles.photoCard}
            >
              <img
                src="/assets/farm-interior-CorDx_hE.jpg"
                alt="Inside the airy sunny poultry barn"
                className={styles.photoImg}
              />
              <div className={styles.photoBadge}>
                <span>inside the barn</span>
              </div>
            </motion.div>
          </div>

          {/* Central 'Take the poultry tour' Pill Button */}
          <div className={styles.tourBtnWrapper}>
            <button className={styles.tourBtn} onClick={() => setIsModalOpen(true)}>
              <span className={styles.playCircle}>
                <Play size={12} fill="#24120D" color="#24120D" />
              </span>
              <span>Take the poultry tour</span>
            </button>
          </div>
        </div>
      </div>

      {/* Torn Bottom Boundary into Cream Footer */}
      <div className={styles.tornBottom}>
        <TornDivider fill="#F8F4E8" height={42} />
      </div>

      {/* Video / Poultry Tour Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalCard}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden' }}>
                <iframe
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Yolk & Co. Poultry Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

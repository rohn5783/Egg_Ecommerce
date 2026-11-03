import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TornDivider } from '../common/TornDivider.js';
import { ScriptHeading } from '../common/ScriptHeading.js';
import styles from './PackagingSection.module.scss';

export const PackagingSection: React.FC = () => {
  const [shellType, setShellType] = useState<'brown' | 'white'>('white');

  const steps = [
    {
      num: '1',
      title: 'Ten good eggs',
      desc: 'Your pick of the flock, each one settled into its own cup.',
    },
    {
      num: '2',
      title: 'Closed up snug',
      desc: 'Moulded pulp cushions every egg on the ride to your door.',
    },
    {
      num: '3',
      title: 'Sealed with our sticker',
      desc: 'Every box arrives sealed so you know it came from our flock.',
    },
  ];

  return (
    <section className={styles.section}>
      {/* Torn Top Boundary into Dark Chocolate Brown */}
      <div className={styles.tornTop}>
        <TornDivider fill="#24120D" height={42} />
      </div>

      <div className={styles.container}>
        {/* Left Column: Numbered Packaging Process */}
        <div className={styles.infoCol}>
          <ScriptHeading text="what you'll receive" color="#F8F4E8" underlineColor="#EFBF35" align="left" />
          <h2 className={styles.title}>
            Your eggs,
            <br />
            <span style={{ color: '#F5D85E' }}>boxed</span> with care.
          </h2>
          <p className={styles.subtitle}>
            Every order is packed in our moulded-pulp carton and sealed with our sticker. This is what lands on your doorstep.
          </p>

          {/* Mini Pill Switch */}
          <div className={styles.miniSwitch}>
            <button
              className={`${styles.miniBtn} ${shellType === 'brown' ? styles.activeBrown : ''}`}
              onClick={() => setShellType('brown')}
            >
              <span className={`${styles.dot} ${styles.brownDot}`} />
              <span>Brown</span>
            </button>
            <button
              className={`${styles.miniBtn} ${shellType === 'white' ? styles.activeWhite : ''}`}
              onClick={() => setShellType('white')}
            >
              <span className={`${styles.dot} ${styles.whiteDot}`} />
              <span>White</span>
            </button>
          </div>

          {/* 3 Numbered Steps */}
          <div className={styles.stepsList}>
            {steps.map((step) => (
              <div key={step.num} className={styles.stepItem}>
                <div className={styles.numBadge}>{step.num}</div>
                <div className={styles.stepText}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Open Moulded Pulp Carton Image */}
        <div className={styles.visualCol}>
          <AnimatePresence mode="wait">
            <motion.div
              key={shellType}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
              className={styles.cartonShowcase}
            >
              <img
                src={
                  shellType === 'white'
                    ? '/assets/pack-white-10-BbjpCtDS.jpg'
                    : '/assets/pack-brown-10-BDXuFFWz.jpg'
                }
                alt={`Fresh ${shellType} eggs in moulded pulp carton`}
                className={styles.cartonPhoto}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Torn Bottom Boundary into Yellow Our Poultry Section */}
      <div className={styles.tornBottom}>
        <TornDivider fill="#F5D85E" height={42} />
      </div>
    </section>
  );
};

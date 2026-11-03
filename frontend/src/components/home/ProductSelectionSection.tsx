import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore.js';
import { TornDivider } from '../common/TornDivider.js';
import styles from './ProductSelectionSection.module.scss';

export const ProductSelectionSection: React.FC = () => {
  const [selectedShell, setSelectedShell] = useState<'brown' | 'white'>('brown');
  const [tappedEgg, setTappedEgg] = useState<string | null>(null);
  const { addItem, toggleDrawer } = useCartStore();

  const packData: Record<'brown' | 'white', Array<{ count: number; price: number; img: string; productId: string }>> = {
    brown: [
      { count: 6, price: 84, img: '/assets/pack-brown-6-BbFe4R3C.jpg', productId: 'p-brown-6' },
      { count: 10, price: 135, img: '/assets/pack-brown-10-BDXuFFWz.jpg', productId: 'p-brown-10' },
      { count: 12, price: 159, img: '/assets/pack-brown-12-F3leDPlZ.jpg', productId: 'p-brown-12' },
    ],
    white: [
      { count: 6, price: 78, img: '/assets/pack-white-6-mwYZApsz.jpg', productId: 'p-white-6' },
      { count: 10, price: 125, img: '/assets/pack-white-10-BbjpCtDS.jpg', productId: 'p-white-10' },
      { count: 12, price: 149, img: '/assets/pack-white-12-CU-VFrPz.jpg', productId: 'p-white-12' },
    ],
  };

  const handleEggTap = (id: string) => {
    setTappedEgg(id);
    setTimeout(() => setTappedEgg(null), 500);
  };

  const handleBuy = async (productId: string) => {
    try {
      await addItem(productId, 1);
      toggleDrawer();
    } catch {
      // Graceful fallback to opening cart
      toggleDrawer();
    }
  };

  return (
    <section id="products" className={styles.section}>
      {/* Torn Top Boundary into Cream */}
      <div className={styles.tornTop}>
        <TornDivider fill="#F8F4E8" height={42} />
      </div>

      <div className={styles.container}>
        {/* Shell Switcher & Cursive 'psst... tap an egg' */}
        <div className={styles.controlsWrapper}>
          <div className={styles.pillSwitch}>
            <button
              className={`${styles.pillBtn} ${selectedShell === 'brown' ? styles.activeBrown : ''}`}
              onClick={() => setSelectedShell('brown')}
            >
              <span className={`${styles.dot} ${styles.brownDot}`} />
              <span>Brown</span>
            </button>
            <button
              className={`${styles.pillBtn} ${selectedShell === 'white' ? styles.activeWhite : ''}`}
              onClick={() => setSelectedShell('white')}
            >
              <span className={`${styles.dot} ${styles.whiteDot}`} />
              <span>White</span>
            </button>
          </div>

          <div className={styles.psstText}>
            <span>psst... tap an egg</span>
          </div>
        </div>

        {/* 3 Pack Cards Grid */}
        <div className={styles.cardsGrid}>
          {packData[selectedShell].map((pack) => {
            const shellLabel = selectedShell === 'brown' ? 'Brown' : 'White';
            const eggKey = `${selectedShell}-${pack.count}`;
            const isWobbling = tappedEgg === eggKey;

            return (
              <motion.div
                key={pack.count}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                className={styles.packCard}
              >
                {/* Carton Image Preview with Tap-to-Wobble Effect */}
                <div
                  className={styles.imageWrapper}
                  onClick={() => handleEggTap(eggKey)}
                  title="psst... tap an egg"
                >
                  <motion.img
                    src={pack.img}
                    alt={`${shellLabel} Eggs, Pack of ${pack.count}`}
                    className={styles.cartonImg}
                    animate={
                      isWobbling
                        ? { scale: [1, 1.08, 0.96, 1], rotate: [0, -3, 3, 0] }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.4 }}
                  />
                </div>

                {/* Card Info & Buy Now Action */}
                <div className={styles.cardBottom}>
                  <div className={styles.infoCol}>
                    <h3 className={styles.cardTitle}>
                      {shellLabel} Eggs, Pack of {pack.count}
                    </h3>
                    <div className={styles.cardPrice}>₹{pack.price}</div>
                  </div>

                  <button
                    className={styles.buyNowBtn}
                    onClick={() => handleBuy(pack.productId)}
                  >
                    Buy now
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Torn Bottom Boundary into Dark Chocolate Brown */}
      <div className={styles.tornBottom}>
        <TornDivider fill="#24120D" height={42} />
      </div>
    </section>
  );
};

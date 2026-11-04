import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../../stores/cartStore.js';
import { api } from '../../services/api.js';
import { IProduct } from '../../types/index.js';
import { TornDivider } from '../common/TornDivider.js';
import styles from './ProductSelectionSection.module.scss';

export const ProductSelectionSection: React.FC = () => {
  const [selectedShell, setSelectedShell] = useState<'brown' | 'white'>('brown');
  const [tappedEgg, setTappedEgg] = useState<string | null>(null);
  const [products, setProducts] = useState<IProduct[]>([]);
  const { addItem, toggleDrawer } = useCartStore();

  useEffect(() => {
    api.get('/products', { params: { limit: 100 } })
      .then((res) => setProducts(res.data.data))
      .catch((err) => console.error('Failed to load homepage products:', err));
  }, []);

  const packData: Record<'brown' | 'white', Array<{ count: number; img: string }>> = {
    brown: [
      { count: 6, img: '/assets/pack-brown-6-BbFe4R3C.jpg' },
      { count: 10, img: '/assets/pack-brown-10-BDXuFFWz.jpg' },
      { count: 12, img: '/assets/pack-brown-12-F3leDPlZ.jpg' },
    ],
    white: [
      { count: 6, img: '/assets/pack-white-6-mwYZApsz.jpg' },
      { count: 10, img: '/assets/pack-white-10-BbjpCtDS.jpg' },
      { count: 12, img: '/assets/pack-white-12-CU-VFrPz.jpg' },
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
            const eggType = selectedShell === 'brown' ? 'ORGANIC_BROWN' : 'CLASSIC_WHITE';
            const product = products.find(
              (item) => item.eggQuantity === pack.count && item.eggType === eggType
            );
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
                    <div className={styles.cardPrice}>
                      {product ? `₹${product.discountPrice || product.price}` : 'Unavailable'}
                    </div>
                  </div>

                  <button
                    className={styles.buyNowBtn}
                    disabled={!product}
                    onClick={() => product && handleBuy(product._id)}
                  >
                    {product ? 'Buy now' : 'Unavailable'}
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

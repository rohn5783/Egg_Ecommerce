import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sun, Shield, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './AboutFarmPage.module.scss';

export const AboutFarmPage: React.FC = () => {
  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      {/* Hero Banner */}
      <section className={styles.heroBanner}>
        <div className={styles.container}>
          <span className="section-label">Rooted in Sunshine &amp; Soil</span>
          <h1 className={styles.heroTitle}>Meet the Farm Behind GoodEggs</h1>
          <p className={styles.heroSubtitle}>
            We believe that extraordinary mornings begin with happier hens, open pastures, and ethical stewardship of the land.
          </p>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className={styles.philosophySection}>
        <div className={styles.container}>
          <div className={styles.twoCol}>
            <div className={styles.textCol}>
              <span className={styles.subLabel}>Our Farming Manifesto</span>
              <h2 className={styles.heading}>Pasture-First. Always.</h2>
              <p>
                In the industrial food system, eggs are treated like manufactured commodities. Hens are confined
                indoors under artificial lights, never knowing the feel of clover beneath their feet or the warm morning sun on their feathers.
              </p>
              <p>
                At GoodEggs, we do things differently. We partner exclusively with local family-operated pasture farms.
                Our flocks roam freely across rolling green paddocks with over 108 square feet of fresh pasture per hen.
              </p>

              <div className={styles.checklist}>
                <div className={styles.checkItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>100% Free-roaming on pesticide-free pastures</span>
                </div>
                <div className={styles.checkItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Non-GMO, vegetarian supplementary grains</span>
                </div>
                <div className={styles.checkItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Zero preventive antibiotics or synthetic hormones</span>
                </div>
                <div className={styles.checkItem}>
                  <CheckCircle2 size={20} className={styles.checkIcon} />
                  <span>Gathered daily and candled by hand within 24 hours</span>
                </div>
              </div>
            </div>

            <div className={styles.imageCol}>
              <img
                src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=800&q=80"
                alt="Flock of hens roaming freely on lush green pasture"
                className={styles.farmImg}
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Yolk Science Strip */}
      <section className={styles.yolkScience}>
        <div className={styles.container}>
          <div className={styles.headerCentered}>
            <span className="section-label">The Secret to the Amber Dome</span>
            <h2 className={styles.heading}>Why Our Yolks Are Radiant Marigold</h2>
            <p>
              Natural pasture foraging on clover, wild grasses, alfalfa, and garden insects infuses our hens with
              bio-available carotenoids and lutein. When you crack a GoodEgg, the yolk stands tall and plump with unforgettable buttery richness.
            </p>
          </div>

          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <strong>14 / 15</strong>
              <span>Roche Yolk Color Scale</span>
              <p>Deep amber-orange hue from natural pasture carotenoids.</p>
            </div>
            <div className={styles.metricCard}>
              <strong>6.6g</strong>
              <span>Bioavailable Protein</span>
              <p>Dense thick albumen supporting muscle synthesis.</p>
            </div>
            <div className={styles.metricCard}>
              <strong>260mg</strong>
              <span>Omega-3 Fatty Acids</span>
              <p>More than double standard commercial cage eggs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2>Taste the Pasture-Raised Difference</h2>
          <p>Delivered fresh from our farm gates to your kitchen table before 8 AM.</p>
          <Link to="/shop" className={styles.shopBtn}>
            <span>Order Fresh Farm Eggs</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};


import React from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './LegalPages.module.scss';

export const TermsPage: React.FC = () => {
  return (
    <div className={styles.legalWrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">Farm Agreement</span>
          <h1 className={styles.title}>Terms &amp; Conditions</h1>
          <p className={styles.updatedDate}>Last updated: November 2026</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>1. Freshness &amp; Product Nature</h2>
            <p>
              GoodEggs provides natural, unadulterated pasture-raised poultry products. Because our flocks forage on
              natural pastures with changing seasonal weather, slight natural variations in shell speckling and yolk intensity may occur.
            </p>
          </section>

          <section>
            <h2>2. Morning Delivery Windows</h2>
            <p>
              Orders are dispatched during our dawn delivery window (6:00 AM – 8:30 AM). Customers are responsible for
              ensuring clear access to apartment doorways, milk boxes, or security gates.
            </p>
          </section>

          <section>
            <h2>3. Crack-Free Guarantee &amp; Refund Policy</h2>
            <p>
              If an egg arrives damaged or cracked due to courier transit, notify us within 12 hours with a photo.
              We will promptly issue a wallet credit or free replacement in your next morning delivery.
            </p>
          </section>

          <section>
            <h2>4. Subscription Delivery Plans</h2>
            <p>
              Weekly, biweekly, and monthly recurring plans automatically renew on your selected billing day.
              You can pause, reschedule, or cancel your subscription at any time via your Account Dashboard.
            </p>
          </section>

          <section>
            <h2>5. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by the laws of India, with exclusive jurisdiction in Bengaluru courts.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};


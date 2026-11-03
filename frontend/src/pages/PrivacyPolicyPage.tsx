import React from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './LegalPages.module.scss';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className={styles.legalWrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="section-label">Trust &amp; Transparency</span>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.updatedDate}>Last updated: November 2026</p>
        </div>

        <div className={styles.content}>
          <section>
            <h2>1. Information We Collect</h2>
            <p>
              When you purchase farm-fresh eggs from GoodEggs or create an account, we collect your name,
              delivery address, email address, phone number, and delivery preferences. This information is
              used strictly to fulfill morning deliveries and provide customer support.
            </p>
          </section>

          <section>
            <h2>2. Payment Information &amp; Security</h2>
            <p>
              We integrate with <strong>Razorpay</strong> for processing digital transactions. GoodEggs never
              stores or sees your complete credit/debit card numbers or UPI MPINs. All payments are encrypted
              using bank-grade PCI-DSS compliant secure protocols.
            </p>
          </section>

          <section>
            <h2>3. Delivery Communication</h2>
            <p>
              We send order confirmation emails and SMS/WhatsApp delivery updates to notify you when your morning
              pack has been gathered, dispatched, and placed in your insulated milk box. You may opt out of promotional emails anytime.
            </p>
          </section>

          <section>
            <h2>4. Cookies &amp; Guest Session Tokens</h2>
            <p>
              We use lightweight functional session tokens to keep track of items in your Morning Carton and
              shopping basket before you log in. We do not sell your personal browsing habits to third-party data brokers.
            </p>
          </section>

          <section>
            <h2>5. Contact Us</h2>
            <p>
              For questions regarding your data privacy, contact our Data Protection Officer at privacy@goodeggs.farm.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};


import React from 'react';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Column: Brand & Tagline */}
        <div className={styles.brandCol}>
          <a href="#" className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 2C9.5 2 4 10 4 19C4 25.5 9.5 30 16 30C22.5 30 28 25.5 28 19C28 10 22.5 2 16 2Z"
                  fill="#F5D85E"
                />
                <circle cx="16" cy="18" r="7" fill="#E8912B" />
              </svg>
            </span>
            <span className={styles.logoText}>Yolk &amp; Co.</span>
          </a>
          <p className={styles.tagline}>Good eggs. Better mornings.</p>
        </div>

        {/* Links Columns */}
        <div className={styles.linksRow}>
          {/* Shop Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeader}>Shop</h4>
            <a href="#products" onClick={scrollTo('products')}>Brown eggs</a>
            <a href="#products" onClick={scrollTo('products')}>White eggs</a>
            <a href="#products" onClick={scrollTo('products')}>Packs of 6, 10 &amp; 12</a>
          </div>

          {/* Explore Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeader}>Explore</h4>
            <a href="#egg-comparison" onClick={scrollTo('egg-comparison')}>Meet the eggs</a>
            <a href="#farm-story" onClick={scrollTo('farm-story')}>Our poultry</a>
            <a href="#products" onClick={scrollTo('products')}>Order to door</a>
          </div>

          {/* Account & Farm Ops Column */}
          <div className={styles.linkCol}>
            <h4 className={styles.colHeader}>Account &amp; Ops</h4>
            <a href="/login">Customer Sign In</a>
            <a href="/register">Create Account</a>
            <a href="/orders">My Orders &amp; Invoices</a>
            <a href="/admin">Admin Dashboard</a>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className={styles.subfooter}>
        <p>© {new Date().getFullYear()} Yolk &amp; Co. Farm to kitchen.</p>
      </div>
    </footer>
  );
};

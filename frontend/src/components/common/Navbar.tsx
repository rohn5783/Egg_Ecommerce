import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Shield, LogIn, User, ChevronDown, Package, LogOut } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import styles from './Navbar.module.scss';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart, toggleDrawer } = useCartStore();
  const { user, logout } = useAuthStore();

  const totalCartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.navbarContainer}>
        {/* Brand Logo - Yolk & Co. / GoodEggs */}
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2C9.5 2 4 10 4 19C4 25.5 9.5 30 16 30C22.5 30 28 25.5 28 19C28 10 22.5 2 16 2Z"
                fill="#F5D85E"
              />
              <circle cx="16" cy="18" r="7" fill="#E8912B" />
              <path
                d="M12 21C12 23 13.5 25 16 25C18.5 25 20 23 20 21"
                stroke="#24120D"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className={styles.logoText}>Yolk &amp; Co.</span>
        </a>

        {/* Center Pill Navigation */}
        <nav className={styles.navPill}>
          <a href="#meet-the-eggs" onClick={scrollTo('egg-comparison')} className={styles.navLink}>
            Our Eggs
          </a>
          <a href="#shop" onClick={scrollTo('products')} className={styles.navLink}>
            Shop
          </a>
          <a href="#our-poultry" onClick={scrollTo('farm-story')} className={styles.navLink}>
            Our Poultry
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className={styles.navActions}>
          {/* If NOT logged in: Show Sign In button & Admin shortcut */}
          {!user ? (
            <>
              <a href="/login" className={styles.signInBtn}>
                <LogIn size={14} />
                <span>Sign In</span>
              </a>
              <a href="/login" className={styles.adminNavBtn} title="Admin Portal">
                <Shield size={13} />
                <span>Admin</span>
              </a>
            </>
          ) : (
            /* If Logged in: Show User Account Dropdown */
            <div className={styles.userDropdownWrapper} ref={dropdownRef}>
              <button
                className={styles.userMenuBtn}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User Account Menu"
              >
                <span className={styles.userAvatar}>
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </span>
                <span className={styles.userNameText}>{user.name || 'Account'}</span>
                <ChevronDown size={14} />
              </button>

              {isUserMenuOpen && (
                <div className={styles.userDropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className={styles.roleBadge}>
                      {user.role === 'ADMIN' ? '🛡️ Administrator' : '🐣 Farm Customer'}
                    </span>
                  </div>

                  <a
                    href="/orders"
                    className={styles.dropdownItem}
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <Package size={15} />
                    <span>My Orders &amp; Invoices</span>
                  </a>

                  {user.role === 'ADMIN' && (
                    <a
                      href="/admin"
                      className={styles.dropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                      style={{ color: '#E8912B', fontWeight: 'bold' }}
                    >
                      <Shield size={15} />
                      <span>Admin Operations</span>
                    </a>
                  )}

                  <button
                    className={`${styles.dropdownItem} ${styles.logoutBtn}`}
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Cart / Order Eggs Trigger */}
          <button
            className={styles.orderEggsBtn}
            onClick={() => {
              if (totalCartCount > 0) {
                toggleDrawer();
              } else {
                const el = document.getElementById('products');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span>Order eggs</span>
            {totalCartCount > 0 && (
              <span className={styles.cartCountBadge}>
                <ShoppingBag size={12} style={{ marginRight: '3px' }} />
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

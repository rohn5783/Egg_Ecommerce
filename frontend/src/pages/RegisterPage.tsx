import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { useAuthStore } from '../stores/authStore.js';
import styles from './AuthPages.module.scss';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const { register, googleLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handlePostAuthRedirect = () => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await register(name, email, password, phone);
    if (success) {
      handlePostAuthRedirect();
    }
  };

  const handleGoogleSignIn = async (account: { email: string; name: string; avatar?: string }) => {
    clearError();
    setShowGoogleModal(false);
    const success = await googleLogin({
      email: account.email,
      name: account.name,
      avatar: account.avatar,
      googleId: `google_${account.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    });
    if (success) {
      handlePostAuthRedirect();
    }
  };

  return (
    <div className={styles.authWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.authCard}>
          <div className={styles.iconCircle}>
            <span className={styles.eggEmoji}>🐣</span>
          </div>

          <h1 className={styles.title}>Join GoodEggs</h1>
          <p className={styles.subtitle}>
            Wake up to pasture-raised freshness delivered directly from local family farms.
          </p>

          {/* Google Sign In Button */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={() => setShowGoogleModal(true)}
            disabled={isLoading}
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className={styles.dividerRow}>
            <span>or with email</span>
          </div>

          {error && (
            <div className={styles.errorAlert}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arjun Kapoor"
              />
            </div>

            <div className={styles.field}>
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arjun@domain.com"
              />
            </div>

            <div className={styles.field}>
              <label>Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className={styles.field}>
              <label>Password (min. 6 characters) *</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={isLoading} className={styles.submitBtn}>
              <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className={styles.footerText}>
            Already have an account? <Link to="/login">Sign in here</Link>
          </div>
        </div>
      </main>

      {/* Google Account Selector Dialog */}
      {showGoogleModal && (
        <div className={styles.googlePromptModal} onClick={() => setShowGoogleModal(false)}>
          <div className={styles.googlePromptCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.googleHeader}>
              <GoogleIcon />
              <h3>Choose a Google Account</h3>
              <p>to continue to GoodEggs Farm Store</p>
            </div>

            <div className={styles.googleAccountList}>
              <div
                className={styles.googleAccountItem}
                onClick={() =>
                  handleGoogleSignIn({
                    email: 'arjun.kapoor@gmail.com',
                    name: 'Arjun Kapoor',
                  })
                }
              >
                <div className={styles.accAvatar}>A</div>
                <div className={styles.accInfo}>
                  <strong>Arjun Kapoor</strong>
                  <span>arjun.kapoor@gmail.com</span>
                </div>
              </div>

              <div
                className={styles.googleAccountItem}
                onClick={() =>
                  handleGoogleSignIn({
                    email: 'priya.sharma@gmail.com',
                    name: 'Priya Sharma',
                  })
                }
              >
                <div className={styles.accAvatar} style={{ background: '#FCE8E6', color: '#D93025' }}>
                  P
                </div>
                <div className={styles.accInfo}>
                  <strong>Priya Sharma</strong>
                  <span>priya.sharma@gmail.com</span>
                </div>
              </div>

              <div
                className={styles.googleAccountItem}
                onClick={() =>
                  handleGoogleSignIn({
                    email: 'admin.goodeggs@gmail.com',
                    name: 'GoodEggs Administrator',
                  })
                }
              >
                <div className={styles.accAvatar} style={{ background: '#E6F4EA', color: '#137333' }}>
                  🛡️
                </div>
                <div className={styles.accInfo}>
                  <strong>Admin Account (Google)</strong>
                  <span>admin.goodeggs@gmail.com</span>
                </div>
              </div>
            </div>

            <div className={styles.customGoogleInput}>
              <label>Or enter any other Gmail:</label>
              <input
                type="email"
                placeholder="custom.name@gmail.com"
                value={customGoogleEmail}
                onChange={(e) => setCustomGoogleEmail(e.target.value)}
              />
            </div>

            <div className={styles.googleModalActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowGoogleModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                disabled={!customGoogleEmail || !customGoogleEmail.includes('@')}
                onClick={() => {
                  if (customGoogleEmail) {
                    handleGoogleSignIn({
                      email: customGoogleEmail,
                      name: customGoogleEmail.split('@')[0],
                    });
                  }
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};


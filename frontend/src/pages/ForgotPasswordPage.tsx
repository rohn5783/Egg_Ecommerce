import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './AuthPages.module.scss';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <Navbar />
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <Link to="/login" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>

          <div className={styles.header}>
            <h1 className={styles.title}>Reset Your Password</h1>
            <p className={styles.subtitle}>
              Enter your email address and we will send you a secure link to reset your GoodEggs password.
            </p>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          {sent ? (
            <div className={styles.successState}>
              <CheckCircle2 size={48} className={styles.successIcon} />
              <h3>Password Reset Link Dispatched!</h3>
              <p>
                We have sent instructions to <strong>{email}</strong>. Please check your inbox and follow the steps.
              </p>
              <Link to="/login" className={styles.submitBtn}>
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail size={18} className={styles.fieldIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? 'Sending Instructions...' : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};


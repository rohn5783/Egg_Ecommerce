import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './ContactPage.module.scss';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order Enquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <section className={styles.heroBanner}>
        <div className={styles.container}>
          <span className="section-label">We’d Love to Hear From You</span>
          <h1 className={styles.title}>Contact GoodEggs</h1>
          <p className={styles.subtitle}>
            Have a question about our pastures, morning delivery routes, or bespoke bulk orders? Reach out to our farmhouse team.
          </p>
        </div>
      </section>

      <section className={styles.contentSection}>
        <div className={styles.container}>
          <div className={styles.twoCol}>
            {/* Contact Info Card */}
            <div className={styles.infoCard}>
              <h2 className={styles.infoHeading}>Farmhouse Headquarters</h2>
              <p className={styles.infoDesc}>
                Our central dispatch hub and customer care team are available every day from sunrise.
              </p>

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <MapPin size={22} className={styles.icon} />
                  <div>
                    <strong>Farm &amp; Dispatch Hub</strong>
                    <span>GoodEggs Valley, Devanahalli Rural, Bengaluru, KA 562110</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Phone size={22} className={styles.icon} />
                  <div>
                    <strong>Farm Help Desk</strong>
                    <span>+91 98765 43210 / +91 80 4123 4567</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Mail size={22} className={styles.icon} />
                  <div>
                    <strong>Email Inquiries</strong>
                    <span>hello@goodeggs.farm / orders@goodeggs.farm</span>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Clock size={22} className={styles.icon} />
                  <div>
                    <strong>Morning Dispatch Window</strong>
                    <span>6:00 AM – 8:30 AM Daily</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className={styles.formCard}>
              {submitted ? (
                <div className={styles.successBox}>
                  <CheckCircle2 size={48} className={styles.successIcon} />
                  <h3>Message Received with Thanks!</h3>
                  <p>
                    Thank you for reaching out to GoodEggs. A member of our farm concierge team will respond within 24 hours.
                  </p>
                  <button
                    className={styles.resetBtn}
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', phone: '', subject: 'Order Enquiry', message: '' });
                    }}
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.contactForm}>
                  <h3 className={styles.formTitle}>Send Us a Message</h3>

                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="priya@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="Order Enquiry">Delivery &amp; Order Enquiry</option>
                      <option value="Subscription">Weekly Subscription Enquiry</option>
                      <option value="Feedback">Egg Quality Feedback</option>
                      <option value="Commercial">Commercial / Chef Orders</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Message</label>
                    <textarea
                      rows={4}
                      required
                      placeholder="How can we help make your mornings better?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className={styles.submitBtn}>
                    <Send size={16} />
                    <span>Send Message to Farm</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};


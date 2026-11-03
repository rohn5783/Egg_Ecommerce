import React, { useState } from 'react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import styles from './FAQPage.module.scss';

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqs = [
    {
      q: 'What does "Pasture-Raised" really mean at GoodEggs?',
      a: 'Unlike "cage-free" (which simply means hens are in a giant crowded barn with no outdoor access), our hens spend daylight hours outdoors on living green pasture. Every bird enjoys over 108 square feet of open foraging ground to dust-bathe, scratch for wild seeds and insects, and bask in genuine sunshine.',
      cat: 'Farm & Animal Welfare',
    },
    {
      q: 'Why are your egg yolks such a deep, rich amber-marigold color?',
      a: 'Yolk color is a direct reflection of a hen’s diet. Because our hens forage on fresh clover, wild alfalfa, and insects rich in natural carotenoids and lutein, their yolks naturally crack open with a radiant deep amber-orange hue (scoring 13–14 on the Roche Yolk Color Fan). We never use artificial dye additives or synthetic colorants.',
      cat: 'Nutrition & Quality',
    },
    {
      q: 'What is the real difference between brown and white eggs?',
      a: 'The color of the shell is purely determined by the breed of hen (Rhode Island Reds lay brown eggs, whereas White Leghorns lay white eggs). Both come from pasture-raised hens and deliver the same nutrient-dense protein and buttery freshness. Brown shells are slightly denser, while white egg whites whip with immense volume for baking.',
      cat: 'Nutrition & Quality',
    },
    {
      q: 'How fast do eggs reach my kitchen after being laid?',
      a: 'Our partner farms gather eggs at sunrise. They are candled for shell integrity, packed into shock-absorbent moulded pulp cartons, and dispatched in our early-morning courier route to arrive at your door within 24 hours of collection.',
      cat: 'Orders & Delivery',
    },
    {
      q: 'How does the Weekly Egg Subscription work?',
      a: 'You can choose your favorite pack (e.g., Brown 10-Pack or Classic White 15-Pack), set your preferred delivery day (like Sunday or Wednesday morning), and enjoy automatic fresh deliveries right to your doorstep. You can pause, reschedule, or cancel your subscription anytime with zero penalty.',
      cat: 'Subscriptions & Billing',
    },
    {
      q: 'How should I store my GoodEggs, and what is their shelf life?',
      a: 'Because our eggs are delivered within 24 hours of collection with their natural protective bloom intact, they remain fresh for up to 4 weeks when refrigerated between 2°C and 5°C. For easiest peeling when hard-boiling, eggs stored for 7–10 days are ideal.',
      cat: 'Nutrition & Quality',
    },
    {
      q: 'What happens to the cartons? Do you take them back?',
      a: 'Yes! Our cartons are 100% biodegradable, made from virgin unbleached wood pulp. If you do not compost them at home, you can simply hand clean empty cartons back to your morning delivery partner for our circular recycling program.',
      cat: 'Orders & Delivery',
    },
  ];

  const filtered = faqs.filter(
    (item) =>
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <section className={styles.heroBanner}>
        <div className={styles.container}>
          <span className="section-label">Help &amp; Knowledge Base</span>
          <h1 className={styles.title}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Everything you need to know about our pasture welfare standards, shell science, morning delivery schedules, and subscriptions.
          </p>

          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by topic (e.g. yolk color, pasture, delivery)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.faqList}>
            {filtered.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
                  <button
                    className={styles.questionBtn}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <div className={styles.qLeft}>
                      <span className={styles.categoryPill}>{item.cat}</span>
                      <h3 className={styles.questionText}>{item.q}</h3>
                    </div>
                    <ChevronDown size={20} className={`${styles.chevron} ${isOpen ? styles.chevronRotated : ''}`} />
                  </button>
                  {isOpen && (
                    <div className={styles.answerBox}>
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className={styles.emptyResults}>
                <HelpCircle size={40} />
                <p>No questions matched your search term "{searchTerm}".</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};


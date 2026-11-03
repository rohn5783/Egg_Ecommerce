import React, { useEffect } from 'react';
import { Navbar } from '../components/common/Navbar.js';
import { HeroSection } from '../components/home/HeroSection.js';
import { EggComparisonSection } from '../components/home/EggComparisonSection.js';
import { ProductSelectionSection } from '../components/home/ProductSelectionSection.js';
import { PackagingSection } from '../components/home/PackagingSection.js';
import { FarmStorySection } from '../components/home/FarmStorySection.js';
import { Footer } from '../components/common/Footer.js';
import { CartDrawer } from '../components/common/CartDrawer.js';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';

export const HomePage: React.FC = () => {
  const { fetchCart } = useCartStore();
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, [fetchCart, fetchProfile]);

  return (
    <div className="homepage-wrapper">
      <Navbar />
      <main>
        <HeroSection />
        <EggComparisonSection />
        <ProductSelectionSection />
        <PackagingSection />
        <FarmStorySection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

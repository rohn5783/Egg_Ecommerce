import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SmoothScroll } from './components/common/SmoothScroll.js';
import { useAuthStore } from './stores/authStore.js';
import { HomePage } from './pages/HomePage.js';
import { ShopPage } from './pages/ShopPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { AboutFarmPage } from './pages/AboutFarmPage.js';
import { ContactPage } from './pages/ContactPage.js';
import { FAQPage } from './pages/FAQPage.js';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage.js';
import { TermsPage } from './pages/TermsPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

const ProtectedCheckout: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <CheckoutPage />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedCheckout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/our-farm" element={<AboutFarmPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  );
};

export default App;

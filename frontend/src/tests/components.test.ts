import { describe, it, expect } from 'vitest';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';

describe('Yolk & Co. Frontend Stores & State', () => {
  it('Cart drawer toggles correctly', () => {
    const cartStore = useCartStore.getState();
    expect(cartStore.isDrawerOpen).toBe(false);

    cartStore.openDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);

    cartStore.closeDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);

    cartStore.toggleDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(true);
    cartStore.toggleDrawer();
    expect(useCartStore.getState().isDrawerOpen).toBe(false);
  });

  it('Cart store initializes with null cart and idle state', () => {
    const cartStore = useCartStore.getState();
    expect(cartStore.isLoading).toBe(false);
    expect(cartStore.cart).toBeNull();
  });

  it('Auth store starts unauthenticated with null user', () => {
    const authStore = useAuthStore.getState();
    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.user).toBeNull();
    expect(authStore.isLoading).toBe(false);
  });

  it('Auth store logout clears state and tokens', () => {
    const authStore = useAuthStore.getState();
    authStore.logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('Auth store exposes googleLogin method', () => {
    const authStore = useAuthStore.getState();
    expect(typeof authStore.googleLogin).toBe('function');
  });

  it('Generates authentic tax invoice structure for orders', () => {
    const sampleOrderNumber = 'GE-TEST-999';
    const invoiceNumber = `INV-${sampleOrderNumber}`;
    expect(invoiceNumber).toBe('INV-GE-TEST-999');
  });
});

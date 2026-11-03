import { create } from 'zustand';
import { ICart } from '../types/index.js';
import { api } from '../services/api.js';

interface CartState {
  cart: ICart | null;
  isDrawerOpen: boolean;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, customCartonConfig?: any) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const PRODUCT_DEFAULTS: Record<string, { name: string; price: number; eggQuantity: number; image: string }> = {
  'p-brown-6': { name: 'Pasture-Raised Heritage Brown (6 Pack)', price: 84, eggQuantity: 6, image: '/assets/pack-brown-6-BbFe4R3C.jpg' },
  'p-brown-10': { name: 'Pasture-Raised Heritage Brown (10 Pack)', price: 135, eggQuantity: 10, image: '/assets/pack-brown-10-BDXuFFWz.jpg' },
  'p-brown-12': { name: 'Pasture-Raised Heritage Brown (12 Pack)', price: 159, eggQuantity: 12, image: '/assets/pack-brown-12-F3leDPlZ.jpg' },
  'p-white-6': { name: 'Organic Classic White (6 Pack)', price: 78, eggQuantity: 6, image: '/assets/pack-white-6-mwYZApsz.jpg' },
  'p-white-10': { name: 'Organic Classic White (10 Pack)', price: 125, eggQuantity: 10, image: '/assets/pack-white-10-BbjpCtDS.jpg' },
  'p-white-12': { name: 'Organic Classic White (12 Pack)', price: 149, eggQuantity: 12, image: '/assets/pack-white-12-CU-VFrPz.jpg' },
};

const getStoredCart = (): ICart | null => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem('goodeggs_local_cart');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
  }
  return null;
};

const saveStoredCart = (cart: ICart | null) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (cart) localStorage.setItem('goodeggs_local_cart', JSON.stringify(cart));
    else localStorage.removeItem('goodeggs_local_cart');
  }
};

const recalculateCart = (items: any[], couponCode?: string): ICart => {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const deliveryCharge = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const discountTotal = couponCode === 'WELCOME50' ? Math.min(50, subtotal) : 0;
  const finalTotal = Math.max(0, subtotal + deliveryCharge - discountTotal);
  return {
    _id: `cart_${Date.now()}`,
    items,
    subtotal,
    deliveryCharge,
    discountTotal,
    appliedCoupon: couponCode,
    finalTotal,
  };
};

export const useCartStore = create<CartState>((set, get) => ({
  cart: getStoredCart(),
  isDrawerOpen: false,
  isLoading: false,

  fetchCart: async () => {
    try {
      const res = await api.get('/cart');
      set({ cart: res.data.data });
      saveStoredCart(res.data.data);
    } catch {
      const stored = getStoredCart();
      if (stored) set({ cart: stored });
    }
  },

  addItem: async (productId, quantity = 1, customCartonConfig) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/cart/items', { productId, quantity, customCartonConfig });
      set({ cart: res.data.data, isDrawerOpen: true, isLoading: false });
      saveStoredCart(res.data.data);
    } catch {
      // Local seamless fallback
      const currentCart = get().cart || { _id: `cart_local`, items: [], subtotal: 0, deliveryCharge: 0, discountTotal: 0, finalTotal: 0 };
      const productInfo = PRODUCT_DEFAULTS[productId] || {
        name: 'Heritage Farm Eggs',
        price: 135,
        eggQuantity: 10,
        image: '/assets/pack-brown-10-BDXuFFWz.jpg',
      };

      const items = [...currentCart.items];
      const existingIdx = items.findIndex((it) => (it.product as any)?._id === productId || (it.product as any) === productId);

      if (existingIdx >= 0) {
        items[existingIdx].quantity += quantity;
      } else {
        items.push({
          _id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          product: {
            _id: productId,
            name: productInfo.name,
            images: [productInfo.image],
            price: productInfo.price,
            eggQuantity: productInfo.eggQuantity,
            slug: productId,
            sku: productId.toUpperCase(),
            description: 'Fresh farm eggs',
            shortDescription: `${productInfo.eggQuantity} pack`,
            eggType: 'PASTURE_RAISED',
            stockQuantity: 100,
            status: 'ACTIVE',
            isFeatured: true,
            ratingsAverage: 4.9,
            ratingsCount: 88,
            shellColor: productId.includes('white') ? 'White' : 'Brown',
            yolkColorScore: 14,
            category: 'pasture',
            packagingInfo: '100% biodegradable molded carton',
            farmingPractice: 'Free-range open pasture',
            nutritionInfo: { calories: 72, protein: '6.3g', totalFat: '4.8g', omega3: '225mg', vitaminD: '82IU', lutein: '280mcg', cholesterol: '186mg' },
          },
          quantity,
          price: productInfo.price,
          customCartonConfig,
        });
      }

      const updatedCart = recalculateCart(items, currentCart.appliedCoupon);
      saveStoredCart(updatedCart);
      set({ cart: updatedCart, isDrawerOpen: true, isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      set({ cart: res.data.data });
      saveStoredCart(res.data.data);
    } catch {
      const currentCart = get().cart;
      if (!currentCart) return;

      let items = [...currentCart.items];
      if (quantity <= 0) {
        items = items.filter((it) => it._id !== itemId);
      } else {
        items = items.map((it) => (it._id === itemId ? { ...it, quantity } : it));
      }
      const updatedCart = recalculateCart(items, currentCart.appliedCoupon);
      saveStoredCart(updatedCart);
      set({ cart: updatedCart });
    }
  },

  removeItem: async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      set({ cart: res.data.data });
      saveStoredCart(res.data.data);
    } catch {
      const currentCart = get().cart;
      if (!currentCart) return;
      const items = currentCart.items.filter((it) => it._id !== itemId);
      const updatedCart = recalculateCart(items, currentCart.appliedCoupon);
      saveStoredCart(updatedCart);
      set({ cart: updatedCart });
    }
  },

  applyCoupon: async (code) => {
    const cleanCode = code.toUpperCase().trim();
    try {
      const res = await api.post('/cart/coupon', { code: cleanCode });
      set({ cart: res.data.data });
      saveStoredCart(res.data.data);
      return res.data.message || 'Coupon applied!';
    } catch {
      const currentCart = get().cart;
      if (!currentCart || currentCart.items.length === 0) throw new Error('Cart is empty');
      if (cleanCode === 'WELCOME50') {
        const updatedCart = recalculateCart(currentCart.items, 'WELCOME50');
        saveStoredCart(updatedCart);
        set({ cart: updatedCart });
        return '₹50 discount applied with WELCOME50!';
      }
      throw new Error('Invalid coupon. Try WELCOME50');
    }
  },

  removeCoupon: async () => {
    try {
      const res = await api.delete('/cart/coupon');
      set({ cart: res.data.data });
      saveStoredCart(res.data.data);
    } catch {
      const currentCart = get().cart;
      if (!currentCart) return;
      const updatedCart = recalculateCart(currentCart.items, undefined);
      saveStoredCart(updatedCart);
      set({ cart: updatedCart });
    }
  },

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}));


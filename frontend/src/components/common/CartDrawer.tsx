import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag, CheckCircle2, UserCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore.js';
import { useAuthStore } from '../../stores/authStore.js';
import styles from './CartDrawer.module.scss';

export const CartDrawer: React.FC = () => {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem, applyCoupon, removeCoupon } =
    useCartStore();
  const { user } = useAuthStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const navigate = useNavigate();

  const subtotal = cart?.subtotal || 0;
  const deliveryCharge = cart?.deliveryCharge || 0;
  const discountTotal = cart?.discountTotal || 0;
  const finalTotal = cart?.finalTotal || 0;

  const freeDeliveryThreshold = 499;
  const amountNeededForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError('');
    setCouponSuccess('');
    try {
      const msg = await applyCoupon(couponInput.trim());
      setCouponSuccess(msg);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    }
  };

  const handleCheckout = () => {
    closeDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className={styles.overlay} onClick={closeDrawer}>
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className={styles.header}>
              <div className={styles.headerTitle}>
                <ShoppingBag size={22} className={styles.bagIcon} />
                <h3>Your Morning Basket</h3>
                <span className={styles.itemCount}>
                  ({cart?.items.reduce((s, i) => s + i.quantity, 0) || 0})
                </span>
              </div>
              <button onClick={closeDrawer} className={styles.closeBtn} aria-label="Close cart drawer">
                <X size={20} />
              </button>
            </div>

            {/* Free Delivery Bar */}
            <div className={styles.deliveryProgressCard}>
              <div className={styles.progressText}>
                {amountNeededForFree > 0 ? (
                  <span>
                    Add <strong>₹{amountNeededForFree}</strong> more to unlock <strong>FREE Morning Delivery</strong>
                  </span>
                ) : (
                  <span className={styles.freeAchieved}>
                    <CheckCircle2 size={15} /> You've unlocked FREE Doorstep Delivery!
                  </span>
                )}
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${freeDeliveryProgress}%` }}
                />
              </div>
            </div>

            {/* User Auth Status Banner */}
            <div className={styles.cartAuthNotice}>
              {user ? (
                <span className={styles.loggedInBadge}>
                  <UserCheck size={14} /> Signed in as <strong>{user.name}</strong> ({user.role})
                </span>
              ) : (
                <>
                  <span>Sign in for saved address &amp; tax invoices</span>
                  <button
                    onClick={() => {
                      closeDrawer();
                      navigate('/login');
                    }}
                    className={styles.authPromptAction}
                  >
                    Sign In →
                  </button>
                </>
              )}
            </div>

            {/* Items List */}
            <div className={styles.itemsList}>
              {!cart?.items || cart.items.length === 0 ? (
                <div className={styles.emptyCart}>
                  <div className={styles.emptyIcon}>🥚</div>
                  <h4>Your basket is empty</h4>
                  <p>Wake up to fresh golden yolks. Choose your farm pack!</p>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      closeDrawer();
                      navigate('/shop');
                    }}
                  >
                    Browse Egg Packs
                  </button>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item._id} className={styles.cartItem}>
                    <img
                      src={
                        item.product?.images?.[0] ||
                        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.product?.name || 'Egg item'}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemName}>
                        {item.customCartonConfig?.label || item.product?.name}
                      </h4>
                      <p className={styles.itemMeta}>
                        {item.product?.eggQuantity ? `${item.product.eggQuantity} Eggs • ` : ''}
                        ₹{item.price} each
                      </p>

                      <div className={styles.quantityRow}>
                        <div className={styles.quantitySelector}>
                          <button
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className={styles.qtyBtn}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className={styles.qtyBtn}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <span className={styles.itemTotal}>₹{item.price * item.quantity}</span>

                        <button
                          onClick={() => removeItem(item._id)}
                          className={styles.removeBtn}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cart && cart.items.length > 0 && (
              <div className={styles.footer}>
                {/* Coupon Application */}
                <div className={styles.couponSection}>
                  {cart.appliedCoupon ? (
                    <div className={styles.appliedCouponTag}>
                      <Tag size={14} />
                      <span>Code <strong>{cart.appliedCoupon}</strong> applied!</span>
                      <button onClick={removeCoupon} className={styles.removeCouponBtn}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                      <input
                        type="text"
                        placeholder="Promo code (e.g. WELCOME50)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className={styles.couponInput}
                      />
                      <button type="submit" className={styles.couponApplyBtn}>
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && <p className={styles.couponError}>{couponError}</p>}
                  {couponSuccess && <p className={styles.couponSuccess}>{couponSuccess}</p>}
                </div>

                {/* Subtotals */}
                <div className={styles.summaryTable}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  {discountTotal > 0 && (
                    <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                      <span>Coupon Discount</span>
                      <span>-₹{discountTotal}</span>
                    </div>
                  )}
                  <div className={styles.summaryRow}>
                    <span>Doorstep Delivery</span>
                    <span>{deliveryCharge === 0 ? <span className={styles.freeTag}>FREE</span> : `₹${deliveryCharge}`}</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span>Total Amount</span>
                    <span className={styles.totalVal}>₹{finalTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button onClick={handleCheckout} className={styles.checkoutBtn}>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { useCartStore } from '../stores/cartStore.js';
import styles from './CartPage.module.scss';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, applyCoupon, removeCoupon } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const navigate = useNavigate();

  const subtotal = cart?.subtotal || 0;
  const deliveryCharge = cart?.deliveryCharge || 0;
  const discountTotal = cart?.discountTotal || 0;
  const finalTotal = cart?.finalTotal || 0;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      const msg = await applyCoupon(couponCode.trim());
      setCouponMsg({ text: msg });
      setCouponCode('');
    } catch (err: any) {
      setCouponMsg({ text: err.message || 'Invalid coupon', error: true });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.pageHeader}>
          <Link to="/shop" className={styles.backLink}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <h1 className={styles.title}>Your Morning Basket</h1>
        </div>

        {!cart?.items || cart.items.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyEgg}>🥚</span>
            <h2>Your basket is empty</h2>
            <p>Fill it with pasture-raised fresh eggs for your morning breakfast.</p>
            <Link to="/shop" className="btn-primary">
              Explore Farm Packs
            </Link>
          </div>
        ) : (
          <div className={styles.cartLayout}>
            {/* Items Column */}
            <div className={styles.itemsCol}>
              <div className={styles.itemsHeader}>
                <span>Product</span>
                <span>Quantity</span>
                <span>Total</span>
              </div>

              <div className={styles.itemsList}>
                {cart.items.map((item) => (
                  <div key={item._id} className={styles.cartRow}>
                    <div className={styles.productCell}>
                      <img
                        src={
                          item.product?.images?.[0] ||
                          'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=200&q=80'
                        }
                        alt=""
                        className={styles.itemImg}
                      />
                      <div>
                        <h4 className={styles.itemName}>
                          {item.customCartonConfig?.label || item.product?.name}
                        </h4>
                        <span className={styles.itemPrice}>₹{item.price} each</span>
                        {item.customCartonConfig?.eggBreakdown && (
                          <span className={styles.customBadge}>Custom Built Carton</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.quantityCell}>
                      <div className={styles.qtyBox}>
                        <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.totalCell}>
                      <span className={styles.subtotalVal}>₹{item.price * item.quantity}</span>
                      <button
                        onClick={() => removeItem(item._id)}
                        className={styles.deleteBtn}
                        aria-label="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Column */}
            <div className={styles.summaryCol}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>

                {/* Coupon Box */}
                <div className={styles.couponWrapper}>
                  {cart.appliedCoupon ? (
                    <div className={styles.appliedTag}>
                      <Tag size={15} />
                      <span>Code <strong>{cart.appliedCoupon}</strong> active</span>
                      <button onClick={removeCoupon} className={styles.removeCoupon}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME50)"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={styles.couponInput}
                      />
                      <button type="submit" className={styles.couponBtn}>
                        Apply
                      </button>
                    </form>
                  )}
                  {couponMsg && (
                    <p className={couponMsg.error ? styles.errMsg : styles.successMsg}>
                      {couponMsg.text}
                    </p>
                  )}
                </div>

                <div className={styles.priceBreakdown}>
                  <div className={styles.priceRow}>
                    <span>Subtotal</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  {discountTotal > 0 && (
                    <div className={`${styles.priceRow} ${styles.discountText}`}>
                      <span>Coupon Discount</span>
                      <strong>-₹{discountTotal}</strong>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span>Doorstep Morning Delivery</span>
                    <strong>{deliveryCharge === 0 ? <span className={styles.freeBadge}>FREE</span> : `₹${deliveryCharge}`}</strong>
                  </div>
                  <div className={`${styles.priceRow} ${styles.totalRow}`}>
                    <span>Total Amount</span>
                    <strong className={styles.finalTotalVal}>₹{finalTotal}</strong>
                  </div>
                </div>

                <button onClick={() => navigate('/checkout')} className={styles.checkoutBtn}>
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};


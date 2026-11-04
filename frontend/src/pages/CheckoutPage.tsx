import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CreditCard, Banknote, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { useCartStore } from '../stores/cartStore.js';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../services/api.js';
import styles from './CheckoutPage.module.scss';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const loadRazorpayScript = async (): Promise<boolean> => {
  if (window.Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const CheckoutPage: React.FC = () => {
  const { cart, fetchCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560038');
  const [instructions, setInstructions] = useState('Leave with security or doorstep before 8 AM');
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'COD'>('RAZORPAY');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchCart();
    if (user?.addresses && user.addresses.length > 0) {
      const def = user.addresses.find((a) => a.isDefault) || user.addresses[0];
      setFullName(def.fullName);
      setPhone(def.phone);
      setStreet(def.street);
      setCity(def.city);
      setState(def.state);
      setPincode(def.pincode);
      if (def.deliveryInstructions) setInstructions(def.deliveryInstructions);
    }
  }, [user, fetchCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart?.items || cart.items.length === 0) {
      setErrorMsg('Your basket is empty');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setErrorMsg('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      if (paymentMethod === 'RAZORPAY' && !(await loadRazorpayScript())) {
        setErrorMsg('Could not load Razorpay Checkout. Check your internet connection and try again.');
        setLoading(false);
        return;
      }

      const orderPayload = {
        shippingAddress: {
          fullName,
          phone,
          street,
          city,
          state,
          pincode,
          deliveryInstructions: instructions,
        },
        paymentMethod,
      };

      // 1. Create order on backend
      const res = await api.post('/orders', orderPayload);
      const { order, razorpay } = res.data.data;

      // 2. If COD, order is placed immediately
      if (paymentMethod === 'COD') {
        const existingOrders = JSON.parse(localStorage.getItem('goodeggs_local_orders') || '[]');
        existingOrders.unshift(order);
        localStorage.setItem('goodeggs_local_orders', JSON.stringify(existingOrders));
        localStorage.removeItem('goodeggs_local_cart');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        navigate(`/order-confirmation/${order._id}`);
        return;
      }

      // 3. Razorpay flow
      if (!razorpay?.keyId || !razorpay?.id || !window.Razorpay) {
        throw new Error('Razorpay payment is not configured. Please contact the store.');
      }

      const razorpayKey = razorpay.keyId;
      const options = {
        key: razorpayKey,
        amount: razorpay.amount,
        currency: razorpay.currency,
        name: 'GoodEggs Agritech',
        description: `Morning Basket Order #${order.orderNumber}`,
        image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=200&q=80',
        order_id: razorpay.id,
        prefill: {
          name: fullName,
          email: user?.email || 'customer@goodeggs.farm',
          contact: phone,
        },
        theme: {
          color: '#FFB800',
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/orders/verify-payment', {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            const verifiedOrder = verifyRes.data.data;
            const existingOrders = JSON.parse(localStorage.getItem('goodeggs_local_orders') || '[]');
            existingOrders.unshift(verifiedOrder);
            localStorage.setItem('goodeggs_local_orders', JSON.stringify(existingOrders));
            localStorage.removeItem('goodeggs_local_cart');
            useCartStore.setState({ cart: null });

            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            setLoading(false);
            navigate(`/order-confirmation/${verifiedOrder._id}`);
          } catch (err: any) {
            setErrorMsg(err.response?.data?.message || 'Payment signature verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setErrorMsg(`Payment failed: ${resp.error?.description || 'Please try another payment method.'}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        <div className={styles.header}>
          <Link to="/cart" className={styles.backLink}>
            <ArrowLeft size={16} /> Return to Basket
          </Link>
          <h1 className={styles.title}>Morning Delivery Checkout</h1>
        </div>

        {errorMsg && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCheckout} className={styles.checkoutGrid}>
          {/* Left Column: Delivery Address & Payment Method */}
          <div className={styles.formCol}>
            {/* Address Card */}
            <div className={styles.sectionCard}>
              <h3 className={styles.cardTitle}>1. Doorstep Delivery Address</h3>
              <p className={styles.cardSubtitle}>
                Our delivery rider will deliver your sealed egg basket before 8:00 AM.
              </p>

              <div className={styles.inputGrid}>
                <div className={styles.fieldFull}>
                  <label>Full Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Arjun Kapoor"
                  />
                </div>

                <div className={styles.fieldHalf}>
                  <label>Phone Number (for gate delivery) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className={styles.fieldHalf}>
                  <label>Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 560038"
                  />
                </div>

                <div className={styles.fieldFull}>
                  <label>Flat / House No. & Street Name *</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 402, Sunshine Meadows, 100ft Rd"
                  />
                </div>

                <div className={styles.fieldHalf}>
                  <label>City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className={styles.fieldHalf}>
                  <label>State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>

                <div className={styles.fieldFull}>
                  <label>Delivery Instructions (Optional)</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Leave in milk crate at front door"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className={styles.sectionCard}>
              <h3 className={styles.cardTitle}>2. Payment Method</h3>
              <p className={styles.cardSubtitle}>
                Protected by 256-bit SSL encryption. We never store card details.
              </p>

              <div className={styles.paymentOptions}>
                <label
                  className={`${styles.paymentLabel} ${paymentMethod === 'RAZORPAY' ? styles.paymentSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RAZORPAY"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                  />
                  <div className={styles.paymentIcon}>
                    <CreditCard size={20} />
                  </div>
                  <div className={styles.paymentInfo}>
                    <strong>Razorpay Instant Checkout</strong>
                    <span>UPI (GPay, PhonePe, Paytm), Credit/Debit Card, Netbanking</span>
                  </div>
                </label>

                <label
                  className={`${styles.paymentLabel} ${paymentMethod === 'COD' ? styles.paymentSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <div className={styles.paymentIcon}>
                    <Banknote size={20} />
                  </div>
                  <div className={styles.paymentInfo}>
                    <strong>Cash on Morning Delivery</strong>
                    <span>Pay in cash or UPI scan when rider arrives at your doorstep</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order CTA */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h3 className={styles.cardTitle}>Your Morning Order</h3>

              {/* Items List */}
              <div className={styles.itemsScroll}>
                {cart?.items.map((item) => (
                  <div key={item._id} className={styles.itemRow}>
                    <img
                      src={
                        item.product?.images?.[0] ||
                        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=150&q=80'
                      }
                      alt=""
                    />
                    <div className={styles.itemMeta}>
                      <h4>{item.customCartonConfig?.label || item.product?.name}</h4>
                      <span>Qty: {item.quantity}</span>
                    </div>
                    <strong className={styles.itemPrice}>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className={styles.calcList}>
                <div className={styles.calcRow}>
                  <span>Subtotal</span>
                  <span>₹{cart?.subtotal || 0}</span>
                </div>
                {cart?.discountTotal ? (
                  <div className={`${styles.calcRow} ${styles.discountText}`}>
                    <span>Coupon Discount</span>
                    <span>-₹{cart.discountTotal}</span>
                  </div>
                ) : null}
                <div className={styles.calcRow}>
                  <span>Morning Delivery</span>
                  <span>{cart?.deliveryCharge === 0 ? <strong style={{ color: '#2E7D32' }}>FREE</strong> : `₹${cart?.deliveryCharge}`}</span>
                </div>
                <div className={`${styles.calcRow} ${styles.totalRow}`}>
                  <span>Total Amount</span>
                  <strong className={styles.finalTotal}>₹{cart?.finalTotal || 0}</strong>
                </div>
              </div>

              {/* Submit CTA */}
              <button type="submit" disabled={loading} className={styles.placeOrderBtn}>
                <Sparkles size={18} />
                <span>
                  {loading
                    ? 'Securing Order...'
                    : paymentMethod === 'RAZORPAY'
                    ? `Pay ₹${cart?.finalTotal} via Razorpay`
                    : 'Confirm Morning Order'}
                </span>
              </button>

              <div className={styles.guaranteeText}>
                <ShieldCheck size={16} color="#2E7D32" />
                <span>Zero-crack arrival guarantee • 1-click replacement</span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

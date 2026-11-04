import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, CalendarDays, ChevronRight, AlertCircle, ShoppingBag, FileText, MapPin } from 'lucide-react';
import { api } from '../services/api.js';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { IOrder } from '../types/index.js';
import styles from './OrdersPage.module.scss';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        const apiOrders = res.data.data || [];
        const localOrders = JSON.parse(localStorage.getItem('goodeggs_local_orders') || '[]');
        const combined = [...apiOrders];
        for (const lo of localOrders) {
          if (!combined.some((co) => co._id === lo._id || co.orderNumber === lo.orderNumber)) {
            combined.push(lo);
          }
        }
        setOrders(combined);
      } catch (err: any) {
        const localOrders = JSON.parse(localStorage.getItem('goodeggs_local_orders') || '[]');
        if (localOrders.length > 0) {
          setOrders(localOrders);
        } else {
          setError(err.response?.data?.message || 'Failed to load your orders.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusClass = (status: string) =>
    styles[`status${status.toLowerCase().replace(/(^|_)([a-z])/g, (_, _separator, letter: string) => letter.toUpperCase())}`] ||
    styles.statusPending;

  return (
    <div className={styles.pageWrapper}>
      <Navbar />
      <main className={styles.container}>
        <div className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>Your GoodEggs account</span>
            <h1 className={styles.pageTitle}>My orders</h1>
            <p className={styles.pageSubtitle}>Track deliveries and find invoices for your farm-fresh orders.</p>
          </div>
          {!loading && orders.length > 0 && (
            <div className={styles.orderCount}>
              <Package size={18} />
              <span>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorNotice} role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.ordersList} aria-label="Loading orders">
            {[1, 2].map((item) => <div key={item} className={styles.loadingCard} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}><Package size={32} /></span>
            <h2>No orders yet</h2>
            <p>You haven’t ordered any fresh pasture eggs yet. Better mornings begin right here!</p>
            <Link to="/shop" className={styles.shopLink}>
              <ShoppingBag size={18} />
              <span>Explore the farm shop</span>
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderTopRow}>
                  <div className={styles.orderHeading}>
                    <span className={styles.orderLabel}>Order</span>
                    <strong className={styles.orderNum}>#{order.orderNumber}</strong>
                    <span className={styles.orderDate}>
                      <CalendarDays size={14} />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.statusBadge} ${getStatusClass(order.orderStatus)}`}>
                      {order.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className={`${styles.paymentBadge} ${order.paymentStatus === 'PAID' ? styles.paid : ''}`}>
                      {order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.orderContent}>
                  <div className={styles.orderItemsPreview}>
                    {order.items.slice(0, 3).map((item, idx) => (
                      <div key={`${item.product}-${idx}`} className={styles.previewItem}>
                        {item.image ? (
                          <img src={item.image} alt="" className={styles.itemThumb} />
                        ) : (
                          <span className={styles.itemPlaceholder}><Package size={18} /></span>
                        )}
                        <div className={styles.itemMeta}>
                          <span className={styles.itemName}>{item.name}</span>
                          <span className={styles.itemQty}>{item.quantity} × ₹{item.price}</span>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className={styles.moreItems}>+{order.items.length - 3} more items</span>
                    )}
                  </div>

                  <div className={styles.orderSummary}>
                    <div className={styles.delivery}>
                      <MapPin size={15} />
                      <span>{order.shippingAddress?.city || 'Delivery address'}</span>
                    </div>
                    <div className={styles.totalBlock}>
                      <span>Order total</span>
                      <strong>₹{order.finalTotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <Link to={`/order-confirmation/${order._id}`} className={styles.viewOrderLink}>
                    <FileText size={16} />
                    <span>View order &amp; invoice</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, ChevronRight, AlertCircle, Eye, ShoppingBag, FileText, Printer } from 'lucide-react';
import { api } from '../services/api.js';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { IOrder } from '../types/index.js';
import styles from './ProfilePage.module.scss';

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

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return styles.statusSuccess;
      case 'CANCELLED':
      case 'REFUNDED':
        return styles.statusDanger;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return styles.statusWarning;
      default:
        return styles.statusNeutral;
    }
  };

  return (
    <div className={styles.profileWrapper}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Orders &amp; Farm Deliveries</h1>
          <p className={styles.pageSubtitle}>
            Track your morning egg shipments, review past deliveries, and download receipts.
          </p>
        </div>

        {error && (
          <div className={styles.errorNotice}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loadingBox}>
            <p>Loading your farm orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <Package size={56} className={styles.emptyIcon} />
            <h2>No Orders Yet</h2>
            <p>You haven’t ordered any fresh pasture eggs yet. Better mornings begin right here!</p>
            <Link to="/shop" className={styles.primaryActionBtn}>
              <ShoppingBag size={18} />
              <span>Explore Farm Shop</span>
            </Link>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderTopRow}>
                  <div>
                    <span className={styles.orderNum}>Order #{order.orderNumber}</span>
                    <span className={styles.orderDate}>
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`${styles.statusBadge} ${getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className={styles.orderItemsPreview}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.previewItem}>
                      <img src={item.image} alt={item.name} className={styles.itemThumb} />
                      <div className={styles.itemMeta}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemQty}>
                          Qty: {item.quantity} × ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.orderBottomRow}>
                  <div className={styles.totalBlock}>
                    <span>Total Amount</span>
                    <strong>₹{order.finalTotal}</strong>
                  </div>

                  <div className={styles.actionsBlock}>
                    <Link to={`/order-confirmation/${order._id}`} className={styles.viewTimelineBtn}>
                      <FileText size={16} />
                      <span>Payment Slip & Tracking</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};


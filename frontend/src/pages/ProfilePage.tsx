import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, MapPin, Package, LogOut, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { useAuthStore } from '../stores/authStore.js';
import { IOrder, IAddress } from '../types/index.js';
import { api } from '../services/api.js';
import styles from './ProfilePage.module.scss';

export const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, logout, addAddress, deleteAddress, fetchProfile } = useAuthStore();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses'>('orders');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // New Address State
  const [newAddr, setNewAddr] = useState<IAddress>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    deliveryInstructions: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();

    const fetchMyOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to load my orders:', err);
      }
    };
    fetchMyOrders();
  }, [isAuthenticated, navigate, fetchProfile]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddr);
      setShowAddressForm(false);
      setNewAddr({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        deliveryInstructions: '',
      });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* User Card */}
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            <UserIcon size={36} color="#FFB800" />
          </div>
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{user?.name}</h1>
            <p className={styles.userEmail}>{user?.email}</p>
            {user?.phone && <span className={styles.userPhone}>{user.phone}</span>}
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabsRow}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={18} />
            <span>My Morning Orders ({orders.length})</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'addresses' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin size={18} />
            <span>Saved Addresses ({user?.addresses?.length || 0})</span>
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className={styles.ordersTab}>
            {orders.length === 0 ? (
              <div className={styles.emptyCard}>
                <span className={styles.emptyIcon}>📦</span>
                <h3>No orders placed yet</h3>
                <p>Taste the pasture difference. Pick your first egg pack!</p>
                <Link to="/shop" className="btn-primary">
                  Shop Fresh Packs
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((ord) => (
                  <div key={ord._id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <strong className={styles.ordNum}>#{ord.orderNumber}</strong>
                        <span className={styles.ordDate}>
                          Placed on {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`${styles.statusBadge} ${styles[ord.orderStatus.toLowerCase()]}`}>
                        {ord.orderStatus}
                      </span>
                    </div>

                    <div className={styles.orderItems}>
                      {ord.items.map((item, i) => (
                        <div key={i} className={styles.itemThumb}>
                          <img src={item.image} alt={item.name} />
                          <span>
                            {item.name} (x{item.quantity})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.orderBottom}>
                      <div>
                        <span className={styles.totalLabel}>Total:</span>
                        <strong className={styles.totalAmount}>₹{ord.finalTotal}</strong>
                      </div>
                      <Link to={`/order-confirmation/${ord._id}`} className={styles.trackLink}>
                        <span>Track Live Progress</span>
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className={styles.addressesTab}>
            <div className={styles.addressTop}>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn-primary"
              >
                <Plus size={16} />
                <span>{showAddressForm ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {showAddressForm && (
              <form onSubmit={handleCreateAddress} className={styles.addressForm}>
                <h3>New Morning Delivery Address</h3>
                <div className={styles.formGrid}>
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code (e.g. 560038)"
                    maxLength={6}
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Flat / House Number"
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    style={{ gridColumn: 'span 2' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  />
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                  Save Address
                </button>
              </form>
            )}

            <div className={styles.addressesGrid}>
              {user?.addresses?.map((addr) => (
                <div key={addr._id} className={styles.addressCard}>
                  <div className={styles.addrHeader}>
                    <strong>{addr.fullName}</strong>
                    {addr.isDefault && <span className={styles.defaultPill}>Default</span>}
                  </div>
                  <p className={styles.addrStreet}>{addr.street}</p>
                  <p className={styles.addrCity}>
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className={styles.addrPhone}>Phone: {addr.phone}</p>
                  <button
                    onClick={() => addr._id && deleteAddress(addr._id)}
                    className={styles.delAddrBtn}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};


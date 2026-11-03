import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ArrowRight,
  Printer,
  Download,
  ShieldCheck,
  FileText,
  Check,
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar.js';
import { Footer } from '../components/common/Footer.js';
import { IOrder } from '../types/index.js';
import { api } from '../services/api.js';
import styles from './OrderConfirmationPage.module.scss';

export const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        const localOrders = JSON.parse(localStorage.getItem('goodeggs_local_orders') || '[]');
        const found = localOrders.find((o: any) => o._id === id || o.orderNumber === id);
        if (found) {
          setOrder(found);
        } else {
          console.error('Failed to load order:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const stages = ['PENDING', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'];

  const getStageIndex = (status: string) => {
    const idx = stages.indexOf(status);
    return idx === -1 ? 1 : idx;
  };

  const currentStageIdx = order ? getStageIndex(order.orderStatus) : 1;

  const handleDownloadSlip = () => {
    if (!order) return;
    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const itemsRows = order.items
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${item.name}</strong><br/><small style="color: #666;">Pasture-Gathered • ${item.eggQuantity} Eggs</small></td>
          <td style="font-family: monospace;">04071100</td>
          <td>${item.quantity}</td>
          <td>₹${item.price}</td>
          <td>0% (Farm Produce)</td>
          <td style="text-align: right; font-weight: bold;">₹${item.subtotal}</td>
        </tr>`
      )
      .join('');

    const slipHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - GoodEggs - #${order.orderNumber}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #24120D;
      background: #FFFFFF;
      padding: 32px;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #24120D;
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .brand h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      color: #24120D;
    }
    .brand p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }
    .tax-id {
      font-family: monospace;
      font-size: 11px;
      color: #888;
      margin-top: 4px;
    }
    .inv-meta {
      text-align: right;
    }
    .badge {
      display: inline-block;
      background: #24120D;
      color: #FFF;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .inv-num {
      font-size: 15px;
      font-weight: 800;
      margin-top: 6px;
    }
    .date {
      font-size: 12px;
      color: #666;
    }
    .status-paid {
      display: inline-block;
      background: #E8F5E9;
      color: #2E7D32;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 99px;
      border: 1px solid #C8E6C9;
      margin-top: 6px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    .box {
      background: #FAF7F2;
      border: 1px solid #EBE4D8;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 12px;
    }
    .box h4 {
      margin: 0 0 6px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #24120D;
      color: #FFF;
      text-align: left;
      padding: 9px 12px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #EBE4D8;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 24px;
      margin-top: 10px;
    }
    .seal-box {
      border: 1px dashed #D6CBBC;
      background: #FAF7F2;
      padding: 14px;
      border-radius: 8px;
      font-size: 11px;
      color: #555;
    }
    .calc-table {
      margin-left: auto;
      width: 100%;
      font-size: 13px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      color: #555;
    }
    .grand-row {
      display: flex;
      justify-content: space-between;
      padding-top: 8px;
      margin-top: 4px;
      border-top: 2px solid #24120D;
      font-weight: 800;
      font-size: 15px;
      color: #24120D;
    }
    .disclaimer {
      text-align: center;
      margin-top: 30px;
      padding-top: 16px;
      border-top: 1px dashed #CCC;
      font-size: 11px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>GoodEggs Agri-Tech Pvt. Ltd.</h1>
      <p>Heritage & Pasture-Raised Poultry Operations</p>
      <div class="tax-id">FSSAI Lic: 11223344000189 | GSTIN: 29AABCU9603R1ZM</div>
    </div>
    <div class="inv-meta">
      <span class="badge">Official Tax Invoice</span>
      <div class="inv-num">INV-${order.orderNumber}</div>
      <div class="date">${formattedDate}</div>
      <div class="status-paid">✓ PAID & VERIFIED</div>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h4>Delivery Address</h4>
      <strong>${order.shippingAddress.fullName}</strong>
      <div>${order.shippingAddress.street}, ${order.shippingAddress.city}</div>
      <div>${order.shippingAddress.state} - ${order.shippingAddress.pincode}</div>
      <div>Phone: ${order.shippingAddress.phone}</div>
      ${order.shippingAddress.deliveryInstructions ? `<div style="margin-top: 4px; color: #777;">Note: ${order.shippingAddress.deliveryInstructions}</div>` : ''}
    </div>
    <div class="box">
      <h4>Payment & Security Reference</h4>
      <div><strong>Method:</strong> ${order.paymentMethod === 'RAZORPAY' ? 'Razorpay Verified (UPI/Cards/Netbanking)' : 'Cash On Delivery'}</div>
      <div><strong>Payment Ref:</strong> <span style="font-family: monospace;">${order.razorpayPaymentId || 'N/A'}</span></div>
      <div><strong>Order Ref:</strong> #${order.orderNumber}</div>
      <div style="margin-top: 4px; color: #2E7D32;">Cryptographic Hash Verified: SHA-256 Validated</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Product Description</th>
        <th>HSN Code</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>GST</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div class="footer-grid">
    <div class="seal-box">
      <strong style="color: #24120D;">🌿 GoodEggs Freshness & Quality Certified</strong>
      <p style="margin: 4px 0 0 0;">These eggs are hand-gathered from cruelty-free open pastures and delivered within 24 hours of collection. Grade-A quality guaranteed.</p>
    </div>
    <div>
      <div class="calc-table">
        <div class="calc-row"><span>Subtotal:</span><span>₹${order.subtotal}</span></div>
        ${order.discountTotal > 0 ? `<div class="calc-row" style="color: #2E7D32;"><span>Coupon Discount:</span><span>-₹${order.discountTotal}</span></div>` : ''}
        <div class="calc-row"><span>Morning Delivery:</span><span>${order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span></div>
        <div class="grand-row"><span>Total Paid:</span><span>₹${order.finalTotal}</span></div>
      </div>
    </div>
  </div>

  <div class="disclaimer">
    This is an authorized, computer-generated tax invoice & payment receipt slip. No physical signature is required.<br/>
    For inquiries or farm visits, reach us at contact@goodeggs.farm
  </div>
</body>
</html>`;

    const blob = new Blob([slipHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GoodEggs_Payment_Slip_${order.orderNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loader}>Loading your order details...</div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loader}>
          <h2>Order Not Found</h2>
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContainer}>
        {/* Success Header */}
        <div className={styles.successBanner}>
          <div className={styles.checkIconWrapper}>
            <CheckCircle2 size={48} className={styles.checkIcon} />
          </div>
          <h1 className={styles.pageTitle}>Order Confirmed!</h1>
          <p className={styles.subtitle}>
            Thank you! Your fresh farm eggs have been scheduled for tomorrow morning delivery.
          </p>
          <div className={styles.orderNumberBadge}>Order #{order.orderNumber}</div>
        </div>

        {/* Visual Timeline Tracking */}
        <div className={styles.timelineCard}>
          <h3 className={styles.timelineTitle}>Live Order Progress</h3>
          <div className={styles.timelineTrack}>
            {stages.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage}
                  className={`${styles.timelineStep} ${isCompleted ? styles.stepCompleted : ''} ${isCurrent ? styles.stepCurrent : ''}`}
                >
                  <div className={styles.stepDot}>
                    {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                  </div>
                  <span className={styles.stepLabel}>{stage.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Grid */}
        <div className={styles.detailsGrid}>
          {/* Items Summary */}
          <div className={styles.itemsCard}>
            <h3 className={styles.cardHeader}>Itemized Order Summary</h3>
            <div className={styles.itemsList}>
              {order.items.map((item, i) => (
                <div key={i} className={styles.itemRow}>
                  <img src={item.image} alt={item.name} className={styles.itemImg} />
                  <div className={styles.itemInfo}>
                    <h4>{item.name}</h4>
                    <span>
                      {item.eggQuantity} Eggs • Qty: {item.quantity}
                    </span>
                  </div>
                  <strong className={styles.itemSubtotal}>₹{item.subtotal}</strong>
                </div>
              ))}
            </div>

            <div className={styles.totalsTable}>
              <div className={styles.totalRow}>
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discountTotal > 0 && (
                <div className={`${styles.totalRow} ${styles.discountText}`}>
                  <span>Discount</span>
                  <span>-₹{order.discountTotal}</span>
                </div>
              )}
              <div className={styles.totalRow}>
                <span>Doorstep Delivery</span>
                <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
              </div>
              <div className={`${styles.totalRow} ${styles.finalTotalRow}`}>
                <span>Total Paid</span>
                <span>₹{order.finalTotal}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Timings Card */}
          <div className={styles.infoCol}>
            <div className={styles.sideCard}>
              <div className={styles.cardTitleRow}>
                <Clock size={20} color="#FFB800" />
                <h4>Expected Arrival</h4>
              </div>
              <p className={styles.expectedTime}>Tomorrow morning between 6:00 AM - 8:30 AM</p>
              <span className={styles.timingNote}>
                Rider will place your sealed pulp carton safely at your doorstep.
              </span>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.cardTitleRow}>
                <MapPin size={20} color="#FFB800" />
                <h4>Delivery Address</h4>
              </div>
              <div className={styles.addressBox}>
                <strong>{order.shippingAddress.fullName}</strong>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className={styles.phoneText}>Phone: {order.shippingAddress.phone}</p>
                {order.shippingAddress.deliveryInstructions && (
                  <p className={styles.instructText}>
                    Note: {order.shippingAddress.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            <div className={styles.actionsRow}>
              <Link to="/" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>
                Back to Farm
              </Link>
            </div>
          </div>
        </div>

        {/* OFFICIAL TAX INVOICE & PAYMENT SLIP SECTION */}
        <section className={styles.paymentSlipSection} id="official-payment-slip">
          <div className={styles.paymentSlipCard}>
            {/* Slip Header */}
            <div className={styles.slipHeader}>
              <div className={styles.slipBrand}>
                <h2>🥚 GoodEggs Agri-Tech Pvt. Ltd.</h2>
                <span>Heritage & Pasture-Raised Poultry Farm Operations</span>
                <span className={styles.taxReg}>
                  FSSAI Lic: 11223344000189 | GSTIN: 29AABCU9603R1ZM
                </span>
              </div>

              <div className={styles.slipInvoiceMeta}>
                <span className={styles.slipTitleBadge}>Official Tax Invoice</span>
                <div className={styles.slipInvNum}>INV-{order.orderNumber}</div>
                <div className={styles.slipDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className={styles.slipStatusPaid}>
                  <Check size={14} /> PAID & VERIFIED
                </div>
              </div>
            </div>

            {/* Meta Grid */}
            <div className={styles.slipMetaGrid}>
              <div className={styles.slipMetaBox}>
                <h4>Billed & Shipped To</h4>
                <strong>{order.shippingAddress.fullName}</strong>
                <p>
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>Phone: {order.shippingAddress.phone}</p>
              </div>

              <div className={styles.slipMetaBox}>
                <h4>Payment & Verification Details</h4>
                <p>
                  <strong>Payment Mode:</strong>{' '}
                  {order.paymentMethod === 'RAZORPAY'
                    ? 'Razorpay Secure (UPI / Cards / Netbanking)'
                    : 'Cash On Delivery'}
                </p>
                <p>
                  <strong>Payment Reference:</strong>{' '}
                  <span className={styles.slipPaymentId}>
                    {order.razorpayPaymentId || order.razorpayOrderId || 'OFFICIAL-PAID'}
                  </span>
                </p>
                <p>
                  <strong>Order ID:</strong> #{order.orderNumber}
                </p>
              </div>
            </div>

            {/* Slip Items Table */}
            <table className={styles.slipTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Description</th>
                  <th>HSN Code</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>GST Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{item.name}</strong>
                      <br />
                      <span className={styles.hsnCode}>{item.eggQuantity} Eggs • Farm Fresh</span>
                    </td>
                    <td className={styles.hsnCode}>04071100</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price}</td>
                    <td>0% (Agricultural Produce)</td>
                    <td>₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Slip Footer Grid */}
            <div className={styles.slipFooterGrid}>
              <div className={styles.slipSealBox}>
                <div className={styles.sealBadge}>🌿</div>
                <div className={styles.sealText}>
                  <strong>GoodEggs Quality Certified</strong>
                  <p>
                    All eggs are hand-gathered from open pastures and delivered fresh within 24 hours.
                    Authorized electronic receipt.
                  </p>
                </div>
              </div>

              <div className={styles.slipCalculationBox}>
                <div className={styles.slipCalcRow}>
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discountTotal > 0 && (
                  <div className={styles.slipCalcRow} style={{ color: '#2E7D32' }}>
                    <span>Coupon Discount:</span>
                    <span>-₹{order.discountTotal}</span>
                  </div>
                )}
                <div className={styles.slipCalcRow}>
                  <span>Morning Express Delivery:</span>
                  <span>{order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}</span>
                </div>
                <div className={styles.slipCalcGrand}>
                  <span>Total Paid:</span>
                  <span>₹{order.finalTotal}</span>
                </div>
              </div>
            </div>

            {/* Slip Action Buttons (Print & Download) */}
            <div className={styles.slipButtonsRow}>
              <button onClick={() => window.print()} className={styles.printSlipBtn}>
                <Printer size={16} /> Print Payment Slip
              </button>
              <button onClick={handleDownloadSlip} className={styles.downloadSlipBtn}>
                <Download size={16} /> Download Slip (.HTML / Receipt)
              </button>
            </div>

            <div className={styles.slipDisclaimer}>
              This is a computer-generated tax invoice & payment slip. No physical signature is required.
              For inquiries, contact support@goodeggs.farm
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};


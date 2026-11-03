import { Resend } from 'resend';
import { ENV } from '../config/env.js';

let resendClient: Resend | null = null;
if (ENV.RESEND_API_KEY) {
  resendClient = new Resend(ENV.RESEND_API_KEY);
}

export class EmailService {
  private static async send(to: string, subject: string, html: string) {
    if (resendClient && ENV.RESEND_API_KEY) {
      try {
        await resendClient.emails.send({
          from: `GoodEggs Farm <${ENV.EMAIL_FROM}>`,
          to,
          subject,
          html,
        });
        console.log(`✉️ Email successfully dispatched to ${to}: ${subject}`);
        return;
      } catch (err: any) {
        console.warn(`⚠️ Resend dispatch failed (${err.message}). Falling back to dev logger.`);
      }
    }

    // Dev Fallback Log
    console.log(`\n================= [DEV EMAIL LOG] =================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Preview: ${html.substring(0, 150)}...`);
    console.log(`===================================================\n`);
  }

  static async sendWelcomeEmail(email: string, name: string) {
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FDF8EE; padding: 32px; border-radius: 16px; border: 1px solid #EFE4D2;">
        <h1 style="color: #2C1810; font-family: 'Georgia', serif; margin-bottom: 8px;">Welcome to GoodEggs, ${name}! 🥚</h1>
        <p style="color: #6B4E3D; font-size: 16px; line-height: 1.6;">
          Thank you for joining our community. We are passionate about bringing you the freshest, pasture-raised eggs ethically sourced from ethical family farms.
        </p>
        <div style="background: #FFFDF9; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #FFB800;">
          <p style="margin: 0; color: #2C1810; font-weight: 600;">Your mornings are about to get so much better.</p>
          <p style="margin: 4px 0 0; color: #8C6A54; font-size: 14px;">100% pasture-raised hens • Non-GMO grain • Morning farm gate dispatch</p>
        </div>
        <p style="color: #6B4E3D; font-size: 14px;">Happy breakfasting,<br/><strong>The GoodEggs Team</strong></p>
      </div>
    `;
    await this.send(email, 'Welcome to GoodEggs — Better Mornings Begin Here ☀️', html);
  }

  static async sendOrderConfirmation(email: string, order: any) {
    const itemsList = order.items
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #EFE4D2;">
          <td style="padding: 12px 0; color: #2C1810;"><strong>${item.name}</strong> (Qty: ${item.quantity})</td>
          <td style="padding: 12px 0; text-align: right; color: #2C1810; font-weight: 600;">₹${item.subtotal}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FDF8EE; padding: 32px; border-radius: 16px; border: 1px solid #EFE4D2;">
        <h1 style="color: #2C1810; font-family: 'Georgia', serif; margin-bottom: 8px;">Order Confirmed! 📦</h1>
        <p style="color: #6B4E3D; font-size: 15px;">Order <strong>#${order.orderNumber}</strong> has been received and is being prepared with care.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #E4D7C4; text-align: left; color: #8C6A54; font-size: 13px; text-transform: uppercase;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; color: #2C1810; font-weight: 700;">Total Paid:</td>
              <td style="padding-top: 16px; text-align: right; color: #FFB800; font-weight: 800; font-size: 18px;">₹${order.finalTotal}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background: #FFFDF9; padding: 16px; border-radius: 10px; margin: 20px 0;">
          <h4 style="margin: 0 0 6px; color: #2C1810;">Delivery Address</h4>
          <p style="margin: 0; color: #6B4E3D; font-size: 14px; line-height: 1.5;">
            ${order.shippingAddress.fullName}<br/>
            ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
          </p>
        </div>

        <p style="color: #6B4E3D; font-size: 14px;">Estimated Arrival: <strong>Next Morning before 8:00 AM</strong></p>
      </div>
    `;
    await this.send(email, `Order Confirmed: #${order.orderNumber} — GoodEggs`, html);
  }

  static async sendStatusUpdate(email: string, order: any, newStatus: string, note?: string) {
    const html = `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; background: #FDF8EE; padding: 32px; border-radius: 16px; border: 1px solid #EFE4D2;">
        <h2 style="color: #2C1810; font-family: 'Georgia', serif;">Order Status Update: ${newStatus}</h2>
        <p style="color: #6B4E3D; font-size: 15px;">Your order <strong>#${order.orderNumber}</strong> status is now <strong>${newStatus}</strong>.</p>
        ${note ? `<p style="color: #8C6A54; font-size: 14px; background: #FFFDF9; padding: 12px; border-radius: 8px;">Note: ${note}</p>` : ''}
        <p style="color: #6B4E3D; font-size: 14px;">You can track real-time delivery progress directly in your customer dashboard.</p>
      </div>
    `;
    await this.send(email, `Update on Order #${order.orderNumber}: ${newStatus}`, html);
  }
}


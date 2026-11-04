import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ENV } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

const timingSafeEqualHex = (actual: string, expected: string): boolean => {
  if (!/^[\da-f]+$/i.test(actual) || !/^[\da-f]+$/i.test(expected)) return false;

  const actualBuffer = Buffer.from(actual, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
};

const getRazorpayInstance = (): Razorpay => {
  const keyId = ENV.RAZORPAY_KEY_ID.trim();
  const keySecret = ENV.RAZORPAY_KEY_SECRET.trim();
  const isTestKey = keyId.startsWith('rzp_test_');
  const isLiveKey = keyId.startsWith('rzp_live_');

  if (!keyId || !keySecret || (!isTestKey && !isLiveKey)) {
    throw new Error('Razorpay is not configured. Set a valid Razorpay key ID and secret.');
  }

  if ((ENV.RAZORPAY_MODE === 'live' && !isLiveKey) || (ENV.RAZORPAY_MODE === 'test' && !isTestKey)) {
    throw new Error(`Razorpay key does not match configured ${ENV.RAZORPAY_MODE} mode.`);
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return razorpayInstance;
};

export class RazorpayService {
  static isConfigured(): boolean {
    try {
      getRazorpayInstance();
      return true;
    } catch {
      return false;
    }
  }

  static getMode(): 'test' | 'live' {
    return ENV.RAZORPAY_MODE === 'live' ? 'live' : 'test';
  }

  static async createOrder(
    amountInRupees: number,
    receiptId: string,
    notes: Record<string, string> = {}
  ) {
    if (!Number.isFinite(amountInRupees) || amountInRupees <= 0) {
      throw new Error('Razorpay order amount must be greater than zero.');
    }

    const instance = getRazorpayInstance();
    const order = await instance.orders.create({
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      receipt: receiptId,
      notes,
    });

    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: ENV.RAZORPAY_KEY_ID,
      mode: this.getMode(),
    };
  }

  static verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature || !ENV.RAZORPAY_KEY_SECRET) return false;

    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return timingSafeEqualHex(signature, expectedSignature);
  }

  static async fetchPayment(paymentId: string): Promise<any> {
    if (!paymentId) throw new Error('Razorpay payment ID is required.');
    return getRazorpayInstance().payments.fetch(paymentId);
  }

  static async capturePayment(paymentId: string, amountInPaise: number): Promise<any> {
    if (!paymentId || !Number.isInteger(amountInPaise) || amountInPaise <= 0) {
      throw new Error('A valid Razorpay payment ID and amount are required for capture.');
    }

    return getRazorpayInstance().payments.capture(paymentId, amountInPaise, 'INR');
  }

  static verifyWebhookSignature(body: string, signature: string): boolean {
    if (!body || !signature || !ENV.RAZORPAY_WEBHOOK_SECRET) return false;

    const expectedSignature = crypto
      .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return timingSafeEqualHex(signature, expectedSignature);
  }
}

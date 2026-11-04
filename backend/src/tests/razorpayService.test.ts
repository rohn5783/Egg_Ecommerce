import crypto from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

const razorpayMocks = vi.hoisted(() => ({
  createOrder: vi.fn(),
  fetchPayment: vi.fn(),
  capturePayment: vi.fn(),
}));

vi.mock('razorpay', () => ({
  default: class MockRazorpay {
    orders = { create: razorpayMocks.createOrder };
    payments = {
      fetch: razorpayMocks.fetchPayment,
      capture: razorpayMocks.capturePayment,
    };
  },
}));

import { ENV } from '../config/env.js';
import { RazorpayService } from '../services/razorpayService.js';

const originalConfig = {
  keyId: ENV.RAZORPAY_KEY_ID,
  keySecret: ENV.RAZORPAY_KEY_SECRET,
  webhookSecret: ENV.RAZORPAY_WEBHOOK_SECRET,
  mode: ENV.RAZORPAY_MODE,
};

describe('RazorpayService', () => {
  afterEach(() => {
    ENV.RAZORPAY_KEY_ID = originalConfig.keyId;
    ENV.RAZORPAY_KEY_SECRET = originalConfig.keySecret;
    ENV.RAZORPAY_WEBHOOK_SECRET = originalConfig.webhookSecret;
    ENV.RAZORPAY_MODE = originalConfig.mode;
    vi.clearAllMocks();
  });

  it('creates a Razorpay order using real test-mode credentials', async () => {
    ENV.RAZORPAY_KEY_ID = 'rzp_test_example';
    ENV.RAZORPAY_KEY_SECRET = 'test-secret';
    ENV.RAZORPAY_MODE = 'test';
    razorpayMocks.createOrder.mockResolvedValue({
      id: 'order_test_123',
      amount: 12500,
      currency: 'INR',
    });

    await expect(RazorpayService.createOrder(125, 'GE-TEST-123')).resolves.toEqual({
      id: 'order_test_123',
      amount: 12500,
      currency: 'INR',
      keyId: 'rzp_test_example',
      mode: 'test',
    });
    expect(razorpayMocks.createOrder).toHaveBeenCalledWith({
      amount: 12500,
      currency: 'INR',
      receipt: 'GE-TEST-123',
      notes: {},
    });
  });

  it('rejects a test key when live mode is selected', async () => {
    ENV.RAZORPAY_KEY_ID = 'rzp_test_example';
    ENV.RAZORPAY_KEY_SECRET = 'test-secret';
    ENV.RAZORPAY_MODE = 'live';

    await expect(RazorpayService.createOrder(125, 'GE-TEST-123')).rejects.toThrow(
      'Razorpay key does not match configured live mode.'
    );
    expect(razorpayMocks.createOrder).not.toHaveBeenCalled();
  });

  it('verifies payment signatures and rejects invalid signatures', () => {
    ENV.RAZORPAY_KEY_SECRET = 'test-secret';
    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update('order_test_123|pay_test_123')
      .digest('hex');

    expect(RazorpayService.verifySignature('order_test_123', 'pay_test_123', signature)).toBe(true);
    expect(RazorpayService.verifySignature('order_test_123', 'pay_test_123', 'invalid')).toBe(false);
  });
});

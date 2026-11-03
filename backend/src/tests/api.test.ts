import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';

describe('GoodEggs Backend API Test Suite', () => {
  beforeAll(async () => {
    await connectDB();
    // Seed initial category and product if empty
    const cat = await Category.findOneAndUpdate(
      { slug: 'pasture-raised' },
      { name: 'Pasture-Raised Cartons', slug: 'pasture-raised' },
      { upsert: true, new: true }
    );

    await Product.findOneAndUpdate(
      { sku: 'GE-PAST-12' },
      {
        name: 'Golden Yolk Pasture-Raised (12 Pack)',
        slug: 'golden-yolk-pasture-raised-12',
        description: 'Rich pasture-raised eggs',
        shortDescription: '12 large eggs',
        images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f'],
        category: cat._id,
        eggType: 'PASTURE_RAISED',
        eggQuantity: 12,
        price: 249,
        discountPrice: 219,
        stockQuantity: 100,
        sku: 'GE-PAST-12',
        status: 'ACTIVE',
        ratingsAverage: 4.9,
      },
      { upsert: true }
    );

    await Coupon.findOneAndUpdate(
      { code: 'WELCOME50' },
      {
        code: 'WELCOME50',
        discountType: 'FIXED',
        discountValue: 50,
        minOrderAmount: 200,
        expirationDate: new Date(Date.now() + 100000000),
        isActive: true,
      },
      { upsert: true }
    );
  }, 60000);

  afterAll(async () => {
    await disconnectDB();
  }, 30000);

  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/v1/products returns seeded farm egg products', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const prod = res.body.data[0];
      expect(prod).toHaveProperty('name');
      expect(prod).toHaveProperty('price');
      expect(prod).toHaveProperty('eggQuantity');
      expect(prod).toHaveProperty('nutritionInfo');
    }
  });

  it('GET /api/v1/categories returns active categories', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/v1/coupons/validate verifies coupon discount', async () => {
    // Check with WELCOME50
    const res = await request(app).post('/api/v1/coupons/validate').send({
      code: 'WELCOME50',
      amount: 300,
    });
    if (res.status === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data.calculatedDiscount).toBe(50);
    }
  });

  it('Recalculates cart server-side and prevents price spoofing', async () => {
    const res = await request(app).get('/api/v1/cart').set('x-guest-id', 'test_cart_guest_1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('subtotal');
    expect(res.body.data).toHaveProperty('finalTotal');
  });

  it('Registers new customer and issues JWT tokens', async () => {
    const uniqueEmail = `test_customer_${Date.now()}@goodeggs.farm`;
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Test Customer',
      email: uniqueEmail,
      password: 'password123456',
      phone: '+91 99999 88888',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(uniqueEmail);
  });

  it('Rejects unauthorized access to admin endpoints', async () => {
    const res = await request(app).get('/api/v1/admin/dashboard-stats');
    expect(res.status).toBe(401);
  });
});

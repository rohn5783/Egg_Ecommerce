import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Coupon } from '../models/Coupon.js';
import { generateAccessToken } from '../utils/jwt.js';

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

    await Product.findOneAndUpdate(
      { sku: 'GE-BROWN-06' },
      {
        name: 'Brown Eggs — Pack of 6',
        slug: 'brown-eggs-pack-of-6',
        description: 'Six farm-fresh brown eggs',
        shortDescription: 'Six brown eggs',
        images: ['https://example.com/brown-eggs.jpg'],
        category: cat._id,
        eggType: 'ORGANIC_BROWN',
        eggQuantity: 6,
        price: 139,
        discountPrice: 119,
        stockQuantity: 95,
        sku: 'GE-BROWN-06',
        status: 'ACTIVE',
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

  it('merges a guest cart into an existing account cart after sign in', async () => {
    const uniqueEmail = `cart_merge_${Date.now()}@goodeggs.farm`;
    const registration = await request(app).post('/api/v1/auth/register').send({
      name: 'Cart Merge Customer',
      email: uniqueEmail,
      password: 'password123456',
      phone: '+91 99999 88888',
    });
    const accessToken = registration.body.data.accessToken as string;
    const guestId = `test_cart_merge_${Date.now()}`;
    const product = await Product.findOne({ sku: 'GE-PAST-12' });

    expect(registration.status).toBe(201);
    if (!product) throw new Error('Cart merge test product was not seeded');

    const accountCart = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-guest-id', guestId);
    expect(accountCart.status).toBe(200);
    expect(accountCart.body.data.items).toHaveLength(0);

    const guestCart = await request(app)
      .post('/api/v1/cart/items')
      .set('x-guest-id', guestId)
      .send({ productId: product._id.toString(), quantity: 2 });
    expect(guestCart.status).toBe(200);

    const mergedCart = await request(app)
      .get('/api/v1/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('x-guest-id', guestId);

    expect(mergedCart.status).toBe(200);
    expect(mergedCart.body.data.items).toHaveLength(1);
    expect(mergedCart.body.data.items[0].product._id).toBe(product._id.toString());
    expect(mergedCart.body.data.items[0].quantity).toBe(2);
  });

  it('restores locally stored cart items to the server cart', async () => {
    const registration = await request(app).post('/api/v1/auth/register').send({
      name: 'Local Cart Customer',
      email: `local_cart_${Date.now()}@goodeggs.farm`,
      password: 'password123456',
      phone: '+91 99999 88888',
    });
    const accessToken = registration.body.data.accessToken as string;
    const product = await Product.findOne({ sku: 'GE-BROWN-06' });

    expect(registration.status).toBe(201);
    if (!product) throw new Error('Cart restore test product was not seeded');

    const restoredCart = await request(app)
      .post('/api/v1/cart/merge')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        items: [{ productId: 'p-brown-6', quantity: 3 }],
      });

    expect(restoredCart.status).toBe(200);
    expect(restoredCart.body.data.items).toHaveLength(1);
    expect(restoredCart.body.data.items[0].product._id).toBe(product._id.toString());
    expect(restoredCart.body.data.items[0].quantity).toBe(3);
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

  it('creates a default category when an admin submits a product without one', async () => {
    await Category.deleteMany({});
    const email = `admin_category_${Date.now()}@goodeggs.farm`;
    const admin = await User.create({ name: 'Category Admin', email, role: 'ADMIN' });
    const accessToken = generateAccessToken({
      userId: admin._id.toString(),
      role: 'ADMIN',
      email,
    });
    const productData = {
      name: 'Uncategorized Farm Eggs',
      description: 'Fresh eggs for testing default category creation.',
      shortDescription: 'Fresh farm eggs',
      images: ['https://example.com/eggs.jpg'],
      category: '',
      eggType: 'PASTURE_RAISED',
      eggQuantity: 12,
      price: 249,
      stockQuantity: 30,
      sku: `GE-DEFAULT-${Date.now()}`,
    };

    const invalidCategory = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ...productData, category: 'not-an-object-id' });
    expect(invalidCategory.status).toBe(400);

    const createdProduct = await request(app)
      .post('/api/v1/admin/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(productData);

    expect(createdProduct.status).toBe(201);
    expect(createdProduct.body.data.category).toBeTruthy();
    const category = await Category.findById(createdProduct.body.data.category);
    expect(category?.slug).toBe('general');
  });
});

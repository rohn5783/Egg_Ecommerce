import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Inventory } from '../models/Inventory.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { Content } from '../models/Content.js';

const seedData = async () => {
  await connectDB();
  console.log('🌱 Starting GoodEggs database seeding...');

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Inventory.deleteMany({}),
    Coupon.deleteMany({}),
    Review.deleteMany({}),
    Content.deleteMany({}),
  ]);

  // 1. Create Users
  const admin = await User.create({
    name: 'Eleanor Vance (Head of Farms)',
    email: 'admin@goodeggs.farm',
    password: 'admin123456',
    role: 'ADMIN',
    phone: '+91 98765 43210',
    isEmailVerified: true,
  });

  const customer = await User.create({
    name: 'Arjun Kapoor',
    email: 'customer@goodeggs.farm',
    password: 'customer123456',
    role: 'CUSTOMER',
    phone: '+91 98111 22334',
    isEmailVerified: true,
    addresses: [
      {
        fullName: 'Arjun Kapoor',
        phone: '+91 98111 22334',
        street: 'Flat 402, Sunshine Meadows, Indiranagar 100ft Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        isDefault: true,
        deliveryInstructions: 'Leave in insulated milk box at the door before 7 AM.',
      },
    ],
  });

  console.log('✅ Created Admin & Customer accounts');

  // 2. Create Categories
  const categories = await Category.insertMany([
    {
      name: 'Pasture-Raised Cartons',
      slug: 'pasture-raised',
      description: 'Hens with 108+ sq ft of fresh pasture, green forage and sunshine daily.',
      displayOrder: 1,
    },
    {
      name: 'Organic Heritage Varieties',
      slug: 'heritage-varieties',
      description: 'Rare heritage hen breeds laying distinctive rustic brown and blue eggs.',
      displayOrder: 2,
    },
    {
      name: 'Family Crates & Bulk',
      slug: 'bulk-crates',
      description: '24-egg and 30-egg farm-grade trays for high-protein households and bakers.',
      displayOrder: 3,
    },
    {
      name: 'Specialty & Quail',
      slug: 'specialty',
      description: 'Nutrient-packed speckled quail eggs and pasture duck eggs for gourmet dining.',
      displayOrder: 4,
    },
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // 3. Create Products with rich photography
  const products = await Product.insertMany([
    // Prompt Requested Brown Egg Pack Sizes
    {
      name: 'Brown Eggs — Pack of 6',
      slug: 'brown-eggs-pack-of-6',
      description: 'Compact 6-pack of farm-fresh rustic brown eggs from Rhode Island Red hens. Plump deep orange yolks with velvety custard texture.',
      shortDescription: '6 farm-fresh rustic brown eggs gathered at sunrise.',
      images: [
        'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 6,
      price: 139,
      discountPrice: 119,
      stockQuantity: 95,
      sku: 'GE-BROWN-06',
      nutritionInfo: {
        calories: 72,
        protein: '6.4g',
        totalFat: '4.8g',
        omega3: '230mg',
        vitaminD: '1.2mcg',
        lutein: '240mcg',
        cholesterol: '185mg',
      },
      packagingInfo: 'Compact 6-well moulded recycled pulp carton.',
      farmingPractice: 'Open pasture foraging with organic herbal supplements.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.8,
      ratingsCount: 42,
      shellColor: 'Natural Warm Speckled Brown',
      yolkColorScore: 13,
    },
    {
      name: 'Brown Eggs — Pack of 10',
      slug: 'brown-eggs-pack-of-10',
      description: 'The everyday family standard. 10 pasture-raised large brown eggs featuring radiant marigold yolks and dense whites.',
      shortDescription: '10 large pasture-raised brown eggs with rich buttery flavor.',
      images: [
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 10,
      price: 219,
      discountPrice: 189,
      stockQuantity: 110,
      sku: 'GE-BROWN-10',
      nutritionInfo: {
        calories: 73,
        protein: '6.5g',
        totalFat: '4.8g',
        omega3: '245mg',
        vitaminD: '1.3mcg',
        lutein: '260mcg',
        cholesterol: '182mg',
      },
      packagingInfo: '10-pocket moulded pulp carton with interlocking tabs.',
      farmingPractice: 'Ethical small family farms, 108+ sq ft per hen.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.9,
      ratingsCount: 68,
      shellColor: 'Deep Rustic Amber',
      yolkColorScore: 14,
    },
    {
      name: 'Brown Eggs — Pack of 12',
      slug: 'brown-eggs-pack-of-12',
      description: 'A dozen pasture-raised brown eggs with rich golden yolks, gathered fresh and packed in a protective molded-pulp carton.',
      shortDescription: '12 pasture-raised brown eggs gathered at sunrise.',
      images: [
        'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 12,
      price: 249,
      discountPrice: 219,
      stockQuantity: 100,
      sku: 'GE-BROWN-12',
      nutritionInfo: {
        calories: 73,
        protein: '6.5g',
        totalFat: '4.8g',
        omega3: '245mg',
        vitaminD: '1.3mcg',
        lutein: '260mcg',
        cholesterol: '182mg',
      },
      packagingInfo: '12-pocket moulded pulp carton with interlocking tabs.',
      farmingPractice: 'Ethical small family farms, 108+ sq ft per hen.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.9,
      ratingsCount: 48,
      shellColor: 'Deep Rustic Amber',
      yolkColorScore: 14,
    },
    {
      name: 'Brown Eggs — Pack of 15',
      slug: 'brown-eggs-pack-of-15',
      description: '15 pasture-raised farm brown eggs for serious breakfast and brunch fans. Maximum freshness in a double-cushioned carton.',
      shortDescription: '15 pasture-raised brown eggs gathered daily at dawn.',
      images: [
        'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 15,
      price: 299,
      discountPrice: 269,
      stockQuantity: 80,
      sku: 'GE-BROWN-15',
      nutritionInfo: {
        calories: 74,
        protein: '6.6g',
        totalFat: '4.9g',
        omega3: '260mg',
        vitaminD: '1.4mcg',
        lutein: '280mcg',
        cholesterol: '180mg',
      },
      packagingInfo: '15-pocket shock-proof moulded pulp tray.',
      farmingPractice: 'Open pasture foraging with certified non-GMO feed grains.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.9,
      ratingsCount: 54,
      shellColor: 'Deep Rustic Amber',
      yolkColorScore: 14,
    },
    {
      name: 'Brown Eggs — Pack of 30',
      slug: 'brown-eggs-pack-of-30',
      description: 'Baker’s and athlete’s wholesale farm flat. 30 large pasture-raised brown eggs on an open breathable pulp tray.',
      shortDescription: '30 farm-fresh brown eggs on an interlocking breathable tray.',
      images: [
        'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[2]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 30,
      price: 529,
      discountPrice: 469,
      stockQuantity: 60,
      sku: 'GE-BROWN-30',
      nutritionInfo: {
        calories: 72,
        protein: '6.4g',
        totalFat: '4.7g',
        omega3: '235mg',
        vitaminD: '1.3mcg',
        lutein: '250mcg',
        cholesterol: '185mg',
      },
      packagingInfo: 'Breathable 30-pocket interlocking paper-pulp flat.',
      farmingPractice: 'Pasture-raised on certified non-GMO grains.',
      status: 'ACTIVE',
      isFeatured: false,
      ratingsAverage: 4.8,
      ratingsCount: 31,
      shellColor: 'Assorted Rustic Browns',
      yolkColorScore: 13,
    },

    // Prompt Requested White Egg Pack Sizes
    {
      name: 'White Eggs — Pack of 6',
      slug: 'white-eggs-pack-of-6',
      description: '6 porcelain white eggs from pasture White Leghorn hens. Clean, buoyant whites that whip to extraordinary culinary peaks.',
      shortDescription: '6 crisp porcelain white eggs with airy whites.',
      images: [
        'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'CLASSIC_WHITE',
      eggQuantity: 6,
      price: 129,
      discountPrice: 109,
      stockQuantity: 120,
      sku: 'GE-WHITE-06',
      nutritionInfo: {
        calories: 69,
        protein: '6.2g',
        totalFat: '4.5g',
        omega3: '200mg',
        vitaminD: '1.1mcg',
        lutein: '210mcg',
        cholesterol: '175mg',
      },
      packagingInfo: '6-well biodegradable virgin pulp carton.',
      farmingPractice: 'Free-range sunny paddocks with continuous clean spring water.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.7,
      ratingsCount: 28,
      shellColor: 'Porcelain White',
      yolkColorScore: 12,
    },
    {
      name: 'White Eggs — Pack of 10',
      slug: 'white-eggs-pack-of-10',
      description: '10 classic pasture white eggs with pristine shells and luminous golden yolks. Ideal for daily breakfast and delicate baking.',
      shortDescription: '10 pasture white eggs with radiant gold yolks.',
      images: [
        'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'CLASSIC_WHITE',
      eggQuantity: 10,
      price: 199,
      discountPrice: 169,
      stockQuantity: 140,
      sku: 'GE-WHITE-10',
      nutritionInfo: {
        calories: 70,
        protein: '6.3g',
        totalFat: '4.6g',
        omega3: '210mg',
        vitaminD: '1.2mcg',
        lutein: '220mcg',
        cholesterol: '180mg',
      },
      packagingInfo: '10-pocket moulded fiber carton.',
      farmingPractice: 'Sunny pasture paddocks with clean spring water.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.8,
      ratingsCount: 45,
      shellColor: 'Clean Porcelain White',
      yolkColorScore: 13,
    },
    {
      name: 'White Eggs — Pack of 15',
      slug: 'white-eggs-pack-of-15',
      description: '15 farm-fresh classic white eggs. High elasticity albumen that creates towering meringues and cloud-like fluffy omelets.',
      shortDescription: '15 pasture white eggs with superior whipping elasticity.',
      images: [
        'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'CLASSIC_WHITE',
      eggQuantity: 15,
      price: 279,
      discountPrice: 249,
      stockQuantity: 90,
      sku: 'GE-WHITE-15',
      nutritionInfo: {
        calories: 70,
        protein: '6.3g',
        totalFat: '4.6g',
        omega3: '215mg',
        vitaminD: '1.2mcg',
        lutein: '225mcg',
        cholesterol: '180mg',
      },
      packagingInfo: '15-pocket shock-absorbing pulp tray.',
      farmingPractice: 'Ethical free-range partner farms with non-GMO feed.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.8,
      ratingsCount: 39,
      shellColor: 'Porcelain White',
      yolkColorScore: 13,
    },
    {
      name: 'White Eggs — Pack of 30',
      slug: 'white-eggs-pack-of-30',
      description: '30 pristine white eggs on an interlocking baker’s tray. Pure egg quality with balanced freshness and high protein.',
      shortDescription: '30 pasture white eggs on a wholesale baker’s tray.',
      images: [
        'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[2]._id,
      eggType: 'CLASSIC_WHITE',
      eggQuantity: 30,
      price: 499,
      discountPrice: 439,
      stockQuantity: 55,
      sku: 'GE-WHITE-30',
      nutritionInfo: {
        calories: 70,
        protein: '6.3g',
        totalFat: '4.6g',
        omega3: '210mg',
        vitaminD: '1.2mcg',
        lutein: '220mcg',
        cholesterol: '180mg',
      },
      packagingInfo: 'Interlocking 30-egg paper-pulp flat.',
      farmingPractice: 'Certified pasture-raised partner farms.',
      status: 'ACTIVE',
      isFeatured: false,
      ratingsAverage: 4.7,
      ratingsCount: 22,
      shellColor: 'Porcelain White',
      yolkColorScore: 12,
    },
    {
      name: 'Classic Morning White (12 Pack)',
      slug: 'classic-morning-white-12',
      description:
        'Laid by spirited White Leghorn hens on open pastures. Renowned for their crisp porcelain shells and buoyant whites that whip up with breathtaking volume for delicate meringues, fluffy scrambles, and soufflés.',
      shortDescription: '12 porcelain white eggs with crisp high albumen.',
      images: [
        'https://images.unsplash.com/photo-1569288052389-dac9b01c9c05?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[0]._id,
      eggType: 'CLASSIC_WHITE',
      eggQuantity: 12,
      price: 219,
      discountPrice: 189,
      stockQuantity: 150,
      sku: 'GE-WHITE-12',
      nutritionInfo: {
        calories: 70,
        protein: '6.3g',
        totalFat: '4.6g',
        omega3: '210mg',
        vitaminD: '1.1mcg',
        lutein: '220mcg',
        cholesterol: '180mg',
      },
      packagingInfo: '100% natural fiber biodegradable carton.',
      farmingPractice: 'Free-range sunny paddocks with continuous clean spring water.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.7,
      ratingsCount: 36,
      shellColor: 'Porcelain White',
      yolkColorScore: 12,
    },
    {
      name: 'Family Morning Crate (24 Pack)',
      slug: 'family-morning-crate-24',
      description:
        'The ultimate weekly pantry staple for high-protein breakfast families and weekend brunch lovers. A curated mix of our finest pasture-raised brown and golden eggs packed in a protective reinforced double crate.',
      shortDescription: '24 mixed pasture-raised eggs in our reinforced shock-proof family crate.',
      images: [
        'https://images.unsplash.com/photo-1598965402089-897ce52e8355?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[2]._id,
      eggType: 'PASTURE_RAISED',
      eggQuantity: 24,
      price: 449,
      discountPrice: 389,
      stockQuantity: 75,
      sku: 'GE-FAMILY-24',
      nutritionInfo: {
        calories: 74,
        protein: '6.6g',
        totalFat: '4.9g',
        omega3: '255mg',
        vitaminD: '1.4mcg',
        lutein: '275mcg',
        cholesterol: '182mg',
      },
      packagingInfo: 'Double-decker reinforced moulded pulp box with inter-tier shock cushions.',
      farmingPractice: 'Certified pasture-raised partner farms.',
      status: 'ACTIVE',
      isFeatured: true,
      ratingsAverage: 4.9,
      ratingsCount: 65,
      shellColor: 'Sun-baked Rustic Gold & Brown',
      yolkColorScore: 14,
    },
    {
      name: 'Farm Fresh 30-Egg Baker’s Tray',
      slug: 'bakers-tray-30',
      description:
        'Wholesale-grade fresh collection for home pastry chefs, cloud kitchens, and serious fitness meal-preppers. Straight from the morning grading belt into an open-nest pulp flat.',
      shortDescription: '30 farm fresh eggs on an interlocking breathable tray.',
      images: [
        'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[2]._id,
      eggType: 'ORGANIC_BROWN',
      eggQuantity: 30,
      price: 529,
      discountPrice: 469,
      stockQuantity: 60,
      sku: 'GE-TRAY-30',
      nutritionInfo: {
        calories: 72,
        protein: '6.4g',
        totalFat: '4.7g',
        omega3: '235mg',
        vitaminD: '1.3mcg',
        lutein: '250mcg',
        cholesterol: '185mg',
      },
      packagingInfo: 'Breathable 30-pocket interlocking paper-pulp flat.',
      farmingPractice: 'Pasture-raised with certified non-GMO feed grains.',
      status: 'ACTIVE',
      isFeatured: false,
      ratingsAverage: 4.8,
      ratingsCount: 29,
      shellColor: 'Assorted Rustic Browns',
      yolkColorScore: 13,
    },
    {
      name: 'Pasture Duck Eggs (6 Pack)',
      slug: 'pasture-duck-eggs-6',
      description:
        'Rich, decadent, and prized by master bakers. Our ducks forage alongside freshwater streams. Duck eggs have thicker shells, 30% larger yolks, and higher fat content that makes cakes rise taller and curds creamier.',
      shortDescription: '6 rich, velvety duck eggs with extraordinary cooking properties.',
      images: [
        'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=800&q=80',
      ],
      category: categories[3]._id,
      eggType: 'DUCK',
      eggQuantity: 6,
      price: 199,
      discountPrice: 179,
      stockQuantity: 40,
      sku: 'GE-DUCK-06',
      nutritionInfo: {
        calories: 130,
        protein: '9.0g',
        totalFat: '9.6g',
        omega3: '380mg',
        vitaminD: '2.1mcg',
        lutein: '360mcg',
        cholesterol: '619mg',
      },
      packagingInfo: 'Deep-pocket extra-cushioned moulded pulp carton.',
      farmingPractice: 'Free aquatic foraging in natural wetland pastures.',
      status: 'ACTIVE',
      isFeatured: false,
      ratingsAverage: 4.9,
      ratingsCount: 18,
      shellColor: 'Seafoam Pale Celadon',
      yolkColorScore: 15,
    },
  ]);

  console.log(`✅ Created ${products.length} products`);

  // 4. Create Inventory for each product
  for (const prod of products) {
    await Inventory.create({
      product: prod._id,
      currentStock: prod.stockQuantity,
      lowStockThreshold: 15,
    });
  }

  // 5. Create Promotional Coupons
  await Coupon.insertMany([
    {
      code: 'WELCOME50',
      description: 'Flat ₹50 off on your first GoodEggs morning basket',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 200,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 10000,
      isActive: true,
    },
    {
      code: 'FARM20',
      description: '20% off on premium pasture-raised packs (Max ₹100 discount)',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 350,
      maxDiscountAmount: 100,
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      usageLimit: 5000,
      isActive: true,
    },
  ]);

  // 6. Create Initial Verified Reviews
  await Review.create({
    product: products[0]._id,
    user: customer._id,
    rating: 5,
    title: 'The richest yolks I have ever seen in India!',
    comment:
      'We made eggs Benedict with these on Sunday and the hollandaise was an unbelievable golden hue. No fishy odor, shells are super thick, and the carton arrived completely intact.',
    isVerifiedPurchase: true,
    isApproved: true,
  });

  console.log('✅ Created Inventory, Coupons, and Reviews');
  console.log('🎉 Seeding successfully completed!');
  await disconnectDB();
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

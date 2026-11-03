import mongoose, { Document, Schema } from 'mongoose';

export interface INutritionInfo {
  calories: number;
  protein: string;
  totalFat: string;
  omega3: string;
  vitaminD: string;
  lutein: string;
  cholesterol: string;
}

export interface IProductColor {
  name: string;
  hex: string;
  isDefault?: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  category: mongoose.Types.ObjectId;
  clothingCategory?: 'JACKET' | 'COAT' | 'HOODIE' | 'TSHIRT' | 'TROUSERS' | 'SHIRT' | 'SHOES' | 'HAT';
  brand?: string;
  model3dId?: string;
  colors?: IProductColor[];
  sizes?: string[];
  isWearable?: boolean;
  attachmentSlot?: 'head' | 'torso' | 'legs' | 'feet';
  eggType?: 'PASTURE_RAISED' | 'ORGANIC_BROWN' | 'HERITAGE_BLUE' | 'CLASSIC_WHITE' | 'QUAIL' | 'DUCK';
  eggQuantity?: number;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  nutritionInfo?: INutritionInfo;
  packagingInfo?: string;
  farmingPractice?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  isFeatured: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  shellColor?: string;
  yolkColorScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const NutritionSchema = new Schema<INutritionInfo>(
  {
    calories: { type: Number, default: 72 },
    protein: { type: String, default: '6.3g' },
    totalFat: { type: String, default: '4.8g' },
    omega3: { type: String, default: '225mg' },
    vitaminD: { type: String, default: '1.2mcg' },
    lutein: { type: String, default: '250mcg' },
    cholesterol: { type: String, default: '185mg' },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    images: [{ type: String, required: true }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    eggType: {
      type: String,
      enum: ['PASTURE_RAISED', 'ORGANIC_BROWN', 'HERITAGE_BLUE', 'CLASSIC_WHITE', 'QUAIL', 'DUCK'],
      required: true,
      index: true,
    },
    eggQuantity: { type: Number, required: true, default: 12 },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 50 },
    sku: { type: String, required: true, unique: true, uppercase: true },
    nutritionInfo: { type: NutritionSchema, default: () => ({}) },
    packagingInfo: {
      type: String,
      default: 'Packed in 100% biodegradable moulded wood pulp cartons with shock-absorbent nest protection.',
    },
    farmingPractice: {
      type: String,
      default: 'Pasture-raised on ethical small family farms with 108+ sq ft per hen, non-GMO grains & sunshine.',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'DRAFT'],
      default: 'ACTIVE',
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    ratingsAverage: { type: Number, default: 4.8, min: 1, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    shellColor: { type: String, default: 'Warm Rustic Brown' },
    yolkColorScore: { type: Number, default: 14 },
  },
  { timestamps: true }
);

// Text index for search
ProductSchema.index({ name: 'text', description: 'text', shortDescription: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);


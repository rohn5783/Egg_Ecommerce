import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10),
  shortDescription: z.string().max(250).optional(),
  images: z.array(z.string().url()).min(1, 'At least one product image is required'),
  category: z.string(), // ObjectId string
  eggType: z.enum(['PASTURE_RAISED', 'ORGANIC_BROWN', 'HERITAGE_BLUE', 'CLASSIC_WHITE', 'QUAIL', 'DUCK']),
  eggQuantity: z.number().int().min(1).max(100),
  price: z.number().positive(),
  discountPrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(3),
  nutritionInfo: z
    .object({
      calories: z.number().optional(),
      protein: z.string().optional(),
      totalFat: z.string().optional(),
      omega3: z.string().optional(),
      vitaminD: z.string().optional(),
      lutein: z.string().optional(),
      cholesterol: z.string().optional(),
    })
    .optional(),
  packagingInfo: z.string().optional(),
  farmingPractice: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  isFeatured: z.boolean().optional(),
  shellColor: z.string().optional(),
  yolkColorScore: z.number().min(1).max(15).optional(),
});

export const updateProductSchema = createProductSchema.partial();


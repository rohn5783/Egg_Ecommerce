export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  phone?: string;
  avatar?: string;
  addresses?: IAddress[];
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  deliveryInstructions?: string;
}

export interface INutritionInfo {
  calories: number;
  protein: string;
  totalFat: string;
  omega3: string;
  vitaminD: string;
  lutein: string;
  cholesterol: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  category: ICategory | string;
  eggType: 'PASTURE_RAISED' | 'ORGANIC_BROWN' | 'HERITAGE_BLUE' | 'CLASSIC_WHITE' | 'QUAIL' | 'DUCK';
  eggQuantity: number;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  nutritionInfo: INutritionInfo;
  packagingInfo: string;
  farmingPractice: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  isFeatured: boolean;
  ratingsAverage: number;
  ratingsCount: number;
  shellColor: string;
  yolkColorScore: number;
}

export interface ICartItem {
  _id: string;
  product: IProduct;
  quantity: number;
  price: number;
  customCartonConfig?: {
    eggBreakdown: Array<{ eggType: string; count: number; name: string }>;
    label?: string;
  };
}

export interface ICart {
  _id: string;
  items: ICartItem[];
  subtotal: number;
  deliveryCharge: number;
  discountTotal: number;
  appliedCoupon?: string;
  finalTotal: number;
}

export interface ITimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    eggQuantity: number;
    subtotal: number;
  }>;
  shippingAddress: IAddress;
  subtotal: number;
  deliveryCharge: number;
  discountTotal: number;
  appliedCoupon?: string;
  finalTotal: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'RAZORPAY' | 'COD';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'PACKED'
    | 'SHIPPED'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED';
  timeline: ITimelineEvent[];
  estimatedDeliveryDate: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface IHomeContent {
  announcement: {
    message: string;
    highlight: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    badge: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  eggComparison: {
    title: string;
    subtitle: string;
    varieties: Array<{
      name: string;
      shellColor: string;
      henBreed: string;
      yolkColorIndex: string;
      proteinPerEgg: string;
      omega3: string;
      diet: string;
      description: string;
    }>;
  };
  packaging: {
    title: string;
    subtitle: string;
    features: Array<{ title: string; desc: string }>;
  };
  farmStory: {
    title: string;
    subtitle: string;
    body: string;
    stats: Array<{ label: string; value: string }>;
  };
  faqs: Array<{ q: string; a: string }>;
  testimonials: Array<{
    name: string;
    role: string;
    comment: string;
    rating: number;
    avatar: string;
  }>;
}

export interface ICoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expirationDate?: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

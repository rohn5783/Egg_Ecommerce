import mongoose, { Document, Schema } from 'mongoose';

export interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  customCartonConfig?: {
    eggBreakdown: Array<{ eggType: string; count: number; name: string }>;
    label?: string;
  };
  price: number;
}

export interface ICart extends Document {
  user?: mongoose.Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
  subtotal: number;
  deliveryCharge: number;
  discountTotal: number;
  appliedCoupon?: string;
  finalTotal: number;
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    customCartonConfig: {
      eggBreakdown: [
        {
          eggType: { type: String },
          count: { type: Number },
          name: { type: String },
        },
      ],
      label: { type: String },
    },
    price: { type: Number, required: true },
  },
  { _id: true }
);

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestId: { type: String, index: true },
    items: [CartItemSchema],
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    appliedCoupon: { type: String },
    finalTotal: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Cart = mongoose.model<ICart>('Cart', CartSchema);


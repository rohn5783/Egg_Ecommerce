import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryReservation {
  _id?: mongoose.Types.ObjectId;
  cartOrOrderId: string;
  quantity: number;
  expiresAt: Date;
}

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  currentStock: number;
  reservedStock: number;
  availableStock: number; // currentStock - reservedStock
  lowStockThreshold: number;
  isOutOfStock: boolean;
  reservations: IInventoryReservation[];
  updatedAt: Date;
  createdAt: Date;
}

const ReservationSchema = new Schema<IInventoryReservation>(
  {
    cartOrOrderId: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    expiresAt: { type: Date, required: true },
  },
  { _id: true }
);

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true, index: true },
    currentStock: { type: Number, required: true, min: 0, default: 100 },
    reservedStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 15 },
    reservations: [ReservationSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

InventorySchema.virtual('availableStock').get(function (this: IInventory) {
  return Math.max(0, this.currentStock - this.reservedStock);
});

InventorySchema.virtual('isOutOfStock').get(function (this: IInventory) {
  return (this.currentStock - this.reservedStock) <= 0;
});

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);


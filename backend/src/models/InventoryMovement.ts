import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryMovement extends Document {
  product: mongoose.Types.ObjectId;
  type: 'RESTOCK' | 'PURCHASE_DEDUCTION' | 'RESERVATION' | 'RELEASE_RESERVATION' | 'MANUAL_ADJUSTMENT' | 'RETURN';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceId?: string; // orderId or admin userId
  notes?: string;
  createdAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    type: {
      type: String,
      enum: ['RESTOCK', 'PURCHASE_DEDUCTION', 'RESERVATION', 'RELEASE_RESERVATION', 'MANUAL_ADJUSTMENT', 'RETURN'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String },
    notes: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryMovement = mongoose.model<IInventoryMovement>('InventoryMovement', InventoryMovementSchema);


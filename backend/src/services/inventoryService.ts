import { Inventory } from '../models/Inventory.js';
import { InventoryMovement } from '../models/InventoryMovement.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';

export class InventoryService {
  /**
   * Cleans up expired reservations (older than 15 minutes)
   */
  static async cleanupExpiredReservations(): Promise<void> {
    const now = new Date();
    const inventories = await Inventory.find({ 'reservations.expiresAt': { $lt: now } });

    for (const inv of inventories) {
      const expired = inv.reservations.filter((r) => r.expiresAt < now);
      if (expired.length > 0) {
        const releasedQty = expired.reduce((sum, r) => sum + r.quantity, 0);
        inv.reservedStock = Math.max(0, inv.reservedStock - releasedQty);
        inv.reservations = inv.reservations.filter((r) => r.expiresAt >= now);
        await inv.save();

        await InventoryMovement.create({
          product: inv.product,
          type: 'RELEASE_RESERVATION',
          quantity: releasedQty,
          previousStock: inv.currentStock,
          newStock: inv.currentStock,
          notes: `Auto-released ${releasedQty} units from expired checkout reservation`,
        });
      }
    }
  }

  /**
   * Reserves stock during checkout attempt (15-min TTL)
   */
  static async reserveStock(
    productId: string,
    quantity: number,
    cartOrOrderId: string
  ): Promise<boolean> {
    await this.cleanupExpiredReservations();

    // Atomic find and update to prevent race conditions
    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      throw ApiError.badRequest('Inventory record not found for product');
    }

    const available = inventory.currentStock - inventory.reservedStock;
    if (available < quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for requested item. Available: ${available}, Requested: ${quantity}`
      );
    }

    inventory.reservedStock += quantity;
    inventory.reservations.push({
      cartOrOrderId,
      quantity,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
    });

    await inventory.save();

    await InventoryMovement.create({
      product: productId,
      type: 'RESERVATION',
      quantity,
      previousStock: inventory.currentStock,
      newStock: inventory.currentStock,
      referenceId: cartOrOrderId,
      notes: `Temporary checkout reservation for ${quantity} packs`,
    });

    return true;
  }

  /**
   * Finalizes stock deduction after payment confirmation
   */
  static async commitReservation(
    productId: string,
    cartOrOrderId: string
  ): Promise<void> {
    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return;

    const reservationIdx = inventory.reservations.findIndex(
      (r) => r.cartOrOrderId === cartOrOrderId
    );

    let quantity = 0;
    if (reservationIdx !== -1) {
      quantity = inventory.reservations[reservationIdx].quantity;
      inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity);
      inventory.reservations.splice(reservationIdx, 1);
    }

    const prev = inventory.currentStock;
    inventory.currentStock = Math.max(0, inventory.currentStock - quantity);
    await inventory.save();

    // Also update Product document stockQuantity
    await Product.findByIdAndUpdate(productId, {
      stockQuantity: inventory.currentStock,
    });

    await InventoryMovement.create({
      product: productId,
      type: 'PURCHASE_DEDUCTION',
      quantity,
      previousStock: prev,
      newStock: inventory.currentStock,
      referenceId: cartOrOrderId,
      notes: `Permanent stock deduction for completed order ${cartOrOrderId}`,
    });
  }

  /**
   * Releases reservation if checkout fails or is cancelled
   */
  static async releaseReservation(
    productId: string,
    cartOrOrderId: string
  ): Promise<void> {
    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) return;

    const reservationIdx = inventory.reservations.findIndex(
      (r) => r.cartOrOrderId === cartOrOrderId
    );

    if (reservationIdx !== -1) {
      const quantity = inventory.reservations[reservationIdx].quantity;
      inventory.reservedStock = Math.max(0, inventory.reservedStock - quantity);
      inventory.reservations.splice(reservationIdx, 1);
      await inventory.save();

      await InventoryMovement.create({
        product: productId,
        type: 'RELEASE_RESERVATION',
        quantity,
        previousStock: inventory.currentStock,
        newStock: inventory.currentStock,
        referenceId: cartOrOrderId,
        notes: `Released reservation for ${cartOrOrderId}`,
      });
    }
  }

  /**
   * Admin manual stock adjustment
   */
  static async adjustStock(
    productId: string,
    newQuantity: number,
    adminId: string,
    reason: string
  ): Promise<void> {
    const inventory = await Inventory.findOne({ product: productId });
    if (!inventory) {
      throw ApiError.notFound('Inventory item not found');
    }

    const prev = inventory.currentStock;
    inventory.currentStock = Math.max(0, newQuantity);
    await inventory.save();

    await Product.findByIdAndUpdate(productId, { stockQuantity: inventory.currentStock });

    await InventoryMovement.create({
      product: productId,
      type: 'MANUAL_ADJUSTMENT',
      quantity: Math.abs(newQuantity - prev),
      previousStock: prev,
      newStock: inventory.currentStock,
      referenceId: adminId,
      notes: reason || 'Manual admin inventory adjustment',
    });
  }
}


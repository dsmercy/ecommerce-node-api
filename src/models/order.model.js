import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         orderNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned, refunded]
 *         subTotal:
 *           type: number
 *         taxAmount:
 *           type: number
 *         shippingCost:
 *           type: number
 *         discountAmount:
 *           type: number
 *         totalAmount:
 *           type: number
 *         shippingAddress:
 *           type: string
 *         billingAddress:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         paymentIntentId:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, refunded]
 *         trackingNumber:
 *           type: string
 *         courierService:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               name:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unitPrice:
 *                 type: number
 *               totalPrice:
 *                 type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderNumber: { type: String, unique: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
      default: 'pending',
    },
    subTotal: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    discountAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String },
    billingAddress: { type: String },
    paymentMethod: { type: String },
    paymentIntentId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
    },
    trackingNumber: { type: String },
    courierService: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        name: { type: String },
        quantity: { type: Number },
        unitPrice: { type: Number },
        totalPrice: { type: Number },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);

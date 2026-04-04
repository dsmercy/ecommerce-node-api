import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: [percentage, fixed_amount, free_shipping]
 *         value:
 *           type: number
 *         minOrderAmount:
 *           type: number
 *         usageLimit:
 *           type: integer
 *           nullable: true
 *         usageCount:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         isActive:
 *           type: boolean
 */
const promotionSchema = new mongoose.Schema(
  {
    name: { type: String },
    code: { type: String, unique: true, uppercase: true },
    type: {
      type: String,
      enum: ['percentage', 'fixed_amount', 'free_shipping'],
    },
    value: { type: Number },
    minOrderAmount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Promotion = mongoose.model('Promotion', promotionSchema);

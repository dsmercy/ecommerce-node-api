import Joi from 'joi';

const orderStatuses = [
  'pending', 'confirmed', 'processing', 'shipped',
  'delivered', 'cancelled', 'returned', 'refunded',
];

export const checkoutSchema = Joi.object({
  shippingAddress: Joi.string().trim().required(),
  billingAddress: Joi.string().trim().required(),
  paymentMethod: Joi.string().trim().required(),
  promotionCode: Joi.string().trim().uppercase(),
});

export const processPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().trim().required(),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...orderStatuses).required(),
});

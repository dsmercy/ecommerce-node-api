import Joi from 'joi';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

export const updateUserStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

export const createPromotionSchema = Joi.object({
  name: Joi.string().trim().required(),
  code: Joi.string().trim().uppercase().required(),
  type: Joi.string().valid('percentage', 'fixed_amount', 'free_shipping').required(),
  value: Joi.number().min(0).required(),
  minOrderAmount: Joi.number().min(0).default(0),
  usageLimit: Joi.number().integer().min(1).allow(null).default(null),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
});

export const salesAnalyticsSchema = Joi.object({
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

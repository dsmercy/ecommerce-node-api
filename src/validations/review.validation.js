import Joi from 'joi';

export const createReviewSchema = Joi.object({
  productId: Joi.string().pattern(/^[a-f\d]{24}$/i, 'ObjectId').required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().trim().max(1000),
});

export const reviewQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

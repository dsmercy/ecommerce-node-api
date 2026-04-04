import Joi from 'joi';

export const addToCartSchema = Joi.object({
  productId: Joi.string().pattern(/^[a-f\d]{24}$/i, 'ObjectId').required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

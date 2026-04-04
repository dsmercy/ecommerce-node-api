import Joi from 'joi';

const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i, 'ObjectId');

export const createProductSchema = Joi.object({
  name: Joi.string().trim().required(),
  sku: Joi.string().trim().required(),
  description: Joi.string().trim(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0),
  stockQty: Joi.number().integer().min(0),
  categoryId: objectId.required(),
  images: Joi.array().items(Joi.string().uri()),
  tags: Joi.array().items(Joi.string()),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().trim(),
  sku: Joi.string().trim(),
  description: Joi.string().trim(),
  price: Joi.number().min(0),
  salePrice: Joi.number().min(0),
  stockQty: Joi.number().integer().min(0),
  categoryId: objectId,
  images: Joi.array().items(Joi.string().uri()),
  tags: Joi.array().items(Joi.string()),
  isActive: Joi.boolean(),
});

export const productSearchSchema = Joi.object({
  search: Joi.string().trim(),
  categoryId: objectId,
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  minRating: Joi.number().min(0).max(5),
  tags: Joi.string().trim(),
  sortBy: Joi.string().valid('name', 'price', 'rating', 'createdAt').default('name'),
  sortOrder: Joi.string().valid('asc', 'desc').default('asc'),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(10),
});

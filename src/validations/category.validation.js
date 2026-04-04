import Joi from 'joi';

const objectId = Joi.string().pattern(/^[a-f\d]{24}$/i, 'ObjectId');

export const createCategorySchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim(),
  parentId: objectId,
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().trim(),
  description: Joi.string().trim(),
  parentId: objectId,
});

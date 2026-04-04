import Joi from 'joi';

const passwordRules = Joi.string()
  .min(8)
  .pattern(/[A-Z]/, 'uppercase letter')
  .pattern(/[0-9]/, 'number')
  .pattern(/[^A-Za-z0-9]/, 'special character')
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.pattern.name': 'Password must contain at least one {#name}',
  });

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordRules.required(),
  firstName: Joi.string().trim(),
  lastName: Joi.string().trim(),
  phoneNumber: Joi.string().trim(),
  dateOfBirth: Joi.date().iso(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: passwordRules.required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

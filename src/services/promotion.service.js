import { Promotion } from '../models/promotion.model.js';

export async function applyPromotion(code, orderSubtotal) {
  const now = new Date();
  const promo = await Promotion.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });

  if (!promo) {
    const err = new Error('Promotion code not found or expired');
    err.statusCode = 404;
    throw err;
  }

  if (orderSubtotal < promo.minOrderAmount) {
    const err = new Error(
      `Minimum order amount of $${promo.minOrderAmount} required for this promotion`
    );
    err.statusCode = 400;
    throw err;
  }

  if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
    const err = new Error('Promotion code usage limit reached');
    err.statusCode = 400;
    throw err;
  }

  let discount = 0;
  let freeShipping = false;

  if (promo.type === 'percentage') {
    discount = parseFloat(((orderSubtotal * promo.value) / 100).toFixed(2));
  } else if (promo.type === 'fixed_amount') {
    discount = promo.value;
  } else if (promo.type === 'free_shipping') {
    freeShipping = true;
  }

  await Promotion.findByIdAndUpdate(promo._id, { $inc: { usageCount: 1 } });

  return { discount, freeShipping };
}

export async function getActivePromotions() {
  const now = new Date();
  return Promotion.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  }).lean();
}

export async function createPromotion(dto) {
  return Promotion.create(dto);
}

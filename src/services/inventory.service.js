import { Product } from '../models/product.model.js';
import { deleteCache } from '../utils/cache.js';

function invalidateProductCache(productId) {
  deleteCache(`product:${productId}`);
}

export async function reserveStock(productId, quantity) {
  const result = await Product.findOneAndUpdate(
    { _id: productId, stockQty: { $gte: quantity } },
    { $inc: { stockQty: -quantity } }
  );
  if (result) invalidateProductCache(productId);
  return result !== null;
}

export async function releaseStock(productId, quantity) {
  await Product.findByIdAndUpdate(productId, { $inc: { stockQty: quantity } });
  invalidateProductCache(productId);
}

export async function getLowStockProducts(threshold = 10) {
  return Product.find({ stockQty: { $lte: threshold }, isActive: true })
    .select('name sku stockQty')
    .lean();
}

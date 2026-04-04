import { Wishlist } from '../models/wishlist.model.js';
import { Product } from '../models/product.model.js';

export async function getWishlist(userId) {
  const wishlist = await Wishlist.findOne({ userId }).populate(
    'productIds',
    'name price salePrice images isActive'
  );

  if (!wishlist) return [];

  return wishlist.productIds
    .filter((p) => p.isActive)
    .map((p) => ({
      _id: p._id,
      name: p.name,
      effectivePrice: p.salePrice ?? p.price,
      imageUrl: p.images?.[0] || null,
    }));
}

export async function addToWishlist(userId, productId) {
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const wishlist = await Wishlist.findOne({ userId });
  if (wishlist?.productIds.some((id) => id.toString() === productId)) {
    const err = new Error('Product already in wishlist');
    err.statusCode = 409;
    throw err;
  }

  await Wishlist.findOneAndUpdate(
    { userId },
    { $addToSet: { productIds: productId } },
    { upsert: true }
  );
}

export async function removeFromWishlist(userId, productId) {
  await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { productIds: productId } }
  );
}

import { Review } from '../models/review.model.js';
import { Product } from '../models/product.model.js';
import { recalculateRating } from './product.service.js';

export async function getProductReviews(productId, { page = 1, pageSize = 10 } = {}) {
  const skip = (page - 1) * pageSize;

  const [items, totalCount] = await Promise.all([
    Review.find({ productId, isApproved: true })
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
    Review.countDocuments({ productId, isApproved: true }),
  ]);

  return { items, totalCount, page, pageSize };
}

export async function createReview(userId, dto) {
  const product = await Product.findById(dto.productId);
  if (!product || !product.isActive) {
    const err = new Error('Product not found');
    err.statusCode = 404;
    throw err;
  }

  const existing = await Review.findOne({ productId: dto.productId, userId });
  if (existing) {
    const err = new Error('You have already reviewed this product');
    err.statusCode = 409;
    throw err;
  }

  const review = await Review.create({
    productId: dto.productId,
    userId,
    rating: dto.rating,
    comment: dto.comment,
  });

  await recalculateRating(dto.productId);
  return review;
}

export async function approveReview(reviewId) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  review.isApproved = true;
  await review.save();
  await recalculateRating(review.productId);
  return review;
}

export async function deleteReview(reviewId, requestingUser) {
  const review = await Review.findById(reviewId);
  if (!review) {
    const err = new Error('Review not found');
    err.statusCode = 404;
    throw err;
  }

  if (
    requestingUser.role !== 'admin' &&
    review.userId.toString() !== requestingUser.id
  ) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  const productId = review.productId;
  await review.deleteOne();
  await recalculateRating(productId);
}

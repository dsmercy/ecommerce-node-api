import * as reviewService from '../services/review.service.js';
import { apiResponse } from '../utils/response.js';

export async function getProductReviews(req, res, next) {
  try {
    const data = await reviewService.getProductReviews(req.params.productId, req.query);
    return apiResponse(res, data, 'Reviews fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function createReview(req, res, next) {
  try {
    const data = await reviewService.createReview(req.user.id, req.body);
    return apiResponse(res, data, 'Review submitted successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function approveReview(req, res, next) {
  try {
    const data = await reviewService.approveReview(req.params.id);
    return apiResponse(res, data, 'Review approved successfully');
  } catch (err) {
    next(err);
  }
}

export async function deleteReview(req, res, next) {
  try {
    await reviewService.deleteReview(req.params.id, req.user);
    return apiResponse(res, null, 'Review deleted successfully');
  } catch (err) {
    next(err);
  }
}

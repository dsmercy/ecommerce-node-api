import * as wishlistService from '../services/wishlist.service.js';
import { apiResponse } from '../utils/response.js';

export async function getWishlist(req, res, next) {
  try {
    const data = await wishlistService.getWishlist(req.user.id);
    return apiResponse(res, data, 'Wishlist fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function addToWishlist(req, res, next) {
  try {
    await wishlistService.addToWishlist(req.user.id, req.params.productId);
    return apiResponse(res, null, 'Product added to wishlist');
  } catch (err) {
    next(err);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    await wishlistService.removeFromWishlist(req.user.id, req.params.productId);
    return apiResponse(res, null, 'Product removed from wishlist');
  } catch (err) {
    next(err);
  }
}

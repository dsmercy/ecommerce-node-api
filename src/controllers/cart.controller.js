import * as cartService from '../services/cart.service.js';
import { apiResponse } from '../utils/response.js';

export async function getCart(req, res, next) {
  try {
    const data = await cartService.getCart(req.user.id);
    return apiResponse(res, data, 'Cart fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function addItem(req, res, next) {
  try {
    const data = await cartService.addItem(req.user.id, req.body);
    return apiResponse(res, data, 'Item added to cart');
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const data = await cartService.updateItem(req.user.id, req.params.productId, req.body.quantity);
    return apiResponse(res, data, 'Cart item updated');
  } catch (err) {
    next(err);
  }
}

export async function removeItem(req, res, next) {
  try {
    const data = await cartService.removeItem(req.user.id, req.params.productId);
    return apiResponse(res, data, 'Item removed from cart');
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user.id);
    return apiResponse(res, null, 'Cart cleared');
  } catch (err) {
    next(err);
  }
}

export async function getCartTotal(req, res, next) {
  try {
    const data = await cartService.getCartTotal(req.user.id);
    return apiResponse(res, data, 'Cart total fetched');
  } catch (err) {
    next(err);
  }
}

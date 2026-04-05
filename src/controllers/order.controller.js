import * as orderService from '../services/order.service.js';
import { apiResponse } from '../utils/response.js';

export async function getUserOrders(req, res, next) {
  try {
    const data = await orderService.getUserOrders(req.user.id);
    return apiResponse(res, data, 'Orders fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req, res, next) {
  try {
    const data = await orderService.getOrderById(req.params.id, req.user.id);
    return apiResponse(res, data, 'Order fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getOrderAdmin(req, res, next) {
  try {
    const data = await orderService.getOrderByIdAdmin(req.params.id);
    return apiResponse(res, data, 'Order fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function checkout(req, res, next) {
  try {
    const data = await orderService.createOrder(req.user.id, req.body);
    return apiResponse(res, data, 'Order placed successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function processPayment(req, res, next) {
  try {
    await orderService.processPayment(req.params.id, req.user.id, req.body.paymentIntentId);
    return apiResponse(res, null, 'Payment processed successfully');
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const data = await orderService.cancelOrder(req.params.id, req.user.id);
    return apiResponse(res, data, 'Order cancelled successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const data = await orderService.updateOrderStatus(req.params.id, req.body.status);
    return apiResponse(res, data, 'Order status updated successfully');
  } catch (err) {
    next(err);
  }
}

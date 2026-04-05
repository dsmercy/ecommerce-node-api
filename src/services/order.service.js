import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import * as inventoryService from './inventory.service.js';
import * as promotionService from './promotion.service.js';
import * as paymentService from './payment.service.js';
import * as notificationService from './notification.service.js';
import logger from '../utils/logger.js';

function generateOrderNumber() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now()}-${suffix}`;
}

export async function createOrder(userId, dto) {
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    const err = new Error('Cart is empty');
    err.statusCode = 400;
    throw err;
  }

  // Reserve stock — roll back on partial failure
  const reserved = [];
  for (const item of cart.items) {
    const product = item.productId;
    const ok = await inventoryService.reserveStock(product._id, item.quantity);
    if (!ok) {
      // Release already reserved items
      for (const r of reserved) {
        await inventoryService.releaseStock(r.productId, r.quantity);
      }
      const err = new Error(`Insufficient stock for "${product.name}"`);
      err.statusCode = 400;
      throw err;
    }
    reserved.push({ productId: product._id, quantity: item.quantity });
  }

  // Build order items snapshot
  const items = cart.items.map((item) => {
    const product = item.productId;
    const unitPrice = product.salePrice ?? product.price;
    return {
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      unitPrice,
      totalPrice: parseFloat((unitPrice * item.quantity).toFixed(2)),
    };
  });

  const subTotal = parseFloat(
    items.reduce((sum, i) => sum + i.totalPrice, 0).toFixed(2)
  );

  const taxAmount = parseFloat((subTotal * 0.18).toFixed(2));
  let shippingCost = subTotal > 500 ? 0 : 50;
  let discountAmount = 0;

  if (dto.promotionCode) {
    try {
      const promo = await promotionService.applyPromotion(dto.promotionCode, subTotal);
      discountAmount = promo.discount;
      if (promo.freeShipping) shippingCost = 0;
    } catch (promoErr) {
      logger.warn({ err: promoErr }, `Promo code "${dto.promotionCode}" invalid — skipping`);
    }
  }

  const totalAmount = parseFloat(
    (subTotal + taxAmount + shippingCost - discountAmount).toFixed(2)
  );

  const order = await Order.create({
    userId,
    orderNumber: generateOrderNumber(),
    status: 'pending',
    subTotal,
    taxAmount,
    shippingCost,
    discountAmount,
    totalAmount,
    shippingAddress: dto.shippingAddress,
    billingAddress: dto.billingAddress,
    paymentMethod: dto.paymentMethod,
    paymentStatus: 'pending',
    items,
  });

  // Clear cart
  await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

  // Fire order confirmation notification (non-blocking)
  notificationService.sendOrderConfirmation(userId, order._id, order.orderNumber).catch(() => {});

  // Create Stripe payment intent
  let clientSecret = null;
  try {
    clientSecret = await paymentService.createPaymentIntent(order._id);
  } catch (stripeErr) {
    logger.warn({ err: stripeErr }, 'Stripe payment intent creation failed — returning order without clientSecret');
  }

  return { order, clientSecret };
}

export async function getUserOrders(userId) {
  return Order.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId }).lean();
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return order;
}

export async function getOrderByIdAdmin(orderId) {
  const order = await Order.findById(orderId)
    .populate('userId', 'firstName lastName email')
    .lean();
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return order;
}

export async function cancelOrder(orderId, userId) {
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  if (order.status !== 'pending') {
    const err = new Error('Only pending orders can be cancelled');
    err.statusCode = 400;
    throw err;
  }

  // Release reserved stock
  for (const item of order.items) {
    await inventoryService.releaseStock(item.productId, item.quantity);
  }

  order.status = 'cancelled';
  await order.save();
  return order;
}

export async function updateOrderStatus(orderId, status) {
  const order = await Order.findById(orderId);
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  order.status = status;
  if (status === 'shipped') order.shippedAt = new Date();
  if (status === 'delivered') order.deliveredAt = new Date();

  await order.save();

  // Fire order update notification (non-blocking)
  notificationService.sendOrderUpdate(order.userId, order._id, order.orderNumber, status).catch(() => {});

  return order;
}

export async function processPayment(orderId, userId, paymentIntentId) {
  // Verify ownership first
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }
  return paymentService.processPayment(orderId, paymentIntentId);
}

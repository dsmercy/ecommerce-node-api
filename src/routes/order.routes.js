import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorise } from '../middlewares/auth.middleware.js';
import { checkoutSchema, processPaymentSchema, updateStatusSchema } from '../validations/order.validation.js';
import * as orderController from '../controllers/order.controller.js';

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order lifecycle and payment management
 */

const router = Router();

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get current user's order history
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders sorted by newest first
 */
router.get('/', authenticate, orderController.getUserOrders);

/**
 * @swagger
 * /orders/admin/{id}:
 *   get:
 *     summary: Get any order by ID (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order with populated user info
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get('/admin/:id', authenticate, authorise('admin'), orderController.getOrderAdmin);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order by ID (owner only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order detail
 *       404:
 *         description: Order not found
 */
router.get('/:id', authenticate, orderController.getOrder);

/**
 * @swagger
 * /orders/checkout:
 *   post:
 *     summary: Place an order from the current cart
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress, billingAddress, paymentMethod]
 *             properties:
 *               shippingAddress:
 *                 type: string
 *               billingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               promotionCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created, returns order and Stripe clientSecret
 *       400:
 *         description: Cart is empty or stock unavailable
 */
router.post('/checkout', authenticate, validate(checkoutSchema), orderController.checkout);

/**
 * @swagger
 * /orders/{id}/payment:
 *   post:
 *     summary: Confirm payment for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [paymentIntentId]
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed, order status set to confirmed
 *       400:
 *         description: Payment intent mismatch or not succeeded
 */
router.post('/:id/payment', authenticate, validate(processPaymentSchema), orderController.processPayment);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel a pending order (restores stock)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled and stock released
 *       400:
 *         description: Order is not in pending state
 */
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin or Seller)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, shipped, delivered, cancelled, returned, refunded]
 *     responses:
 *       200:
 *         description: Order status updated
 *       403:
 *         description: Forbidden
 */
router.put('/:id/status', authenticate, authorise('admin', 'seller'), validate(updateStatusSchema), orderController.updateOrderStatus);

export default router;

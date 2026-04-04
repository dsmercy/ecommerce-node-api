import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { addToCartSchema, updateCartItemSchema } from '../validations/cart.validation.js';
import * as cartController from '../controllers/cart.controller.js';

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

const router = Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart with enriched items and cartTotal
 *       401:
 *         description: Unauthorised
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /cart/total:
 *   get:
 *     summary: Get cart grand total
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart total amount
 */
router.get('/total', cartController.getCartTotal);

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, quantity]
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Item added, returns updated cart
 *       400:
 *         description: Insufficient stock
 *       404:
 *         description: Product not found
 */
router.post('/items', validate(addToCartSchema), cartController.addItem);

/**
 * @swagger
 * /cart/items/{productId}:
 *   put:
 *     summary: Update item quantity in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Cart updated
 *       400:
 *         description: Insufficient stock
 */
router.put('/items/:productId', validate(updateCartItemSchema), cartController.updateItem);

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/items/:productId', cartController.removeItem);

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear all items from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/', cartController.clearCart);

export default router;

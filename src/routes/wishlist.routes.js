import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as wishlistController from '../controllers/wishlist.controller.js';

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management
 */

const router = Router();

// All wishlist routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist items with pricing (inactive products excluded)
 */
router.get('/', wishlistController.getWishlist);

/**
 * @swagger
 * /wishlist/items/{productId}:
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Wishlist]
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
 *         description: Product added
 *       404:
 *         description: Product not found
 *       409:
 *         description: Product already in wishlist
 */
router.post('/items/:productId', wishlistController.addToWishlist);

/**
 * @swagger
 * /wishlist/items/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Wishlist]
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
 *         description: Product removed
 */
router.delete('/items/:productId', wishlistController.removeFromWishlist);

export default router;

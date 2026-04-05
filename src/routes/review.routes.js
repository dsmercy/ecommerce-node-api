import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorise } from '../middlewares/auth.middleware.js';
import { createReviewSchema, reviewQuerySchema } from '../validations/review.validation.js';
import * as reviewController from '../controllers/review.controller.js';

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Product reviews and ratings
 */

const router = Router();

/**
 * @swagger
 * /reviews/product/{productId}:
 *   get:
 *     summary: Get approved reviews for a product
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated approved reviews
 */
router.get('/product/:productId', validate(reviewQuerySchema, 'query'), reviewController.getProductReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review (Customer only, one per product)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, rating]
 *             properties:
 *               productId:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review submitted (pending approval)
 *       409:
 *         description: Already reviewed this product
 */
router.post('/', authenticate, authorise('customer'), validate(createReviewSchema), reviewController.createReview);

/**
 * @swagger
 * /reviews/{id}/approve:
 *   put:
 *     summary: Approve a review (Admin only)
 *     tags: [Reviews]
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
 *         description: Review approved, product rating recalculated
 *       404:
 *         description: Review not found
 */
router.put('/:id/approve', authenticate, authorise('admin'), reviewController.approveReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
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
 *         description: Review deleted, product rating recalculated
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Review not found
 */
router.delete('/:id', authenticate, reviewController.deleteReview);

export default router;

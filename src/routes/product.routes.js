import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorise } from '../middlewares/auth.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productSearchSchema,
} from '../validations/product.validation.js';
import * as productController from '../controllers/product.controller.js';

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalog management
 */

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Search and filter products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *           description: Comma-separated list of tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, rating, createdAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
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
 *         description: Paginated product list
 */
router.get('/', validate(productSearchSchema, 'query'), productController.searchProducts);

/**
 * @swagger
 * /products/featured:
 *   get:
 *     summary: Get featured products (rating >= 4)
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of featured products
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Product not found
 */
router.get('/:id', productController.getProduct);

/**
 * @swagger
 * /products/{id}/related:
 *   get:
 *     summary: Get related products by category
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of related products
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a product (Admin or Seller)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorised
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  authorise('admin', 'seller'),
  validate(createProductSchema),
  productController.createProduct
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (Admin or Seller)
 *     tags: [Products]
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 */
router.put(
  '/:id',
  authenticate,
  authorise('admin', 'seller'),
  validate(updateProductSchema),
  productController.updateProduct
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Soft-delete a product (Admin or Seller)
 *     tags: [Products]
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
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
router.delete('/:id', authenticate, authorise('admin', 'seller'), productController.deleteProduct);

export default router;

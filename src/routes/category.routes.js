import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate, authorise } from '../middlewares/auth.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../validations/category.validation.js';
import * as categoryController from '../controllers/category.controller.js';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Product category management
 */

const router = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all top-level categories with subcategories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/', categoryController.getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category found
 *       404:
 *         description: Category not found
 */
router.get('/:id', categoryController.getCategory);

/**
 * @swagger
 * /categories/{id}/subcategories:
 *   get:
 *     summary: Get subcategories of a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subcategories
 */
router.get('/:id/subcategories', categoryController.getSubcategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorised
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticate, authorise('admin'), validate(createCategorySchema), categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 *       404:
 *         description: Category not found
 */
router.put('/:id', authenticate, authorise('admin'), validate(updateCategorySchema), categoryController.updateCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
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
 *         description: Category deleted
 *       400:
 *         description: Category has products assigned
 *       404:
 *         description: Category not found
 */
router.delete('/:id', authenticate, authorise('admin'), categoryController.deleteCategory);

export default router;

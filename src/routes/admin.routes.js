import { Router } from 'express';
import { authenticate, authorise } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  paginationSchema,
  updateUserStatusSchema,
  createPromotionSchema,
  salesAnalyticsSchema,
} from '../validations/admin.validation.js';
import * as adminController from '../controllers/admin.controller.js';

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin-only management endpoints
 */

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorise('admin'));

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard metrics (total users, orders, revenue, pending orders, low stock)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get paginated list of users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated users
 */
router.get('/users', validate(paginationSchema, 'query'), adminController.getUsers);

/**
 * @swagger
 * /admin/users/{userId}/status:
 *   put:
 *     summary: Activate or deactivate a user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isActive]
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User status updated
 *       404:
 *         description: User not found
 */
router.put('/users/:userId/status', validate(updateUserStatusSchema), adminController.updateUserStatus);

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get paginated list of all orders with user info
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Paginated orders
 */
router.get('/orders', validate(paginationSchema, 'query'), adminController.getAllOrders);

/**
 * @swagger
 * /admin/promotions:
 *   post:
 *     summary: Create a new promotion code
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, type, value, startDate, endDate]
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, fixed_amount, free_shipping]
 *               value:
 *                 type: number
 *               minOrderAmount:
 *                 type: number
 *               usageLimit:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Promotion created
 */
router.post('/promotions', validate(createPromotionSchema), adminController.createPromotion);

/**
 * @swagger
 * /admin/analytics/sales:
 *   get:
 *     summary: Get sales analytics — revenue by day and top 10 products
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: salesByDay and topProducts arrays
 */
router.get('/analytics/sales', validate(salesAnalyticsSchema, 'query'), adminController.getSalesAnalytics);

export default router;

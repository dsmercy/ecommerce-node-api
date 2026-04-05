import { User } from '../models/user.model.js';
import { Order } from '../models/order.model.js';
import * as inventoryService from '../services/inventory.service.js';
import * as promotionService from '../services/promotion.service.js';
import { apiResponse } from '../utils/response.js';

export async function getDashboard(req, res, next) {
  try {
    const [totalUsers, totalOrders, pendingOrders, revenueResult, lowStockProducts] =
      await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.aggregate([
          { $match: { paymentStatus: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        inventoryService.getLowStockProducts(),
      ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    return apiResponse(res, {
      totalUsers,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      pendingOrders,
      lowStockProducts,
    }, 'Dashboard metrics fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req, res, next) {
  try {
    const { page, pageSize } = req.query;
    const skip = (page - 1) * pageSize;

    const [users, totalCount] = await Promise.all([
      User.find().select('-passwordHash -refreshToken').skip(skip).limit(pageSize).lean(),
      User.countDocuments(),
    ]);

    return apiResponse(res, { users, totalCount, page, pageSize }, 'Users fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-passwordHash -refreshToken');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return apiResponse(res, user, `User ${req.body.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    next(err);
  }
}

export async function getAllOrders(req, res, next) {
  try {
    const { page, pageSize } = req.query;
    const skip = (page - 1) * pageSize;

    const [orders, totalCount] = await Promise.all([
      Order.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .populate('userId', 'firstName lastName email')
        .lean(),
      Order.countDocuments(),
    ]);

    return apiResponse(res, { orders, totalCount, page, pageSize }, 'Orders fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function createPromotion(req, res, next) {
  try {
    const promo = await promotionService.createPromotion(req.body);
    return apiResponse(res, promo, 'Promotion created successfully', 201);
  } catch (err) {
    next(err);
  }
}

export async function getSalesAnalytics(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    const matchStage = { paymentStatus: 'completed' };
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const [salesByDay, topProducts] = await Promise.all([
      Order.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: '$_id', revenue: 1, orderCount: 1 } },
      ]),
      Order.aggregate([
        { $match: matchStage },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            name: 1,
            totalQuantity: 1,
            totalRevenue: 1,
          },
        },
      ]),
    ]);

    return apiResponse(res, { salesByDay, topProducts }, 'Sales analytics fetched successfully');
  } catch (err) {
    next(err);
  }
}

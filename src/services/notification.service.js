import { Notification } from '../models/notification.model.js';

export async function getUserNotifications(userId) {
  return Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
}

export async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) {
    const err = new Error('Notification not found');
    err.statusCode = 404;
    throw err;
  }
  notification.isRead = true;
  await notification.save();
  return notification;
}

export async function markAllAsRead(userId) {
  await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
}

export async function createNotification(userId, { title, message, type }) {
  return Notification.create({ userId, title, message, type });
}

export async function sendOrderConfirmation(userId, orderId, orderNumber) {
  return createNotification(userId, {
    title: 'Order Confirmed',
    message: `Your order #${orderNumber} is confirmed and being processed.`,
    type: 'order',
  });
}

export async function sendOrderUpdate(userId, orderId, orderNumber, status) {
  return createNotification(userId, {
    title: 'Order Update',
    message: `Your order #${orderNumber} status has been updated to: ${status}.`,
    type: 'order',
  });
}

export async function sendLowStockAlert(adminUserIds, productName, stockQty) {
  await Promise.all(
    adminUserIds.map((adminId) =>
      createNotification(adminId, {
        title: 'Low Stock Alert',
        message: `Product "${productName}" is running low on stock (${stockQty} remaining).`,
        type: 'system',
      })
    )
  );
}

export async function sendWelcome(userId) {
  return createNotification(userId, {
    title: 'Welcome!',
    message: 'Welcome to our e-commerce platform. Start shopping today!',
    type: 'system',
  });
}

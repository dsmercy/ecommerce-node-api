import * as notificationService from '../services/notification.service.js';
import { apiResponse } from '../utils/response.js';

export async function getNotifications(req, res, next) {
  try {
    const data = await notificationService.getUserNotifications(req.user.id);
    return apiResponse(res, data, 'Notifications fetched successfully');
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const data = await notificationService.markAsRead(req.params.id, req.user.id);
    return apiResponse(res, data, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return apiResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

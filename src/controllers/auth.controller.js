import * as authService from '../services/auth.service.js';
import { apiResponse, apiError } from '../utils/response.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body, 'customer');
    return apiResponse(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
}

export async function registerSeller(req, res, next) {
  try {
    const result = await authService.register(req.body, 'seller');
    return apiResponse(res, result, 'Seller registration successful', 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return apiResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);
    return apiResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    return apiResponse(res, result, 'Token refreshed');
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    return apiResponse(res, null, 'Password changed successfully');
  } catch (err) {
    next(err);
  }
}

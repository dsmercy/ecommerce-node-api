import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { apiError } from '../utils/response.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return apiError(res, 'Unauthorised', 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.id, email: payload.email, role: payload.role };
    next();
  } catch {
    return apiError(res, 'Unauthorised', 401);
  }
}

export function authorise(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return apiError(res, 'Forbidden', 403);
    }
    next();
  };
}

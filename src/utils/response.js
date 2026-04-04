export function apiResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: [],
    timestamp: new Date().toISOString(),
  });
}

export function apiError(res, message = 'An error occurred', statusCode = 400, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    timestamp: new Date().toISOString(),
  });
}

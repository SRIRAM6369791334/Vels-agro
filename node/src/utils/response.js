/**
 * Standard API Response Handlers
 * Enforces statusCode in every payload per architecture standards
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const payload = {
    success: true,
    statusCode,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && { meta })
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', error = null, data = null) => {
  const payload = {
    success: false,
    statusCode,
    message,
    ...(error !== null && { error }),
    ...(data !== null && { data })
  };
  return res.status(statusCode).json(payload);
};

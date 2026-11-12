import { sendError } from '../utils/response.js';

/**
 * Universal Request Validation Middleware using Zod Schemas
 * Validates req.body, req.query, or req.params and formats clear, user-friendly errors
 */
export const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const issues = result.error.issues || result.error.errors || [];
        const formattedErrors = issues.map((err) => ({
          field: err.path.join('.') || 'root',
          message: err.message
        }));

        const primaryMessage = formattedErrors.length > 0 
          ? `Validation error on '${formattedErrors[0].field}': ${formattedErrors[0].message}`
          : 'Invalid request data provided.';

        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: primaryMessage,
          errors: formattedErrors
        });
      }

      // Replace with validated and sanitized data
      req[target] = result.data;
      next();
    } catch (err) {
      console.error('Validation Middleware Error:', err);
      return sendError(res, 500, 'Internal validation error.');
    }
  };
};

export default validate;

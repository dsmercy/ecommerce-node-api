import { apiError } from '../utils/response.js';

export function validate(schema, target = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return apiError(res, 'Validation failed', 400, messages);
    }

    req[target] = value;
    next();
  };
}

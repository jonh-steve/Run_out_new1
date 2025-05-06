const { ValidationError } = require('../errors/apiError');

/**
 * Middleware validation dựa trên schema
 * @param {Object} schema - Joi schema hoặc validation schema
 * @param {String} source - Nguồn dữ liệu cần validate ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      const validationErrors = {};

      error.details.forEach((detail) => {
        const path = detail.path.join('.');
        validationErrors[path] = detail.message;
      });

      return next(new ValidationError('Validation failed', validationErrors));
    }

    // Gán lại dữ liệu đã được validate vào request
    req[source] = value;
    return next();
  };
};

module.exports = validate;

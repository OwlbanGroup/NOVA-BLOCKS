const joi = require('joi');

// ============================================
// Validation Schemas
// ============================================

// Login request validation
const loginSchema = joi.object({
  email: joi.string().email().required().label('Email'),
  password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')).required().label('Password'),
});

// Register request validation
const registerSchema = joi.object({
  name: joi.string().min(2).max(50).required().label('Name'),
  email: joi.string().email().required().label('Email'),
  password: joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$')).required().label('Password'),
  role: joi.string().valid('user', 'admin').default('user').label('Role'),
});

// GPU matrix multiplication request validation
const matrixMultiplySchema = joi.object({
  matrixA: joi.array().items(joi.array().items(joi.number()).required()).required().label('Matrix A'),
  matrixB: joi.array().items(joi.array().items(joi.number()).required()).required().label('Matrix B'),
});

// GPU health check query validation
const healthCheckSchema = joi.object({
  includeStats: joi.boolean().default(true).label('Include Stats'),
});

// ============================================
// Validation Middleware
// ============================================

/**
 * Validate request body against a joi schema
 * @param {import('joi').ObjectSchema} schema - The joi schema to validate against
 * @returns {function} Express middleware function
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      // Allow additional queries/params that aren't in the schema
      allowUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message).join(', ');
      console.error(`Validation error at ${req.method} ${req.url}: ${errorDetails}`);
      return res.status(400).json({
        message: 'Validation error',
        details: errorDetails,
      });
    }

    // Replace req.body with the validated and stripped value
    req.body = value;
    next();
  };
}

/**
 * Validate request query parameters against a joi schema
 * @param {import('joi').ObjectSchema} schema - The joi schema to validate against
 * @returns {function} Express middleware function
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message).join(', ');
      console.error(`Query validation error at ${req.method} ${req.url}: ${errorDetails}`);
      return res.status(400).json({
        message: 'Validation error',
        details: errorDetails,
      });
    }

    req.query = value;
    next();
  };
}

/**
 * Validate request params against a joi schema
 * @param {import('joi').ObjectSchema} schema - The joi schema to validate against
 * @returns {function} Express middleware function
 */
function validateParams(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorDetails = error.details.map(detail => detail.message).join(', ');
      console.error(`Params validation error at ${req.method} ${req.url}: ${errorDetails}`);
      return res.status(400).json({
        message: 'Validation error',
        details: errorDetails,
      });
    }

    req.params = value;
    next();
  };
}

module.exports = {
  loginSchema,
  registerSchema,
  matrixMultiplySchema,
  healthCheckSchema,
  validateRequest,
  validateQuery,
  validateParams,
};
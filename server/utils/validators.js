const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation results
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: messages.join('. '),
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Register validation chain
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['client', 'freelancer'])
    .withMessage('Role must be either client or freelancer'),
  validate,
];

/**
 * Login validation chain
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

/**
 * Project creation validation chain
 */
const validateProject = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('budget.min')
    .notEmpty()
    .withMessage('Minimum budget is required')
    .isNumeric()
    .withMessage('Minimum budget must be a number')
    .custom((value) => value >= 0)
    .withMessage('Minimum budget cannot be negative'),
  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
  body('budget.type')
    .optional()
    .isIn(['fixed', 'hourly'])
    .withMessage('Budget type must be fixed or hourly'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  validate,
];

/**
 * Proposal submission validation chain
 */
const validateProposal = [
  body('coverLetter')
    .trim()
    .notEmpty()
    .withMessage('Cover letter is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Cover letter must be between 50 and 5000 characters'),
  body('bidAmount')
    .notEmpty()
    .withMessage('Bid amount is required')
    .isNumeric()
    .withMessage('Bid amount must be a number')
    .custom((value) => parseFloat(value) > 0)
    .withMessage('Bid amount must be greater than 0'),
  body('estimatedDays')
    .notEmpty()
    .withMessage('Estimated days is required')
    .isInt({ min: 1 })
    .withMessage('Estimated days must be a positive integer'),
  validate,
];

/**
 * Review submission validation chain
 */
const validateReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Comment must be between 10 and 2000 characters'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  validate,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProject,
  validateProposal,
  validateReview,
  validate,
};

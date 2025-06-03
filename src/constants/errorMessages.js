/**
 * Custom error messages
 */
module.exports = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  ACCOUNT_NOT_VERIFIED: 'Your account is not verified. Please check your email for verification link.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_INVALID: 'Invalid authentication token.',
  TOKEN_MISSING: 'Authentication token is missing.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // User related errors
  USER_NOT_FOUND: 'User not found.',
  USER_ALREADY_EXISTS: 'User with this email already exists.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_TOO_WEAK: 'Password is too weak. It should contain at least 8 characters, including uppercase, lowercase, numbers and special characters.',
  
  // Product related errors
  PRODUCT_NOT_FOUND: 'Product not found.',
  PRODUCT_OUT_OF_STOCK: 'Product is out of stock.',
  
  // Order related errors
  ORDER_NOT_FOUND: 'Order not found.',
  INVALID_ORDER_STATUS: 'Invalid order status.',
  
  // General errors
  VALIDATION_ERROR: 'Validation error occurred.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'Resource not found.',
  BAD_REQUEST: 'Bad request.',
  FORBIDDEN: 'Forbidden action.',
};

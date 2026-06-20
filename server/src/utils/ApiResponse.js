/**
 * Standardized API response wrapper
 * Ensures all API responses follow a consistent format
 */
class ApiResponse {
  /**
   * Create a success response
   * @param {string} message - Success message
   * @param {Object} data - Response data payload
   * @returns {{ success: boolean, message: string, data: Object }}
   */
  static success(message = 'Success', data = {}) {
    return {
      success: true,
      message,
      data,
    };
  }

  /**
   * Create an error response
   * @param {string} message - Error message
   * @param {Object} errors - Validation or detail errors
   * @returns {{ success: boolean, message: string, errors: Object }}
   */
  static error(message = 'An error occurred', errors = {}) {
    return {
      success: false,
      message,
      errors,
    };
  }
}

module.exports = ApiResponse;

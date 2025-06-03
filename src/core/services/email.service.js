/**
 * Email service for sending emails
 */
const logger = require('../../config/logger');

/**
 * Email service that can be implemented with a real email provider
 * Currently, it's a mock implementation for development
 */
class EmailService {
  /**
   * Send a welcome email to a new user
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient name
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<boolean>} True if email sent successfully
   */
  static async sendWelcomeEmail(email, name, verificationToken) {
    try {
      logger.info(`[Mock Email] Welcome email sent to ${email} with verification token: ${verificationToken}`);
      
      // In a real implementation, you would use a service like Sendgrid, Mailgun, etc.
      // const emailData = {
      //   to: email,
      //   subject: 'Welcome to Our Platform - Verify Your Email',
      //   template: 'welcome',
      //   context: { name, verificationToken },
      // };
      // await emailProvider.send(emailData);
      
      return true;
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      return false;
    }
  }
  
  /**
   * Send a password reset email
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient name
   * @param {string} resetToken - Password reset token
   * @returns {Promise<boolean>} True if email sent successfully
   */
  static async sendPasswordResetEmail(email, name, resetToken) {
    try {
      logger.info(`[Mock Email] Password reset email sent to ${email} with reset token: ${resetToken}`);
      
      // In a real implementation, you would use a service like Sendgrid, Mailgun, etc.
      // const emailData = {
      //   to: email,
      //   subject: 'Reset Your Password',
      //   template: 'password-reset',
      //   context: { name, resetToken },
      // };
      // await emailProvider.send(emailData);
      
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }
  
  /**
   * Send an order confirmation email
   * @param {string} email - Recipient email address
   * @param {string} name - Recipient name
   * @param {object} order - Order details
   * @returns {Promise<boolean>} True if email sent successfully
   */
  static async sendOrderConfirmationEmail(email, name, order) {
    try {
      logger.info(`[Mock Email] Order confirmation email sent to ${email} for order ID: ${order.id}`);
      
      // In a real implementation, you would use a service like Sendgrid, Mailgun, etc.
      // const emailData = {
      //   to: email,
      //   subject: 'Your Order Confirmation',
      //   template: 'order-confirmation',
      //   context: { name, order },
      // };
      // await emailProvider.send(emailData);
      
      return true;
    } catch (error) {
      logger.error('Error sending order confirmation email:', error);
      return false;
    }
  }
}

module.exports = EmailService;

/**
 * Global test setup file
 * This file runs before Jest is loaded, allowing us to set up the testing environment
 */

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Silence console logs during tests unless explicitly testing them
if (process.env.SHOW_LOGS !== 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Add any other global test setup needed

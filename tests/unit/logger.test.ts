/**
 * 🔥 Electric Safai - Logger Unit Tests
 */

import { createLogger, setLogLevel, getLogLevel, Logger } from '../../src/logger';

describe('Logger', () => {
  let logger: Logger;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = createLogger('test-logger');
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    setLogLevel('debug'); // Enable all log levels for testing
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    setLogLevel('info'); // Reset to default
  });

  describe('createLogger', () => {
    it('should create a logger with all log methods', () => {
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should use default name if not provided', () => {
      const defaultLogger = createLogger();
      defaultLogger.info('test message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('log levels', () => {
    it('should log debug messages when level is debug', () => {
      setLogLevel('debug');
      logger.debug('debug message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should not log debug messages when level is info', () => {
      setLogLevel('info');
      logger.debug('debug message');
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should log info messages when level is info', () => {
      setLogLevel('info');
      logger.info('info message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('warn message');
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log error messages to stderr', () => {
      logger.error('error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('message formatting', () => {
    it('should format %s placeholders', () => {
      logger.info('Hello %s', 'World');
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Hello World');
    });

    it('should format %d placeholders', () => {
      logger.info('Count: %d', 42);
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Count: 42');
    });

    it('should format %j placeholders as JSON', () => {
      logger.info('Data: %j', { key: 'value' });
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('Data: {"key":"value"}');
    });

    it('should handle multiple placeholders', () => {
      logger.info('User %s has %d items', 'Alice', 5);
      const call = consoleSpy.mock.calls[0][0];
      expect(call).toContain('User Alice has 5 items');
    });
  });

  describe('getLogLevel / setLogLevel', () => {
    it('should get and set log level', () => {
      setLogLevel('warn');
      expect(getLogLevel()).toBe('warn');

      setLogLevel('error');
      expect(getLogLevel()).toBe('error');

      setLogLevel('info');
      expect(getLogLevel()).toBe('info');
    });
  });
});

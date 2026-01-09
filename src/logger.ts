/**
 * 🔥 Electric Safai - Logger
 * Beautiful logging for the CLI
 */

import chalk from 'chalk';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  error: (message: string, ...args: unknown[]) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';

/**
 * 🎨 Format message with printf-style substitutions
 */
function formatMessage(message: string, args: unknown[]): string {
  let result = message;
  let argIndex = 0;

  result = result.replace(/%([jsdio])/g, (match, type) => {
    if (argIndex >= args.length) return match;
    const arg = args[argIndex++];

    switch (type) {
      case 'j':
        return JSON.stringify(arg);
      case 's':
        return String(arg);
      case 'd':
      case 'i':
        return String(parseInt(String(arg), 10));
      case 'o':
        return JSON.stringify(arg, null, 2);
      default:
        return match;
    }
  });

  return result;
}

/**
 * 🎯 Create a timestamp
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 📝 Create logger instance
 */
export function createLogger(name: string = 'es-search'): Logger {
  const log = (level: LogLevel, message: string, ...args: unknown[]): void => {
    if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) {
      return;
    }

    const timestamp = getTimestamp();
    const formattedMessage = formatMessage(message, args);
    const prefix = `[${timestamp}] [${name}]`;

    switch (level) {
      case 'debug':
        console.log(chalk.gray(`${prefix} ${chalk.blue('DEBUG')} ${formattedMessage}`));
        break;
      case 'info':
        console.log(chalk.gray(`${prefix}`) + ` ${chalk.green('INFO')} ${formattedMessage}`);
        break;
      case 'warn':
        console.log(chalk.gray(`${prefix}`) + ` ${chalk.yellow('WARN')} ${formattedMessage}`);
        break;
      case 'error':
        console.error(chalk.gray(`${prefix}`) + ` ${chalk.red('ERROR')} ${formattedMessage}`);
        break;
    }
  };

  return {
    debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
    info: (message: string, ...args: unknown[]) => log('info', message, ...args),
    warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
    error: (message: string, ...args: unknown[]) => log('error', message, ...args),
  };
}

/**
 * 🔧 Set global log level
 */
export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

/**
 * 🔍 Get current log level
 */
export function getLogLevel(): LogLevel {
  return currentLevel;
}

/**
 * Siftly Professional Logger — Google SWE Style
 *
 * Provides structured, hierarchical logging with context tags,
 * timestamps, and color-coded output for development.
 * Silences verbose logs in production builds.
 */
import { IS_DEBUG } from '../config/app';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 99,
}

const COLORS = {
  [LogLevel.DEBUG]: '\x1b[38;5;245m', // Gray
  [LogLevel.INFO]: '\x1b[34m', // Blue
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.SILENT]: '', // Empty
  RESET: '\x1b[0m',
};

const LABELS = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO ',
  [LogLevel.WARN]: 'WARN ',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.SILENT]: 'SILENT',
};

class Logger {
  private context: string;
  private minLevel: LogLevel;

  constructor(context: string = 'App') {
    this.context = context;
    // In production, we only show WARN and ERROR by default.
    // In debug mode, we show everything.
    this.minLevel = IS_DEBUG ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /** Gets a child logger with a sub-context. */
  for(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    if (level < this.minLevel) return;

    const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
    const label = LABELS[level];
    const color = COLORS[level];

    // In the browser, we use %c for styling. In node/extension, we use ANSI colors.
    const isBrowser = typeof window !== 'undefined' && (window as any).chrome === undefined;

    if (isBrowser) {
      const style = this.getBrowserStyle(level);
      console.log(`%c[${timestamp}] [${label}] [${this.context}] %s`, style, message, ...args);
    } else {
      // ANSI colors for extension consoles or terminal
      console.log(
        `${color}[${timestamp}] [${label}] [${this.context}]${COLORS.RESET} ${message}`,
        ...args
      );
    }
  }

  private getBrowserStyle(level: LogLevel): string {
    const base = 'font-weight: bold; border-radius: 2px; padding: 2px 4px;';
    switch (level) {
      case LogLevel.DEBUG:
        return `${base} color: #888;`;
      case LogLevel.INFO:
        return `${base} color: #007AFF;`;
      case LogLevel.WARN:
        return `${base} background: #FFF9C4; color: #F57F17;`;
      case LogLevel.ERROR:
        return `${base} background: #FFEBEE; color: #D32F2F;`;
      default:
        return base;
    }
  }
}

// Global default logger
export const logger = new Logger('Siftly');
export default logger;

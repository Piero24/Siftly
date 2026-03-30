import { logger } from '../lib/logger';

const bgLogger = logger.for('Background');

bgLogger.info('Siftly Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  bgLogger.info('Siftly Job Tracker Extension Installed');
});

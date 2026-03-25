console.log('Lumina Background Service Worker Initialized');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Lumina Job Tracker Extension Installed');
});

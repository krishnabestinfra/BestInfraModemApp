// Version check configuration
// You can host the version.json file anywhere:
// - GitHub (raw.githubusercontent.com)
// - Your website
// - Any CDN
// - Firebase Hosting, etc.

export const VERSION_CHECK_URL = 'https://your-website.com/version.json';
// Example GitHub: 'https://raw.githubusercontent.com/yourusername/yourrepo/main/version.json'

// Fallback version info (used if remote check fails)
export const FALLBACK_VERSION_CONFIG = {
  minimumVersion: '1.0.0', // Set this to force update
  message: 'A new version is available. Please update to continue.',
  storeUrl: {
    android: 'https://play.google.com/store/apps/details?id=com.bestinfra.app',
    ios: 'https://apps.apple.com/app/id...', // Replace with your iOS app ID
  },
};



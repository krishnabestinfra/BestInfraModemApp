export const colors = {
  // BestInfra Primary Colors
  primary: '#163b7c', // BestInfra Blue
  secondary: '#55B56C', // BestInfra Green
  success: '#55b56c', // BestInfra Green
  warning: '#FF9800',
  error: '#F44336',
  info: '#163b7c', // BestInfra Blue

  // Background colors
  background: '#f5f8fc', // Light blue background
  cardBackground: '#FFFFFF',
  surface: '#FFFFFF',

  // Text colors
  textPrimary: '#202d59', // BestInfra Dark Blue
  textSecondary: '#475d89', // BestInfra Medium Blue
  textLight: '#7e7e7e',

  // Status colors
  connected: '#55b56c', // BestInfra Green
  disconnected: '#F44336',
  warning: '#FF9800',

  // Chart colors - BestInfra themed
  chartColors: ['#163b7c', '#55b56c', '#2a6f65', '#1f3d6d', '#85b56c'],

  // Border and shadow
  border: '#e9efff', // Light blue border
  shadow: '#163b7c', // BestInfra Blue shadow
};

export const spacing = {
  xs: 4,
  xsm: 6,
  sm: 8,
  ms:12,
  md: 16,
  ml: 18,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  sm: 4,
  xs: 6,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal',
    lineHeight: 16,
  },
};

export const shadows = {
  small: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 4,
  },
  large: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 8,
  },
}; 
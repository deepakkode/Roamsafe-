// Theme configuration for Roamsafe
// Professional balanced theme - Corporate/Enterprise style

// Balanced professional color scheme
export const colors = {
  // Base theme colors - Balanced grays with depth
  background: '#f5f7fa',
  backgroundAlt: '#ffffff',
  surface: '#ffffff',
  surfaceLight: '#f8f9fb',
  surfaceHover: '#f8f9fb',
  surfaceDark: '#e8ecf1',
  text: '#1a202c',
  textSecondary: '#4a5568',
  textTertiary: '#718096',
  border: '#e2e8f0',
  borderDark: '#cbd5e0',
  
  // Safety indicator colors - Professional and clear
  safe: '#48bb78',
  safeLight: '#c6f6d5',
  safeDark: '#38a169',
  moderate: '#ed8936',
  moderateLight: '#feebc8',
  moderateDark: '#dd6b20',
  danger: '#f56565',
  dangerLight: '#fed7d7',
  dangerDark: '#e53e3e',
  
  // Professional accent colors
  primary: '#4299e1',
  primaryLight: '#bee3f8',
  primaryDark: '#3182ce',
  secondary: '#667eea',
  secondaryLight: '#e9d8fd',
  secondaryDark: '#5a67d8',
  
  // Neutral grays
  gray50: '#f7fafc',
  gray100: '#edf2f7',
  gray200: '#e2e8f0',
  gray300: '#cbd5e0',
  gray400: '#a0aec0',
  gray500: '#718096',
  gray600: '#4a5568',
  gray700: '#2d3748',
  gray800: '#1a202c',
  gray900: '#171923',
};

// Button sizes with modern styling
export const buttonSizes = {
  small: {
    height: 40,
    paddingHorizontal: 20,
    fontSize: 14,
    borderRadius: 8,
  },
  medium: {
    height: 52,
    paddingHorizontal: 28,
    fontSize: 16,
    borderRadius: 12,
  },
  large: {
    height: 64,
    paddingHorizontal: 36,
    fontSize: 18,
    borderRadius: 16,
  },
  emergency: {
    height: 96,
    paddingHorizontal: 48,
    fontSize: 22,
    borderRadius: 24,
  },
};

// Modern typography with better hierarchy
export const typography = {
  h1: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
    color: colors.text,
    letterSpacing: -1,
  },
  h2: {
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 44,
    color: colors.text,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
    color: colors.text,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
    color: colors.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: colors.text,
  },
  bodySecondary: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};

// Generous spacing for breathing room
export const spacing = {
  xs: 6,
  sm: 12,
  md: 20,
  lg: 32,
  xl: 48,
  xxl: 64,
  xxxl: 96,
};

// Modern border radius
export const borderRadius = {
  small: 8,
  medium: 12,
  large: 20,
  xlarge: 28,
  round: 999,
};

// Professional shadows with depth
export const shadows = {
  small: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
  },
  medium: {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
  },
  large: {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  },
  glow: {
    boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
  },
  glowGreen: {
    boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)',
  },
  glowRed: {
    boxShadow: '0 0 24px rgba(239, 68, 68, 0.4)',
  },
};

// Travel-themed UI constants (Requirement 6.1)
export const theme = {
  colors,
  buttonSizes,
  typography,
  spacing,
  borderRadius,
  shadows,
};

export default theme;

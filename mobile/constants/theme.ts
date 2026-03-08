import { Platform } from 'react-native';

export const AppColors = {
  // Primary palette
  primary: '#1B2A4A',       // Deep Navy
  primaryLight: '#2D4373',  // Navy Light
  primaryDark: '#0F1B33',   // Navy Dark
  
  // Accent
  accent: '#3B82F6',        // Bright Blue
  accentLight: '#60A5FA',   // Light Blue
  accentDark: '#2563EB',    // Dark Blue
  
  // Status colors
  success: '#10B981',       // Emerald
  successLight: '#D1FAE5',
  warning: '#F59E0B',       // Amber
  warningLight: '#FEF3C7',
  danger: '#EF4444',        // Red
  dangerLight: '#FEE2E2',
  info: '#3B82F6',          // Blue
  infoLight: '#DBEAFE',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#F0F4F8',    // Cool Gray background
  surface: '#FFFFFF',
  surfaceElevated: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  
  // Shadows
  shadowColor: '#1B2A4A',
  
  // Disabled
  disabled: '#CBD5E1',
  disabledText: '#94A3B8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadows = {
  sm: Platform.select({
    ios: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
    default: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
    default: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
    android: {
      elevation: 6,
    },
    default: {
      shadowColor: AppColors.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
    },
  }),
};

// Re-export for backward compatibility
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

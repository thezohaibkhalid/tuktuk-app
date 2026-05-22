import '@/global.css';

import { Platform } from 'react-native';

// Brand palette mirrors store/app/globals.css (the Next.js web storefront).
// Keep these values in sync if the web theme changes.
const brand = {
  primary: '#f4ce55',
  primaryHover: '#e8c044',
  primaryLight: '#fef7e1',
  primaryBorder: '#fae4a2',
  secondary: '#071a3d',
  secondaryLight: '#e8eef9',
  accent: '#5fa843',
  accentLight: '#eaf7e6',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  sale: '#ef4444',
  saleLight: '#fee2e2',
  ring: '#f9b31a',
} as const;

export const Colors = {
  light: {
    text: '#071a3d',
    textSecondary: '#64748b',
    textLight: '#94a3b8',
    background: '#fffdf7',
    backgroundElement: '#ffffff',
    backgroundSelected: '#f8fafc',
    surface: '#ffffff',
    surfaceSoft: '#f8fafc',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    ...brand,
  },
  dark: {
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    textLight: '#94a3b8',
    background: '#0b1430',
    backgroundElement: '#101b3d',
    backgroundSelected: '#162348',
    surface: '#101b3d',
    surfaceSoft: '#0e1736',
    border: '#1e2a52',
    borderLight: '#162348',
    ...brand,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

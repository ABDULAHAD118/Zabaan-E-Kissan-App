/**
 * Modern Colors for Zabaan-e-Kisaan app - a farming app with disease detection, chat, and crop price features.
 * Supporting both light and dark themes with beautiful, accessible colors.
 */

export const Colors = {
  light: {
    // Primary Colors
    primary: '#059669',
    primaryLight: '#10B981',
    primaryDark: '#047857',
    
    // Secondary Colors
    secondary: '#10B981',
    secondaryLight: '#34D399',
    secondaryDark: '#059669',
    
    // Accent Colors
    accent: '#F59E0B',
    accentLight: '#FBBF24',
    accentDark: '#D97706',
    
    // Status Colors
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#3B82F6',
    
    // Background Colors
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    card: '#FFFFFF',
    
    // Text Colors
    text: '#1E293B',
    textSecondary: '#475569',
    textTertiary: '#64748B',
    
    // Border & Outline Colors
    outline: '#059669',
    outlineVariant: '#E2E8F0',
    border: '#E2E8F0',
    
    // Interactive Colors
    button: '#059669',
    buttonText: '#FFFFFF',
    buttonSecondary: '#F1F5F9',
    buttonSecondaryText: '#475569',
    
    // Highlight & Shadow Colors
    highlight: '#ECFDF5',
    shadow: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.5)',
    
    // Input Colors
    input: '#F8FAFC',
    inputBorder: '#CBD5E1',
    inputFocus: '#059669',
    
    // Special Colors
    link: '#059669',
    disabled: '#94A3B8',
    divider: '#E2E8F0',
  },
  
  dark: {
    // Primary Colors
    primary: '#10B981',
    primaryLight: '#34D399',
    primaryDark: '#059669',
    
    // Secondary Colors
    secondary: '#34D399',
    secondaryLight: '#6EE7B7',
    secondaryDark: '#10B981',
    
    // Accent Colors
    accent: '#FBBF24',
    accentLight: '#FCD34D',
    accentDark: '#F59E0B',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',
    
    // Background Colors
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    card: '#1E293B',
    
    // Text Colors
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    
    // Border & Outline Colors
    outline: '#475569',
    outlineVariant: '#334155',
    border: '#334155',
    
    // Interactive Colors
    button: '#10B981',
    buttonText: '#0F172A',
    buttonSecondary: '#334155',
    buttonSecondaryText: '#CBD5E1',
    
    // Highlight & Shadow Colors
    highlight: '#064E3B',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // Input Colors
    input: '#1E293B',
    inputBorder: '#475569',
    inputFocus: '#10B981',
    
    // Special Colors
    link: '#10B981',
    disabled: '#475569',
    divider: '#334155',
  }
} as const;

export type ColorScheme = keyof typeof Colors;
export type ColorKey = keyof typeof Colors.light;

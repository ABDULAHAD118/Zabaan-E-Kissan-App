/**
 * Colors for Zabaan-e-Kisaan app - a farming app with disease detection, chat, and crop price features.
 * Supporting both light and dark themes with colors related to farming and agriculture.
 */

const tintColorLight = '#4CAF50'; // Green for farming theme
const tintColorDark = '#8BC34A'; // Light green for dark theme

export const Colors = {
  light: {
    text: '#11181C',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#2E7D32',
    tabIconDefault: '#689F38',
    tabIconSelected: tintColorLight,
    primary: '#4CAF50',
    secondary: '#8BC34A',
    accent: '#FFC107',
    success: '#2E7D32',
    warning: '#FF8F00',
    error: '#D32F2F',
  },
  dark: {
    text: '#ECEDEE',
    background: '#1B5E20', // Dark green background
    tint: tintColorDark,
    icon: '#8BC34A',
    tabIconDefault: '#689F38',
    tabIconSelected: tintColorDark,
    primary: '#8BC34A',
    secondary: '#689F38',
    accent: '#FFA000',
    success: '#81C784',
    warning: '#FFB74D',
    error: '#EF5350',
  },
};

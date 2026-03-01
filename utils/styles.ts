import { Colors, ColorScheme } from '@/constants/Colors';

export type StyleFunction = (colorScheme: ColorScheme) => any;

// Color utilities
export const getColor = (colorScheme: ColorScheme, colorKey: keyof typeof Colors.light) => {
  return Colors[colorScheme][colorKey];
};

// Common style combinations
export const getHeaderStyle = (colorScheme: ColorScheme) => ({
  paddingTop: 50,
  paddingHorizontal: 16,
  paddingBottom: 16,
  backgroundColor: getColor(colorScheme, 'primary'),
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
  shadowColor: getColor(colorScheme, 'shadow'),
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 8,
});

export const getCardStyle = (colorScheme: ColorScheme) => ({
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  borderWidth: 1,
  backgroundColor: getColor(colorScheme, 'surface'),
  borderColor: getColor(colorScheme, 'outline'),
  shadowColor: getColor(colorScheme, 'shadow'),
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
});

export const getButtonStyle = (colorScheme: ColorScheme, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseStyle = {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: getColor(colorScheme, 'primary'),
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: getColor(colorScheme, 'buttonSecondary'),
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: getColor(colorScheme, 'primary'),
      };
    default:
      return baseStyle;
  }
};

export const getInputStyle = (colorScheme: ColorScheme) => ({
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 5,
  borderWidth: 1,
  fontSize: 16,
  backgroundColor: getColor(colorScheme, 'input'),
  borderColor: getColor(colorScheme, 'inputBorder'),
  color: getColor(colorScheme, 'text'),
});

export const getSearchInputStyle = (colorScheme: ColorScheme) => ({
  borderRadius: 24,
  paddingHorizontal: 16,
  paddingVertical: 12,
  paddingLeft: 48,
  fontSize: 16,
  borderWidth: 1,
  backgroundColor: getColor(colorScheme, 'surfaceVariant'),
  borderColor: getColor(colorScheme, 'outline'),
  color: getColor(colorScheme, 'text'),
});

export const getCityChipStyle = (colorScheme: ColorScheme, isSelected: boolean) => ({
  marginRight: 12,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 2,
  backgroundColor: isSelected ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'surface'),
  borderColor: isSelected ? getColor(colorScheme, 'primary') : getColor(colorScheme, 'outline'),
});

export const getPriceCardStyle = (colorScheme: ColorScheme) => ({
  padding: 16,
  borderRadius: 16,
  marginBottom: 16,
  borderWidth: 1,
  backgroundColor: getColor(colorScheme, 'surface'),
  borderColor: getColor(colorScheme, 'outline'),
  shadowColor: getColor(colorScheme, 'shadow'),
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 4,
  elevation: 2,
});

export const getStatusBadgeStyle = (colorScheme: ColorScheme, status: 'success' | 'warning' | 'error' | 'info') => {
  const statusColors = {
    success: getColor(colorScheme, 'success'),
    warning: getColor(colorScheme, 'warning'),
    error: getColor(colorScheme, 'error'),
    info: getColor(colorScheme, 'info'),
  };

  return {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: statusColors[status],
  };
};

// Text styles
export const getTextStyle = (colorScheme: ColorScheme, variant: 'title' | 'subtitle' | 'heading' | 'body' | 'caption' | 'small' = 'body') => {
  const baseStyle = {
    color: getColor(colorScheme, 'buttonText'),
  };

  switch (variant) {
    case 'title':
      return {
        ...baseStyle,
        fontSize: 28,
          lineHeight: 45,
        fontWeight: 'bold' as const,
      };
    case 'subtitle':
      return {
        ...baseStyle,
        fontSize: 20,
        fontWeight: '600' as const,
      };
    case 'heading':
      return {
        ...baseStyle,
        fontSize: 18,
        fontWeight: '600' as const,
      };
    case 'body':
      return {
        ...baseStyle,
        fontSize: 16,
        fontWeight: '400' as const,
      };
    case 'caption':
      return {
        ...baseStyle,
        fontSize: 14,
        fontWeight: '400' as const,
      };
    case 'small':
      return {
        ...baseStyle,
        fontSize: 12,
        fontWeight: '400' as const,
      };
    default:
      return baseStyle;
  }
};

// Layout utilities
export const getContainerStyle = (colorScheme: ColorScheme) => ({
  flex: 1,
  backgroundColor: getColor(colorScheme, 'background'),
});

export const getSectionStyle = (colorScheme: ColorScheme) => ({
  paddingHorizontal: 16,
  paddingVertical: 16,
  backgroundColor: getColor(colorScheme, 'background'),
});

export const getContentStyle = () => ({
  flex: 1,
  paddingHorizontal: 16,
});

// Spacing utilities
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const getSpacing = (size: keyof typeof spacing) => spacing[size];

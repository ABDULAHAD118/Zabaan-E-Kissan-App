import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View
      style={{
        backgroundColor: colors.highlight,
        borderRadius: 24,
        flex: 1,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

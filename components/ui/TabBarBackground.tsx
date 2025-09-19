import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  return (
    <View 
      style={{
        backgroundColor: colors.surface,
        borderTopColor: colors.outline + '30',
        borderTopWidth: 1,
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}

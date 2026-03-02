import { View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabBarBackground() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  return (
    <View 
      style={{
          backgroundColor: colors.highlight, // your desired color
          borderRadius: 24,
          flex: 1,
      }}
    />
  );
}


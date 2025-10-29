import React, { useState } from "react";
import { TouchableOpacity, View, Animated } from "react-native";
import { ThemedText } from "./ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export function Collapsible({ title, children, theme = 'light' }: CollapsibleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500], // Adjust this value based on your content
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 16,
          backgroundColor: theme === 'light' ? Colors.light.surface : Colors.dark.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme === 'light' ? Colors.light.outline : Colors.dark.outline,
        }}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: theme === 'light' ? Colors.light.text : Colors.dark.text,
          }}
        >
          {title}
        </ThemedText>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={theme === 'light' ? Colors.light.primary : Colors.dark.primary}
        />
      </TouchableOpacity>
      
      <Animated.View
        style={{
          maxHeight,
          overflow: 'hidden',
          backgroundColor: theme === 'light' ? Colors.light.surfaceVariant : Colors.dark.surfaceVariant,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderColor: theme === 'light' ? Colors.light.outline : Colors.dark.outline,
        }}
      >
        <View style={{ padding: 16 }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

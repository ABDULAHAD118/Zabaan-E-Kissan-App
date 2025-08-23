import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Entypo, Ionicons, FontAwesome6 } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.outline,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          paddingHorizontal: 16,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Disease Detection",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full ${focused ? 'bg-opacity-20' : ''}`} style={{
              backgroundColor: focused ? colors.primary + '20' : 'transparent'
            }}>
              <Entypo size={24} name="leaf" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full ${focused ? 'bg-opacity-20' : ''}`} style={{
              backgroundColor: focused ? colors.primary + '20' : 'transparent'
            }}>
              <Ionicons size={24} name="chatbubble-ellipses" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: "Crop Prices",
          tabBarIcon: ({ color, focused }) => (
            <View className={`p-2 rounded-full ${focused ? 'bg-opacity-20' : ''}`} style={{
              backgroundColor: focused ? colors.primary + '20' : 'transparent'
            }}>
              <FontAwesome6 size={24} name="chart-line" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

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
        tabBarInactiveTintColor: colors.outline + '80',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline + '30',
          height: Platform.OS === 'ios' ? 100 : 80,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 8,
          paddingHorizontal: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Disease Detection",
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
                marginBottom:5,
              backgroundColor: focused ? colors.primary + '30' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? colors.primary + '70' : 'transparent',
            }}>
              <Entypo 
                size={focused ? 24 : 22} 
                name="leaf" 
                color={focused ? colors.primary : color}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }]
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "AI Chat",
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
                marginBottom:5,
              backgroundColor: focused ? colors.primary + '30' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? colors.primary + '70' : 'transparent',
            }}>
              <Ionicons 
                size={focused ? 24 : 22} 
                name="chatbubble-ellipses" 
                color={focused ? colors.primary : color}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }]
                }}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="prices"
        options={{
          title: "Crop Prices",
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
                marginBottom:5,
              backgroundColor: focused ? colors.primary + '30' : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: focused ? 2 : 0,
              borderColor: focused ? colors.primary + '70' : 'transparent',
            }}>
              <FontAwesome6 
                size={focused ? 24 : 22} 
                name="chart-line" 
                color={focused ? colors.primary : color}
                style={{
                  transform: [{ scale: focused ? 1.1 : 1 }]
                }}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

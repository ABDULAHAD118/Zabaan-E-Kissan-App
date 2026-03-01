import { Tabs, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import { Alert, BackHandler, Platform, View } from "react-native";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Entypo, Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          t('common.confirm'),
          "Are you sure you want to exit?",
          [
            { text: t('common.cancel'), style: "cancel", onPress: () => {} },
            { text: t('common.yes'), onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: true }
        );
        return true; // prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline + '90',
        headerShown: false,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outline + '30',
          height: Platform.OS === 'ios' ? 100 : 80,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          paddingTop: 10,
          paddingHorizontal: 5,
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
          title: t('tabs.home'),
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
          title: t('tabs.chat'),
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
          title: t('tabs.prices'),
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
                name="trending-up" 
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

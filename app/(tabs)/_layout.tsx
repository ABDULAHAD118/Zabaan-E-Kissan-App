import {Tabs, useFocusEffect} from "expo-router";
import React, {useCallback} from "react";
import {Alert, BackHandler, Platform, View} from "react-native";
import {Colors} from "@/constants/Colors";
import {useColorScheme} from "@/hooks/useColorScheme";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? "light"];
    const {t} = useTranslation();

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                Alert.alert(
                    t('common.confirm'),
                    t('common.exitConfirm'),
                    [
                        {
                            text: t('common.cancel'), style: "cancel", onPress: () => {
                            }
                        },
                        {
                            text: t('common.yes'), onPress: async () => {
                                await AsyncStorage.clear();
                                BackHandler.exitApp()
                            }
                        },
                    ],
                    {cancelable: true}
                );
                return true; // prevent default behavior
            };

            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                onBackPress
            );

            return () => subscription.remove();
        }, [t])
    );

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.buttonSecondaryText,
                headerShown: false,
                lazy: false,
                tabBarStyle: {
                    shadowColor: 'transparent',
                    backgroundColor: colors.background,
                    height: Platform.OS === 'ios' ? 100 : 90,
                    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
                    paddingTop: 15,
                    paddingHorizontal: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    marginTop: 4,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: t('tabs.home'),

                    tabBarIcon: ({color, focused}) => (
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginBottom: 5,
                            backgroundColor: focused ? colors.primary + '30' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: focused ? 1 : 0,
                            borderColor: focused ? colors.primary + '70' : 'transparent',
                        }}>
                            <Ionicons
                                size={focused ? 24 : 22}
                                name={focused ? 'leaf' : 'leaf-outline'}
                                color={focused ? colors.primary : color}
                                style={{
                                    transform: [{scale: focused ? 1.1 : 1}]
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
                    tabBarIcon: ({color, focused}) => (
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginBottom: 5,
                            backgroundColor: focused ? colors.primary + '30' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: focused ? 1 : 0,
                            borderColor: focused ? colors.primary + '70' : 'transparent',
                        }}>
                            <Ionicons
                                size={focused ? 24 : 22}
                                name={ focused ? 'chatbubble-ellipses-sharp' : 'chatbubble-ellipses-outline'}
                                color={focused ? colors.primary : color}
                                style={{
                                    transform: [{scale: focused ? 1.1 : 1}]
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
                    lazy: false,
                    tabBarIcon: ({color, focused}) => (
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginBottom: 5,
                            backgroundColor: focused ? colors.primary + '30' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: focused ? 1 : 0,
                            borderColor: focused ? colors.primary + '70' : 'transparent',
                        }}>
                            <Ionicons
                                size={focused ? 24 : 22}
                                name={focused ? 'trending-up' : 'trending-up-outline'}
                                color={focused ? colors.primary : color}
                                style={{
                                    transform: [{scale: focused ? 1.1 : 1}]
                                }}
                            />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: t('tabs.settings'),
                    tabBarIcon: ({color, focused}) => (
                        <View style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            marginBottom: 5,
                            backgroundColor: focused ? colors.primary + '30' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: focused ? 1 : 0,
                            borderColor: focused ? colors.primary + '70' : 'transparent',
                        }}>
                            <Ionicons
                                size={focused ? 24 : 22}
                                name={focused ? 'settings-sharp' : 'settings-outline'}
                                color={focused ? colors.primary : color}
                                style={{
                                    transform: [{scale: focused ? 1.1 : 1}]
                                }}
                            />
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

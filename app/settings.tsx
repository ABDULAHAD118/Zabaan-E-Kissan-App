import React, { useState } from "react";
import { ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";

type LanguageOption = {
  id: string;
  name: string;
  localName: string;
};

const languages: LanguageOption[] = [
  { id: "en", name: "English", localName: "English" },
  { id: "ur", name: "Urdu", localName: "اردو" },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    colorScheme === "dark"
  );

  return (
    <View className="flex-1 bg-white dark:bg-[#1B5E20]">
      <View className="pt-12 px-4 bg-primary-light dark:bg-primary-dark">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity className="p-2" onPress={() => router.back()}>
            <Ionicons size={24} name="arrow-back" color="white" />
          </TouchableOpacity>
          <ThemedText
            type="title"
            className="text-2xl font-bold text-white ml-2"
          >
            Settings
          </ThemedText>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="mb-6">
          <ThemedText type="subtitle" className="mb-2">
            Language / زبان
          </ThemedText>

          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              className={`flex-row items-center justify-between p-4 mb-2 rounded-lg ${
                selectedLanguage === lang.id
                  ? "bg-primary-light dark:bg-primary-dark"
                  : "bg-gray-100 dark:bg-[#33691E]"
              }`}
              onPress={() => setSelectedLanguage(lang.id)}
            >
              <ThemedText
                className={selectedLanguage === lang.id ? "text-white" : ""}
              >
                {lang.name} ({lang.localName})
              </ThemedText>
              {selectedLanguage === lang.id && (
                <Ionicons
                  size={20}
                  name="checkmark"
                  color={
                    selectedLanguage === lang.id
                      ? "white"
                      : colorScheme === "dark"
                        ? "#FFFFFF"
                        : "#000000"
                  }
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-6">
          <ThemedText type="subtitle" className="mb-2">
            Appearance
          </ThemedText>

          <View className="bg-gray-100 dark:bg-[#33691E] p-4 rounded-lg mb-2">
            <View className="flex-row items-center justify-between">
              <ThemedText>Dark Mode</ThemedText>
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={darkModeEnabled ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <ThemedText type="subtitle" className="mb-2">
            Notifications
          </ThemedText>

          <View className="bg-gray-100 dark:bg-[#33691E] p-4 rounded-lg mb-2">
            <View className="flex-row items-center justify-between">
              <ThemedText>Enable Notifications</ThemedText>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
                thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        <View className="mb-6">
          <ThemedText type="subtitle" className="mb-2">
            About
          </ThemedText>

          <View className="bg-gray-100 dark:bg-[#33691E] p-4 rounded-lg mb-2">
            <ThemedText type="defaultSemiBold" className="mb-1">
              Zabaan-e-Kisaan
            </ThemedText>
            <ThemedText className="text-gray-600 dark:text-gray-300">
              Version 1.0.0
            </ThemedText>
            <ThemedText className="mt-2 text-gray-600 dark:text-gray-300">
              A farming app with disease detection, chat, and crop price
              features.
            </ThemedText>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Drawer } from "expo-router/drawer";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { IconSymbol } from "@/components/ui/IconSymbol";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colorScheme === "dark" ? "#1B5E20" : "#FFFFFF",
            width: 280,
          },
          drawerLabelStyle: {
            color: colorScheme === "dark" ? "#FFFFFF" : "#000000",
          },
          drawerActiveBackgroundColor:
            colorScheme === "dark" ? "#33691E" : "#E8F5E9",
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Zabaan-e-Kisaan",
            drawerLabel: "Home",
            drawerIcon: () => (
              <IconSymbol size={24} name="house.fill" color="green" />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: "Settings",
            drawerLabel: "Settings",
            drawerIcon: () => (
              <Ionicons size={24} name="settings" color="green" />
            ),
          }}
        />
      </Drawer>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

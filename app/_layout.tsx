import { Stack } from "expo-router";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import LanguageModal from "@/components/LanguageModal";
import "@/i18n/config";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import {ActivityIndicator, View} from "react-native";

function RootLayoutContent() {
  const isReady = useAppInitialization();

  if (!isReady) {
      return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FBFCFB' }}>
              <ActivityIndicator size="large" color="#4CAF50" />
          </View>
      );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="crop-detail" options={{ headerShown: false }} />
      <Stack.Screen name="scan-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryProvider>
          <RootLayoutContent />
          <LanguageModal />
        </QueryProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

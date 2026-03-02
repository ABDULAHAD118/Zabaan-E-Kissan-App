import { Stack } from "expo-router";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import LanguageModal from "@/components/LanguageModal";
import "@/i18n/config";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <QueryProvider>
          <Stack >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="crop-detail" options={{ headerShown: false }} />
          </Stack>
          <LanguageModal />
        </QueryProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

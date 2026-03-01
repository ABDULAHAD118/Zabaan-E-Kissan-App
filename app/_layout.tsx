import { Stack } from "expo-router";
import { QueryProvider } from "@/providers/QueryProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import LanguageModal from "@/components/LanguageModal";
import "@/i18n/config";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <QueryProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="crop-detail" options={{ headerShown: false }} />
        </Stack>
        <LanguageModal />
      </QueryProvider>
    </LanguageProvider>
  );
}

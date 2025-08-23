import { Stack } from "expo-router";
import { QueryProvider } from "@/providers/QueryProvider";

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="crop-detail" options={{ headerShown: false }} />
      </Stack>
    </QueryProvider>
  );
}

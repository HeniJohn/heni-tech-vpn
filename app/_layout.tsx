import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppStateProvider } from "@/lib/app-state";

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile-editor" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="payload-generator" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="import-export" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="about" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
    </AppStateProvider>
  );
}

import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

const colors = { background: "#07131F", muted: "#91A7B8", blue: "#2D9CFF", line: "#20435C" };

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.blue, tabBarInactiveTintColor: colors.muted, tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.line, height: 72, paddingBottom: 12, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 10, fontWeight: "700" } }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="shield-checkmark-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="log" options={{ title: "Logs", tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="profiles" options={{ title: "Profiles", tabBarIcon: ({ color, size }) => <Ionicons name="server-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}

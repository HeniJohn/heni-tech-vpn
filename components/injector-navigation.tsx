import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

type InjectorTab = "home" | "log" | "tools" | "help";

const tabs: { key: InjectorTab; label: string; route: Href }[] = [
  { key: "home", label: "Home", route: "/" as Href },
  { key: "log", label: "Logs", route: "/log" as Href },
  { key: "tools", label: "Tools", route: "/tools" as Href },
];

export function InjectorNavigation({ active }: { active: InjectorTab }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Pressable onPress={() => router.push("/profiles" as Href)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="Open profiles">
          <MaterialIcons name="menu" size={31} color="#F4F8FF" />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>Heni Tech VPN</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/settings" as Href)} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="Open settings">
            <MaterialIcons name="settings" size={31} color="#F4F8FF" />
          </Pressable>
          <Pressable onPress={() => Alert.alert("Heni Tech VPN", "Settings, Import/Export, Profiles, and About are available from the app controls.")} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]} accessibilityLabel="More options">
            <MaterialIcons name="more-vert" size={31} color="#F4F8FF" />
          </Pressable>
        </View>
      </View>
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable key={tab.key} onPress={() => router.replace(tab.route)} style={({ pressed }) => [styles.tab, active === tab.key && styles.activeTab, pressed && styles.pressed]}>
            <Text style={[styles.tabText, active === tab.key && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#10334D", paddingTop: 8 },
  titleRow: { height: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 18 },
  title: { color: "#F4F8FF", fontSize: 22, fontWeight: "800", letterSpacing: -0.25, marginLeft: 12, flex: 1 },
  actions: { flexDirection: "row", alignItems: "center", gap: 5 },
  iconButton: { width: 40, height: 50, alignItems: "center", justifyContent: "center", borderRadius: 12 },
  tabRow: { flexDirection: "row", height: 57, paddingHorizontal: 20 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 4, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#E9F4FF" },
  tabText: { color: "#B8CCDF", fontSize: 17, fontWeight: "700" },
  activeTabText: { color: "#FFFFFF" },
  pressed: { opacity: 0.68 },
});

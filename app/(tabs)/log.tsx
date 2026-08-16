import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";
import { getDiagnosticEvents, type DiagnosticEvent } from "@/lib/diagnostic-events";

export default function LogScreen() {
  const [events, setEvents] = useState<DiagnosticEvent[]>([]);
  const refresh = useCallback(async () => setEvents(await getDiagnosticEvents()), []);
  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));
  return (
    <View style={styles.page}>
      <InjectorNavigation active="log" />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.content, events.length === 0 && styles.emptyContent]}
        ListHeaderComponent={<View style={styles.toolbar}><Text style={styles.toolbarTitle}>Connection log</Text><View style={styles.toolbarActions}><Pressable onPress={() => void refresh()} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]} accessibilityLabel="Refresh logs"><MaterialIcons name="refresh" size={23} color="#EAF4FF" /></Pressable><Pressable onPress={() => setEvents([])} style={({ pressed }) => [styles.iconAction, pressed && styles.pressed]} accessibilityLabel="Clear visible logs"><MaterialIcons name="delete" size={23} color="#EAF4FF" /></Pressable></View></View>}
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="subject" size={40} color="#3A8BEA" /><Text style={styles.emptyTitle}>No log entries</Text><Text style={styles.emptyText}>Connection and diagnostic events will appear here after you use Connect or Tools.</Text></View>}
        renderItem={({ item }) => <View style={styles.entry}><View style={[styles.bar, item.level === "error" && styles.barError, item.level === "warning" && styles.barWarning]} /><View style={styles.entryBody}><Text style={styles.entryTime}>{new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text><Text style={styles.entryMessage}>{item.message.replaceAll("FlexNet", "")}</Text></View></View>}
        ItemSeparatorComponent={() => <View style={styles.line} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#07131E" },
  content: { paddingBottom: 30 },
  emptyContent: { flexGrow: 1 },
  toolbar: { minHeight: 61, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 22, backgroundColor: "#0B1D2B", borderBottomWidth: 1, borderBottomColor: "#26435D" },
  toolbarTitle: { color: "#EEF6FF", fontSize: 18, fontWeight: "800" },
  toolbarActions: { flexDirection: "row", gap: 10 },
  iconAction: { width: 39, height: 39, alignItems: "center", justifyContent: "center", borderRadius: 10 },
  entry: { minHeight: 86, flexDirection: "row", backgroundColor: "#07131E", paddingHorizontal: 23, paddingVertical: 13 },
  bar: { width: 7, borderRadius: 4, backgroundColor: "#3288ED", marginRight: 20 },
  barWarning: { backgroundColor: "#E6A43A" },
  barError: { backgroundColor: "#E9656E" },
  entryBody: { flex: 1 },
  entryTime: { color: "#A7BDD1", fontSize: 13, marginBottom: 5 },
  entryMessage: { color: "#F1F6FC", fontSize: 17, lineHeight: 24 },
  line: { height: 1, backgroundColor: "#294257" },
  empty: { flex: 1, minHeight: 430, justifyContent: "center", alignItems: "center", paddingHorizontal: 36 },
  emptyTitle: { color: "#F1F6FC", fontSize: 19, fontWeight: "800", marginTop: 14 },
  emptyText: { color: "#A9BDCF", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 8 },
  pressed: { opacity: 0.7 },
});

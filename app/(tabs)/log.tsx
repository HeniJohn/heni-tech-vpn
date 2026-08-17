import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";

const colors = { background: "#07131F", surface: "#0D2235", text: "#F2F7FB", muted: "#91A7B8", blue: "#2D9CFF", green: "#39D98A", amber: "#F6B73C", red: "#FF5C6C", line: "#20435C" };

export default function LogsScreen() {
  const { logs, clearLogs } = useAppState();
  const ordered = useMemo(() => logs, [logs]);
  return (
    <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]">
      <View style={styles.container}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>ACTIVITY</Text><Text style={styles.title}>Connection Logs</Text></View><Pressable style={styles.clear} onPress={() => void clearLogs()}><Ionicons name="trash-outline" size={18} color={colors.muted} /></Pressable></View>
        {ordered.length === 0 ? <View style={styles.empty}><Ionicons name="pulse-outline" size={34} color={colors.blue} /><Text style={styles.emptyTitle}>No connection events yet</Text><Text style={styles.emptyText}>Connection, payload, proxy, and disconnect events will appear here.</Text></View> : <FlatList data={ordered} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.row}><View style={[styles.level, { backgroundColor: item.level === "success" ? colors.green : item.level === "warning" ? colors.amber : item.level === "error" ? colors.red : colors.blue }]} /><View style={styles.body}><View style={styles.rowTop}><Text style={styles.eventTitle}>{item.title}</Text><Text style={styles.time}>{new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text></View><Text style={styles.detail}>{item.detail}</Text></View></View>} />}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }, eyebrow: { color: "#5D88A4", fontSize: 11, letterSpacing: 2, fontWeight: "800" }, title: { color: colors.text, fontSize: 27, fontWeight: "800", marginTop: 4 }, clear: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" }, list: { gap: 10, paddingBottom: 24 }, row: { flexDirection: "row", gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 14 }, level: { width: 4, borderRadius: 3 }, body: { flex: 1 }, rowTop: { flexDirection: "row", justifyContent: "space-between", gap: 8 }, eventTitle: { color: colors.text, fontWeight: "800", fontSize: 14, flex: 1 }, time: { color: colors.muted, fontSize: 11 }, detail: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5 }, empty: { marginTop: 110, alignItems: "center", padding: 28, backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.line }, emptyTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 14 }, emptyText: { color: colors.muted, textAlign: "center", lineHeight: 19, marginTop: 8 },
});

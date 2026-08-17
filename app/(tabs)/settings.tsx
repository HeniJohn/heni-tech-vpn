import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";

const colors = { background: "#07131F", surface: "#0D2235", text: "#F2F7FB", muted: "#91A7B8", blue: "#2D9CFF", line: "#20435C" };

const Row = ({ icon, label, detail, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; detail: string; onPress: () => void }) => <Pressable style={styles.row} onPress={onPress}><View style={styles.icon}><Ionicons name={icon} size={20} color={colors.blue} /></View><View style={styles.body}><Text style={styles.label}>{label}</Text><Text style={styles.detail}>{detail}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.muted} /></Pressable>;

export default function SettingsScreen() {
  const { clearLogs } = useAppState();
  return <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]"><View style={styles.container}><Text style={styles.eyebrow}>CONTROL CENTER</Text><Text style={styles.title}>Settings</Text><View style={styles.group}><Row icon="code-slash-outline" label="Payload Generator" detail="Create and apply a request payload" onPress={() => router.push({ pathname: "/payload-generator" } as never)} /><Row icon="swap-vertical-outline" label="Import / Export" detail="Portable .htv profiles without secrets" onPress={() => router.push({ pathname: "/import-export" } as never)} /><Row icon="information-circle-outline" label="About Heni Tech VPN" detail="Heni John and support links" onPress={() => router.push({ pathname: "/about" } as never)} /><Row icon="trash-outline" label="Clear logs" detail="Remove local connection events" onPress={() => void clearLogs()} /></View><Text style={styles.footer}>Heni Tech VPN · Developer Heni John</Text></View></ScreenContainer>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 20 }, eyebrow: { color: "#5D88A4", fontSize: 11, letterSpacing: 2, fontWeight: "800" }, title: { color: colors.text, fontSize: 27, fontWeight: "800", marginTop: 4, marginBottom: 20 }, group: { gap: 10 }, row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 17, borderWidth: 1, borderColor: colors.line, padding: 14 }, icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#092238", alignItems: "center", justifyContent: "center" }, body: { flex: 1 }, label: { color: colors.text, fontSize: 14, fontWeight: "800" }, detail: { color: colors.muted, fontSize: 11, marginTop: 5 }, footer: { color: colors.muted, textAlign: "center", fontSize: 11, marginTop: 28 },
});

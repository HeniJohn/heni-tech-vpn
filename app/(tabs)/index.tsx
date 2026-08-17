import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";
import { createProfile, protocolLabels, PROTOCOLS, type Protocol } from "@/lib/domain";
import { validateProfile } from "@/lib/profile-service";
import { startTransport } from "@/lib/transport-contract";

const colors = {
  background: "#07131F",
  surface: "#0D2235",
  surfaceAlt: "#12324A",
  text: "#F2F7FB",
  muted: "#91A7B8",
  blue: "#2D9CFF",
  green: "#39D98A",
  amber: "#F6B73C",
  red: "#FF5C6C",
  line: "#20435C",
};

export default function HomeScreen() {
  const { profiles, connection, addLog, setConnection } = useAppState();
  const [protocol, setProtocol] = useState<Protocol>(profiles[0]?.protocol ?? "ssh_direct");
  const selected = profiles.find((profile) => profile.protocol === protocol) ?? profiles[0];
  const statusColor = connection.state === "connected" ? colors.green : connection.state === "error" ? colors.red : colors.blue;
  const statusLabel = connection.state === "connected" ? "CONNECTED" : connection.state === "connecting" ? "CONNECTING" : connection.state === "error" ? "ERROR" : "DISCONNECTED";
  const selectedName = useMemo(() => selected?.name ?? "Manual profile required", [selected]);

  function handleConnect() {
    if (!selected) {
      addLog("warning", "Profile required", "Create a manual server profile before connecting.");
      router.push({ pathname: "/profile-editor" } as never);
      return;
    }
    const errors = validateProfile(selected);
    if (Object.keys(errors).length) {
      addLog("error", "Profile validation failed", Object.values(errors).filter(Boolean).join(" "));
      router.push({ pathname: "/profile-editor", params: { id: selected.id } });
      return;
    }
    if (connection.state === "connected" || connection.state === "connecting") {
      setConnection({ state: "disconnecting", profileId: selected.id, message: "Stopping the tunnel.", bytesUp: 0, bytesDown: 0 });
      addLog("info", "Disconnect requested", selected.name);
      setTimeout(() => setConnection({ state: "idle", message: "Ready for a manual profile.", bytesUp: 0, bytesDown: 0 }), 450);
      return;
    }
    setConnection({ state: "connecting", profileId: selected.id, message: "Preparing Android VPN permission and transport.", startedAt: new Date().toISOString(), bytesUp: 0, bytesDown: 0 });
    addLog("info", "Connection requested", `${selected.name} · ${protocolLabels[selected.protocol]}`);
    void startTransport({ profile: selected, payload: selected.payload }).then((result) => {
      if (result.ok) {
        setConnection({ state: "connected", profileId: selected.id, message: "Transport verified.", startedAt: new Date().toISOString(), bytesUp: 0, bytesDown: 0 });
        addLog("success", "Connected", `${selected.name} · ${protocolLabels[selected.protocol]}`);
      } else {
        setConnection({ state: "error", profileId: selected.id, message: result.message, bytesUp: 0, bytesDown: 0 });
        addLog("error", "Connection stopped", result.message);
      }
    });
  }

  return (
    <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>HENI JOHN</Text>
            <Text style={styles.title}>Heni Tech VPN</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => router.push({ pathname: "/about" } as never)}><Ionicons name="information-outline" size={21} color={colors.text} /></Pressable>
        </View>

        <View style={[styles.statusCard, { borderColor: `${statusColor}66` }]}>
          <View style={styles.statusRow}><View style={[styles.dot, { backgroundColor: statusColor }]} /><Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text><Text style={styles.statusMessage}>{connection.message}</Text></View>
          <Pressable style={({ pressed }) => [styles.connectOrb, { borderColor: statusColor, opacity: pressed ? 0.8 : 1 }]} onPress={handleConnect}>
            <Ionicons name={connection.state === "connected" || connection.state === "connecting" ? "power" : "flash"} size={38} color={statusColor} />
            <Text style={[styles.orbLabel, { color: statusColor }]}>{connection.state === "connected" ? "STOP" : "CONNECT"}</Text>
          </Pressable>
          <View style={styles.counterRow}><View><Text style={styles.counterLabel}>UPLOAD</Text><Text style={styles.counterValue}>{connection.bytesUp} KB</Text></View><View><Text style={styles.counterLabel}>DOWNLOAD</Text><Text style={styles.counterValue}>{connection.bytesDown} KB</Text></View><View><Text style={styles.counterLabel}>PROFILE</Text><Text style={styles.counterValue} numberOfLines={1}>{selectedName}</Text></View></View>
        </View>

        <Text style={styles.sectionTitle}>Connection mode</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>
          {PROTOCOLS.map((item) => <Pressable key={item} onPress={() => setProtocol(item)} style={[styles.modeChip, protocol === item && styles.modeChipActive]}><Text style={[styles.modeText, protocol === item && styles.modeTextActive]}>{protocolLabels[item]}</Text></Pressable>)}
        </ScrollView>

        <Pressable style={styles.profileCard} onPress={() => router.push({ pathname: "/profile-editor", params: selected ? { id: selected.id } : undefined })}>
          <View style={styles.cardIcon}><Ionicons name="server-outline" size={22} color={colors.blue} /></View><View style={styles.cardBody}><Text style={styles.cardTitle}>{selectedName}</Text><Text style={styles.cardSubtitle}>{selected ? `${selected.host || "Host not set"}:${selected.port}` : "Enter your own server details"}</Text></View><Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>

        <View style={styles.actionRow}><Pressable style={styles.secondaryAction} onPress={() => router.push({ pathname: "/payload-generator" } as never)}><Ionicons name="code-slash-outline" size={18} color={colors.blue} /><Text style={styles.secondaryText}>Payload</Text></Pressable><Pressable style={styles.secondaryAction} onPress={() => router.push({ pathname: "/import-export" } as never)}><Ionicons name="swap-vertical-outline" size={18} color={colors.blue} /><Text style={styles.secondaryText}>Import / Export</Text></Pressable></View>
        <Text style={styles.footer}>Manual profiles only · No bundled VPS or random server</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 34, gap: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eyebrow: { color: "#5D88A4", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  title: { color: colors.text, fontSize: 27, fontWeight: "800", marginTop: 3 },
  iconButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line },
  statusCard: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, padding: 20, alignItems: "center", gap: 18 },
  statusRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  statusLabel: { fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  statusMessage: { color: colors.muted, fontSize: 12, flex: 1, textAlign: "right" },
  connectOrb: { height: 150, width: 150, borderRadius: 75, borderWidth: 2, alignItems: "center", justifyContent: "center", backgroundColor: "#092238" },
  orbLabel: { fontSize: 12, fontWeight: "900", letterSpacing: 1.2, marginTop: 8 },
  counterRow: { width: "100%", flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 15 },
  counterLabel: { color: colors.muted, fontSize: 9, letterSpacing: 1, fontWeight: "800" },
  counterValue: { color: colors.text, fontSize: 12, fontWeight: "700", marginTop: 4, maxWidth: 95 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "800", marginTop: 2 },
  modeRow: { gap: 8, paddingRight: 20 },
  modeChip: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.line },
  modeChipActive: { backgroundColor: colors.blue, borderColor: colors.blue },
  modeText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  modeTextActive: { color: "#00182A" },
  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 15, gap: 12 },
  cardIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#092238", alignItems: "center", justifyContent: "center" },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "800" },
  cardSubtitle: { color: colors.muted, fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 10 },
  secondaryAction: { flex: 1, flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceAlt, paddingVertical: 14, borderRadius: 15 },
  secondaryText: { color: colors.text, fontSize: 12, fontWeight: "700" },
  footer: { textAlign: "center", color: "#5D88A4", fontSize: 11, marginTop: 2 },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { InjectorNavigation } from "@/components/injector-navigation";
import { appendDiagnosticEvent } from "@/lib/diagnostic-events";
import { createNativeEngineConfig } from "@/lib/native-engine-config";
import { createEngineRequest } from "@/lib/tunnel-engine-request";
import { AppPreferences, draftFromProfile, getPreferences, getProfileCredential, getProfiles, protocolInfo, savePreferences, TunnelProfile } from "@/lib/tunnel-store";
import { getEngineStatus, requestVpnPermission, startEngine } from "@/modules/tunnelguard-core";

export default function HomeScreen() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<TunnelProfile[]>([]);
  const [preferences, setPreferences] = useState<AppPreferences>({ autoConnect: false, killSwitchEnabled: false });
  const [starting, setStarting] = useState(false);
  const hydrate = useCallback(async () => {
    const [savedProfiles, savedPreferences] = await Promise.all([getProfiles(), getPreferences()]);
    setProfiles(savedProfiles);
    setPreferences(savedPreferences);
  }, []);
  useFocusEffect(useCallback(() => { void hydrate(); }, [hydrate]));
  const active = profiles.find((profile) => profile.id === preferences.activeProfileId) ?? profiles[0];
  const editActive = () => router.push(active ? ({ pathname: "/profile-form", params: { id: active.id } } as unknown as Href) : ("/profile-form" as Href));
  const start = async () => {
    if (!active) { await appendDiagnosticEvent("info", "Manual profile setup opened from Home."); editActive(); return; }
    setStarting(true);
    try {
      const status = await getEngineStatus();
      if (status.state === "development-build-required" || status.state === "core-not-bundled") {
        await appendDiagnosticEvent("warning", "Start was requested, but the native protocol engine is not included in this build.");
        Alert.alert("Start unavailable", "Your manual profile is saved. A native protocol engine must be included in the Android build before the tunnel can start.");
        return;
      }
      if (!active.secretKey && needsCredential(active.protocol)) {
        await appendDiagnosticEvent("warning", "Start was blocked because the selected profile has no stored credential.");
        Alert.alert("Credential required", "Edit the profile to add its private key or password before starting.");
        editActive();
        return;
      }
      const permission = await requestVpnPermission();
      if (permission.state === "requested") { await appendDiagnosticEvent("info", "Android VPN permission was requested."); Alert.alert("VPN permission requested", "Approve Android VPN permission, then tap Connect again."); return; }
      const request = createEngineRequest(draftFromProfile(active), { profileId: active.id, hasStoredSecret: Boolean(active.secretKey) });
      const credential = await getProfileCredential(active);
      const result = await startEngine(JSON.stringify(createNativeEngineConfig(request, credential)));
      await appendDiagnosticEvent("info", result.detail);
      Alert.alert("Engine status", result.detail);
    } catch (error) {
      await appendDiagnosticEvent("error", error instanceof Error ? error.message : "Could not prepare VPN.");
      Alert.alert("Could not connect", error instanceof Error ? error.message : "Try again.");
    } finally { setStarting(false); }
  };
  const selectProfile = async () => { if (active) { await savePreferences({ ...preferences, activeProfileId: active.id }); setPreferences((current) => ({ ...current, activeProfileId: active.id })); } router.push("/profiles" as Href); };
  const protocolLabel = active ? protocolInfo[active.protocol].label : "No profile selected";
  return (
    <View style={styles.page}>
      <InjectorNavigation active="home" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusCard}>
          <View style={styles.statusInner}>
            <View style={styles.statusLine}><View style={styles.statusDot} /><Text style={styles.statusTitle}>Status Unknown</Text></View>
            <Text style={styles.statusSubtitle}>Ready to connect</Text>
            <View style={styles.trafficRow}><Text style={styles.trafficText}>↓ 0 B/s</Text><Text style={styles.trafficText}>↑ 0 B/s</Text><Text style={styles.trafficTotal}>▤ 0 KB</Text></View>
          </View>
          <Pressable onPress={() => void start()} style={({ pressed }) => [styles.connectButton, pressed && styles.pressed, starting && styles.disabled]}>
            <MaterialIcons name="power-settings-new" size={30} color="#FFFFFF" /><Text style={styles.connectText}>{starting ? "Connecting…" : "Connect"}</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>CONNECTION MODE</Text>
          <View style={styles.modeGrid}>
            {(["SSH Direct", "HTTP Proxy", "SSL Tunnel", "SSL + Proxy", "SSL + HTTP", "SlowDNS"] as const).map((label) => (
              <Pressable key={label} onPress={editActive} style={({ pressed }) => [styles.modeOption, pressed && styles.pressed]}>
                <View style={[styles.radio, label === protocolLabel && styles.radioSelected]}>{label === protocolLabel ? <View style={styles.radioDot} /> : null}</View><Text style={styles.modeLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={editActive} style={({ pressed }) => [styles.advancedCard, pressed && styles.pressed]}>
          <View><Text style={styles.advancedTitle}>Advanced options</Text><Text style={styles.advancedSubtitle}>Payload, proxy, SNI and extras</Text></View><MaterialIcons name="expand-more" size={28} color="#B9C9D8" />
        </Pressable>

        <View style={styles.profileBar}><MaterialIcons name="dns" size={21} color="#57A8FF" /><View style={styles.profileBody}><Text style={styles.profileLabel}>Active manual profile</Text><Text style={styles.profileValue}>{active ? `${active.name} · ${active.host}:${active.port}` : "No server selected"}</Text></View><Pressable onPress={selectProfile} style={({ pressed }) => [styles.profileButton, pressed && styles.pressed]}><Text style={styles.profileButtonText}>Profiles</Text></Pressable></View>
      </ScrollView>
    </View>
  );
}
function needsCredential(protocol: TunnelProfile["protocol"]) { return !["http_proxy", "https_proxy", "socks5"].includes(protocol); }
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#07131E" },
  content: { padding: 18, gap: 22, paddingBottom: 42 },
  statusCard: { backgroundColor: "#111E2D", borderRadius: 19, padding: 18, gap: 22, marginTop: 7 },
  statusInner: { backgroundColor: "#1D3956", borderRadius: 16, padding: 18, position: "relative" },
  statusLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  statusDot: { width: 19, height: 19, borderRadius: 12, backgroundColor: "#ADB7C0" },
  statusTitle: { color: "#F4F8FF", fontSize: 22, fontWeight: "800" },
  statusSubtitle: { color: "#C5D3E2", fontSize: 16, marginLeft: 31, marginTop: 4 },
  trafficRow: { position: "absolute", right: 12, top: 19, flexDirection: "row", gap: 10 },
  trafficText: { color: "#DCEBFA", fontSize: 12, fontWeight: "700" },
  trafficTotal: { color: "#DCEBFA", fontSize: 12, fontWeight: "700", position: "absolute", right: 0, top: 20, width: 72, textAlign: "right" },
  connectButton: { minHeight: 78, borderRadius: 28, backgroundColor: "#3288ED", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 14 },
  connectText: { color: "#FFFFFF", fontSize: 25, fontWeight: "800" },
  sectionCard: { backgroundColor: "#111E2D", borderRadius: 19, padding: 22 },
  sectionTitle: { color: "#D8E4F0", fontSize: 17, fontWeight: "800", letterSpacing: 0.5, marginBottom: 18 },
  modeGrid: { flexDirection: "row", flexWrap: "wrap", rowGap: 19 },
  modeOption: { width: "50%", flexDirection: "row", alignItems: "center", gap: 10 },
  radio: { width: 39, height: 39, borderRadius: 22, borderWidth: 3, borderColor: "#3288ED", alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: "#3288ED" },
  radioDot: { width: 19, height: 19, borderRadius: 12, backgroundColor: "#3288ED" },
  modeLabel: { color: "#EAF2FB", fontSize: 16 },
  advancedCard: { minHeight: 93, borderRadius: 16, borderWidth: 1, borderColor: "#2D587A", backgroundColor: "#111E2D", paddingHorizontal: 25, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  advancedTitle: { color: "#F3F7FC", fontSize: 18, fontWeight: "800" },
  advancedSubtitle: { color: "#B5C7D8", fontSize: 15, marginTop: 4 },
  profileBar: { borderRadius: 14, borderWidth: 1, borderColor: "#234B69", backgroundColor: "#10263B", minHeight: 62, paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 10 },
  profileBody: { flex: 1 },
  profileLabel: { color: "#BBD1E5", fontSize: 12, fontWeight: "800" },
  profileValue: { color: "#F3F7FC", fontSize: 13, marginTop: 2 },
  profileButton: { paddingVertical: 8, paddingHorizontal: 7 },
  profileButtonText: { color: "#65B1FF", fontWeight: "800" },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.55 },
});

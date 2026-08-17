import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";
import { createProfile, protocolLabels, PROTOCOLS, type Protocol, type TunnelProfile } from "@/lib/domain";
import { validateProfile } from "@/lib/profile-service";

const colors = { background: "#07131F", surface: "#0D2235", surfaceAlt: "#12324A", text: "#F2F7FB", muted: "#91A7B8", blue: "#2D9CFF", red: "#FF5C6C", line: "#20435C" };

function Field({ label, value, onChangeText, placeholder, keyboardType = "default", secureTextEntry = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "default" | "numeric"; secureTextEntry?: boolean }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#55768D" keyboardType={keyboardType} secureTextEntry={secureTextEntry} style={styles.input} autoCapitalize="none" /></View>;
}

export default function ProfileEditorScreen() {
  const { profiles, saveProfile, addLog } = useAppState();
  const params = useLocalSearchParams<{ id?: string }>();
  const existing = profiles.find((profile) => profile.id === params.id);
  const [profile, setProfile] = useState<TunnelProfile>(() => existing ?? createProfile());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (patch: Partial<TunnelProfile>) => setProfile((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }));
  const modeFields = useMemo(() => profile.protocol, [profile.protocol]);

  async function handleSave() {
    const nextErrors = validateProfile(profile);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) { addLog("error", "Profile validation failed", Object.values(nextErrors).join(" ")); return; }
    await saveProfile(profile);
    addLog("success", "Profile saved", `${profile.name} · ${protocolLabels[profile.protocol]}`);
    router.back();
  }

  return <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><Pressable onPress={() => router.back()}><Ionicons name="arrow-back" size={25} color={colors.text} /></Pressable><View style={styles.headerCopy}><Text style={styles.eyebrow}>MANUAL PROFILE</Text><Text style={styles.title}>{existing ? "Edit profile" : "Add profile"}</Text></View><View style={{ width: 25 }} /></View><Field label="Profile name" value={profile.name} onChangeText={(name) => update({ name })} placeholder="My server" /><Text style={styles.error}>{errors.name ?? ""}</Text><Text style={styles.section}>Connection mode</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>{PROTOCOLS.map((protocol) => <Pressable key={protocol} onPress={() => update({ protocol })} style={[styles.modeChip, profile.protocol === protocol && styles.modeChipActive]}><Text style={[styles.modeText, profile.protocol === protocol && styles.modeTextActive]}>{protocolLabels[protocol]}</Text></Pressable>)}</ScrollView><View style={styles.card}><Field label={modeFields === "http_proxy" ? "Proxy host" : "Server host"} value={modeFields === "http_proxy" ? profile.proxyHost ?? "" : profile.host} onChangeText={(host) => modeFields === "http_proxy" ? update({ proxyHost: host }) : update({ host })} placeholder="example.com" /><Text style={styles.error}>{errors.host ?? errors.proxyHost ?? ""}</Text><Field label={modeFields === "http_proxy" ? "Proxy port" : "Server port"} value={modeFields === "http_proxy" ? profile.proxyPort ?? "" : profile.port} onChangeText={(port) => modeFields === "http_proxy" ? update({ proxyPort: port }) : update({ port })} placeholder="22" keyboardType="numeric" /><Text style={styles.error}>{errors.port ?? errors.proxyPort ?? ""}</Text>{modeFields !== "http_proxy" && <><Field label="SSH username" value={profile.username} onChangeText={(username) => update({ username })} placeholder="username" /><Text style={styles.error}>{errors.username ?? ""}</Text></>}{["ssl_tunnel", "ssl_proxy", "ssl_http"].includes(modeFields) && <><Field label="SNI / server name" value={profile.sni ?? ""} onChangeText={(sni) => update({ sni })} placeholder="secure.example.com" /><Text style={styles.error}>{errors.sni ?? ""}</Text></>}{["ssl_proxy"].includes(modeFields) && <Field label="Target server host" value={profile.host} onChangeText={(host) => update({ host })} placeholder="server.example.com" />}{modeFields === "slowdns" && <><Field label="SlowDNS tunnel domain" value={profile.dnsDomain ?? ""} onChangeText={(dnsDomain) => update({ dnsDomain })} placeholder="dns.example.com" /><Text style={styles.error}>{errors.dnsDomain ?? ""}</Text><Field label="DNS resolver" value={profile.dnsResolver ?? ""} onChangeText={(dnsResolver) => update({ dnsResolver })} placeholder="1.1.1.1" /></>}</View><Text style={styles.helper}>Credentials are stored separately on-device and are never included in `.htv` exports or logs.</Text><Pressable style={styles.save} onPress={() => void handleSave()}><Text style={styles.saveText}>Save manual profile</Text></Pressable></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, gap: 8 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }, headerCopy: { flex: 1, alignItems: "center" }, eyebrow: { color: "#5D88A4", fontSize: 10, letterSpacing: 2, fontWeight: "800" }, title: { color: colors.text, fontSize: 23, fontWeight: "800", marginTop: 4 }, section: { color: colors.text, fontSize: 15, fontWeight: "800", marginTop: 12 }, modeRow: { gap: 8, paddingVertical: 4 }, modeChip: { paddingVertical: 10, paddingHorizontal: 13, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line }, modeChipActive: { backgroundColor: colors.blue, borderColor: colors.blue }, modeText: { color: colors.muted, fontSize: 11, fontWeight: "700" }, modeTextActive: { color: "#00182A" }, card: { backgroundColor: colors.surface, borderRadius: 19, borderWidth: 1, borderColor: colors.line, padding: 15, marginTop: 8 }, field: { marginTop: 10 }, fieldLabel: { color: colors.muted, fontSize: 11, fontWeight: "800", marginBottom: 6 }, input: { color: colors.text, backgroundColor: "#092238", borderColor: colors.line, borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, fontSize: 14 }, error: { color: colors.red, fontSize: 10, minHeight: 13, marginTop: 3 }, helper: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 8 }, save: { backgroundColor: colors.blue, borderRadius: 15, paddingVertical: 15, alignItems: "center", marginTop: 12, marginBottom: 20 }, saveText: { color: "#00182A", fontWeight: "900", fontSize: 14 },
});

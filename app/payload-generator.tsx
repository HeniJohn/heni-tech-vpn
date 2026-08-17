import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";
import { protocolLabels, PROTOCOLS, type Protocol } from "@/lib/domain";
import { payloadFor, validatePayload } from "@/lib/payload";

const colors = { background: "#07131F", surface: "#0D2235", text: "#F2F7FB", muted: "#91A7B8", blue: "#2D9CFF", red: "#FF5C6C", line: "#20435C" };

export default function PayloadGeneratorScreen() {
  const { profiles, addLog } = useAppState();
  const params = useLocalSearchParams<{ id?: string }>();
  const profile = profiles.find((item) => item.id === params.id) ?? profiles[0];
  const [protocol, setProtocol] = useState<Protocol>(profile?.protocol ?? "http_proxy");
  const [payload, setPayload] = useState(() => payloadFor(profile?.protocol ?? "http_proxy", profile?.payload));
  const validation = useMemo(() => validatePayload(payload), [payload]);
  function apply() { if (validation) return; addLog("success", "Payload prepared", `${protocolLabels[protocol]} payload is ready to apply.`); router.back(); }
  return <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back</Text></Pressable><Text style={styles.eyebrow}>REQUEST BUILDER</Text><Text style={styles.title}>Payload Generator</Text><Text style={styles.description}>Create a protocol-specific request payload. Tokens are resolved by the selected native adapter at connection time.</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRow}>{PROTOCOLS.map((item) => <Pressable key={item} onPress={() => { setProtocol(item); setPayload(payloadFor(item)); }} style={[styles.chip, protocol === item && styles.chipActive]}><Text style={[styles.chipText, protocol === item && styles.chipTextActive]}>{protocolLabels[item]}</Text></Pressable>)}</ScrollView><View style={styles.card}><Text style={styles.label}>Custom payload</Text><TextInput value={payload} onChangeText={setPayload} multiline placeholder="GET / HTTP/1.1\\r\\nHost: [host]\\r\\n\\r\\n" placeholderTextColor="#55768D" style={styles.input} autoCapitalize="none" /><Text style={[styles.validation, validation ? { color: colors.red } : { color: colors.muted }]}>{validation ?? "Payload is valid and ready to apply."}</Text></View><Pressable style={[styles.primary, validation && styles.disabled]} disabled={Boolean(validation)} onPress={apply}><Text style={styles.primaryText}>Apply payload</Text></Pressable></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, gap: 14 }, back: { color: colors.blue, fontSize: 16, fontWeight: "700" }, eyebrow: { color: "#5D88A4", fontSize: 11, letterSpacing: 2, fontWeight: "800" }, title: { color: colors.text, fontSize: 27, fontWeight: "800" }, description: { color: colors.muted, fontSize: 13, lineHeight: 20 }, modeRow: { gap: 8, paddingVertical: 2 }, chip: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 }, chipActive: { backgroundColor: colors.blue, borderColor: colors.blue }, chipText: { color: colors.muted, fontWeight: "700", fontSize: 11 }, chipTextActive: { color: "#00182A" }, card: { backgroundColor: colors.surface, borderRadius: 18, borderColor: colors.line, borderWidth: 1, padding: 14 }, label: { color: colors.muted, fontSize: 11, fontWeight: "800", marginBottom: 8 }, input: { minHeight: 170, color: colors.text, backgroundColor: "#092238", borderRadius: 13, borderWidth: 1, borderColor: colors.line, padding: 13, textAlignVertical: "top", fontSize: 13 }, validation: { fontSize: 11, lineHeight: 17, marginTop: 8 }, primary: { backgroundColor: colors.blue, borderRadius: 15, alignItems: "center", paddingVertical: 15 }, disabled: { opacity: 0.4 }, primaryText: { color: "#00182A", fontWeight: "900" },
});

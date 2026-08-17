import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useAppState } from "@/lib/app-state";
import { exportHtv, importHtv } from "@/lib/htv";

const colors = { background: "#07131F", surface: "#0D2235", text: "#F2F7FB", muted: "#91A7B8", blue: "#2D9CFF", red: "#FF5C6C", line: "#20435C" };

export default function ImportExportScreen() {
  const { profiles, saveProfile, addLog } = useAppState();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Exports never include passwords, keys, or proxy secrets.");

  async function handleExport() {
    setBusy(true);
    try {
      const payload = exportHtv(profiles);
      const uri = `${FileSystem.cacheDirectory}heni-tech-vpn-${Date.now()}.htv`;
      await FileSystem.writeAsStringAsync(uri, payload);
      setMessage(`Export prepared: ${profiles.length} profile(s). Use the system share sheet to save it.`);
      addLog("success", "Profiles exported", `${profiles.length} profile(s) without secrets.`);
      Alert.alert("Heni Tech export ready", `File created in the app cache.\n${uri}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally { setBusy(false); }
  }

  async function handleImport() {
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ["application/json", "application/octet-stream", "text/plain"], copyToCacheDirectory: true });
      if (result.canceled) return;
      const raw = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const imported = importHtv(raw);
      for (const profile of imported) await saveProfile({ ...profile, id: `import-${Date.now()}-${profile.id}` });
      setMessage(`${imported.length} profile(s) imported. Credentials must be entered again on this device.`);
      addLog("success", "Profiles imported", `${imported.length} profile(s); secrets were not imported.`);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Import failed.";
      setMessage(detail);
      addLog("error", "Import failed", detail);
    } finally { setBusy(false); }
  }

  return <ScreenContainer containerClassName="bg-[#07131F]" safeAreaClassName="bg-[#07131F]" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => router.back()}><Text style={styles.back}>‹  Back</Text></Pressable><Text style={styles.eyebrow}>PORTABLE CONFIGURATION</Text><Text style={styles.title}>Import / Export</Text><Text style={styles.description}>Use Heni Tech VPN `.htv` files to move manual profiles. Server credentials are deliberately excluded and must be entered again after import.</Text><View style={styles.card}><Text style={styles.count}>{profiles.length}</Text><Text style={styles.countLabel}>local manual profile(s)</Text></View><Pressable disabled={busy} style={styles.primary} onPress={() => void handleExport()}><Text style={styles.primaryText}>{busy ? "Working…" : "Export .htv profiles"}</Text></Pressable><Pressable disabled={busy} style={styles.secondary} onPress={() => void handleImport()}><Text style={styles.secondaryText}>Import .htv file</Text></Pressable><Text style={styles.message}>{message}</Text></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, gap: 13 }, back: { color: colors.blue, fontSize: 16, fontWeight: "700", marginBottom: 10 }, eyebrow: { color: "#5D88A4", fontSize: 11, letterSpacing: 2, fontWeight: "800" }, title: { color: colors.text, fontSize: 27, fontWeight: "800" }, description: { color: colors.muted, fontSize: 13, lineHeight: 20 }, card: { backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 20, alignItems: "center", marginTop: 6 }, count: { color: colors.blue, fontSize: 38, fontWeight: "900" }, countLabel: { color: colors.muted, fontSize: 12, marginTop: 4 }, primary: { backgroundColor: colors.blue, borderRadius: 15, alignItems: "center", paddingVertical: 15, marginTop: 8 }, primaryText: { color: "#00182A", fontWeight: "900" }, secondary: { backgroundColor: colors.surface, borderColor: colors.line, borderWidth: 1, borderRadius: 15, alignItems: "center", paddingVertical: 15 }, secondaryText: { color: colors.text, fontWeight: "800" }, message: { color: colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 6 },
});

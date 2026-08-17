import AsyncStorage from "@react-native-async-storage/async-storage";

import { PROTOCOLS, type Protocol, type TunnelProfile } from "./domain";

const PROFILES_KEY = "heni-tech-independent.profiles.v1";

export type ProfileErrors = Partial<Record<"name" | "host" | "port" | "username" | "sni" | "proxyHost" | "proxyPort" | "dnsDomain", string>>;

export function validateProfile(profile: TunnelProfile): ProfileErrors {
  const errors: ProfileErrors = {};
  if (!profile.name.trim()) errors.name = "Profile name is required.";
  if (!profile.host.trim()) errors.host = "Manual server host is required.";
  const port = Number(profile.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = "Enter a valid port from 1 to 65535.";
  if (profile.protocol !== "http_proxy" && !profile.username.trim()) errors.username = "SSH username is required for this mode.";
  if (["ssl_tunnel", "ssl_proxy", "ssl_http"].includes(profile.protocol) && !profile.sni?.trim()) errors.sni = "SNI/server name is required for SSL modes.";
  if (["http_proxy", "ssl_proxy"].includes(profile.protocol)) {
    if (!profile.proxyHost?.trim()) errors.proxyHost = "Proxy host is required for this mode.";
    const proxyPort = Number(profile.proxyPort);
    if (!Number.isInteger(proxyPort) || proxyPort < 1 || proxyPort > 65535) errors.proxyPort = "Enter a valid proxy port.";
  }
  if (profile.protocol === "slowdns" && !profile.dnsDomain?.trim()) errors.dnsDomain = "SlowDNS tunnel domain is required.";
  return errors;
}

export function isProtocol(value: unknown): value is Protocol {
  return typeof value === "string" && (PROTOCOLS as readonly string[]).includes(value);
}

export async function loadProfiles(): Promise<TunnelProfile[]> {
  const raw = await AsyncStorage.getItem(PROFILES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TunnelProfile => Boolean(item && typeof item === "object" && isProtocol((item as TunnelProfile).protocol)));
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles: TunnelProfile[]) {
  await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export async function upsertProfile(profile: TunnelProfile) {
  const profiles = await loadProfiles();
  const next = profiles.some((item) => item.id === profile.id)
    ? profiles.map((item) => (item.id === profile.id ? profile : item))
    : [profile, ...profiles];
  await saveProfiles(next);
  return next;
}

export async function deleteProfile(id: string) {
  const profiles = await loadProfiles();
  const next = profiles.filter((item) => item.id !== id);
  await saveProfiles(next);
  return next;
}

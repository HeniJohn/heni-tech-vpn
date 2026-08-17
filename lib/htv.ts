import { isProtocol } from "./profile-service";
import type { TunnelProfile } from "./domain";

const MAGIC = "HENI_TECH_VPN_HTV_V1";

type ExportedProfile = Omit<TunnelProfile, "credentialRef" | "proxyUsername"> & {
  credentialStored: boolean;
  proxyCredentialStored: boolean;
};

type HtvEnvelope = {
  magic: typeof MAGIC;
  exportedAt: string;
  app: "Heni Tech VPN";
  profiles: ExportedProfile[];
};

export function exportHtv(profiles: TunnelProfile[], exportedAt = new Date().toISOString()) {
  const envelope: HtvEnvelope = {
    magic: MAGIC,
    exportedAt,
    app: "Heni Tech VPN",
    profiles: profiles.map(({ credentialRef, proxyUsername, ...profile }) => ({
      ...profile,
      credentialStored: Boolean(credentialRef),
      proxyCredentialStored: Boolean(proxyUsername),
    })),
  };
  return JSON.stringify(envelope, null, 2);
}

export function importHtv(raw: string): TunnelProfile[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Invalid Heni Tech configuration file.");
  }
  if (!parsed || typeof parsed !== "object" || (parsed as HtvEnvelope).magic !== MAGIC) {
    throw new Error("Invalid Heni Tech configuration header.");
  }
  const profiles = (parsed as HtvEnvelope).profiles;
  if (!Array.isArray(profiles)) throw new Error("Invalid Heni Tech configuration payload.");
  return profiles.map((profile) => {
    if (!profile || typeof profile !== "object" || !isProtocol(profile.protocol)) {
      throw new Error("Configuration contains an unsupported connection mode.");
    }
    const now = new Date().toISOString();
    return {
      ...profile,
      credentialRef: "",
      proxyUsername: "",
      createdAt: profile.createdAt || now,
      updatedAt: now,
    } as TunnelProfile;
  });
}

export const protocolGroups = [
  { title: "Connection mode", protocols: ["ssh_direct", "http_proxy", "ssl_tunnel", "ssl_proxy", "ssl_http", "slowdns"] },
] as const;

export const tunnelProtocols = protocolGroups.flatMap((group) => group.protocols);
export type TunnelProtocol = (typeof tunnelProtocols)[number];
export type DnsMode = "automatic" | "cloudflare" | "custom";
export type TransportMode = "raw" | "websocket" | "grpc";
export type SecurityMode = "none" | "tls" | "reality";

export const protocolInfo: Record<TunnelProtocol, { label: string; description: string; port: string }> = {
  ssh_direct: { label: "SSH Direct", description: "SSH direct tunnel", port: "22" },
  http_proxy: { label: "HTTP Proxy", description: "SSH through HTTP proxy", port: "8080" },
  ssl_tunnel: { label: "SSL Tunnel", description: "SSH through SSL/TLS", port: "443" },
  ssl_proxy: { label: "SSL + Proxy", description: "SSH SSL tunnel with proxy", port: "443" },
  ssl_http: { label: "SSL + HTTP", description: "SSH SSL tunnel with HTTP payload", port: "443" },
  slowdns: { label: "SlowDNS", description: "SSH through DNS tunnel", port: "53" },
};

export type ProfileDraft = {
  id?: string;
  name: string;
  protocol: TunnelProtocol;
  host: string;
  port: string;
  username?: string;
  secret?: string;
  dnsMode: DnsMode;
  customDns?: string;
  transport: TransportMode;
  security: SecurityMode;
  sni?: string;
  path?: string;
  uuid?: string;
  cipher?: string;
  clientAddress?: string;
  peerPublicKey?: string;
  tunnelDomain?: string;
  resolver?: string;
  obfuscation?: string;
};

export function createEmptyDraft(protocol: TunnelProtocol = "ssh_direct"): ProfileDraft {
  const tls = protocol === "ssl_tunnel" || protocol === "ssl_proxy" || protocol === "ssl_http";
  return {
    name: "", protocol, host: "", port: protocolInfo[protocol].port, username: "", secret: "",
    dnsMode: "automatic", customDns: "", transport: "raw", security: tls ? "tls" : "none",
    sni: "", path: "", uuid: "", cipher: "", clientAddress: "", peerPublicKey: "", tunnelDomain: "", resolver: "", obfuscation: "",
  };
}

function isTunnelProtocol(value: unknown): value is TunnelProtocol { return typeof value === "string" && (tunnelProtocols as readonly string[]).includes(value); }
function isTransport(value: unknown): value is TransportMode { return value === "raw" || value === "websocket" || value === "grpc"; }
function isSecurity(value: unknown): value is SecurityMode { return value === "none" || value === "tls" || value === "reality"; }
function needsSecret(protocol: TunnelProtocol) { return protocol !== "http_proxy"; }

export function validateProfileDraft(draft: ProfileDraft, options: { allowMissingSecret?: boolean } = {}) {
  const errors: Partial<Record<keyof ProfileDraft, string>> = {};
  if (!draft.name.trim()) errors.name = "Profile name is required.";
  if (!draft.host.trim()) errors.host = "Server host is required.";
  const port = Number(draft.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.port = "Use a port from 1 to 65535.";
  if (draft.dnsMode === "custom" && !draft.customDns?.trim()) errors.customDns = "Enter a custom DNS address.";
  if (!options.allowMissingSecret && needsSecret(draft.protocol) && !draft.secret?.trim()) errors.secret = "SSH password or private key is required.";
  if (draft.protocol === "slowdns") {
    if (!draft.tunnelDomain?.trim()) errors.tunnelDomain = "SlowDNS server name is required.";
    if (!draft.resolver?.trim()) errors.resolver = "SlowDNS resolver is required.";
  }
  if (["ssl_tunnel", "ssl_proxy", "ssl_http"].includes(draft.protocol) && !draft.sni?.trim()) errors.sni = "SNI / server name is required.";
  return errors;
}

type ImportedBundle = { format: "tunnelguard/v1"; profiles: Array<Partial<ProfileDraft>> };
function stringField(value: unknown) { return typeof value === "string" ? value : ""; }

export function parseImportedProfiles(content: string): ProfileDraft[] {
  let parsed: unknown;
  try { parsed = JSON.parse(content); } catch { throw new Error("The selected file is not valid JSON."); }
  const bundle = parsed as Partial<ImportedBundle>;
  if (bundle.format !== "tunnelguard/v1" || !Array.isArray(bundle.profiles)) throw new Error("Use a Heni Tech VPN configuration file.");
  const drafts = bundle.profiles.map((profile): ProfileDraft => {
    const protocol = isTunnelProtocol(profile.protocol) ? profile.protocol : "ssh_direct";
    const base = createEmptyDraft(protocol);
    return {
      ...base, name: stringField(profile.name), host: stringField(profile.host),
      port: typeof profile.port === "number" || typeof profile.port === "string" ? String(profile.port) : "",
      username: stringField(profile.username), dnsMode: profile.dnsMode === "cloudflare" || profile.dnsMode === "custom" ? profile.dnsMode : "automatic",
      customDns: stringField(profile.customDns), transport: isTransport(profile.transport) ? profile.transport : base.transport,
      security: isSecurity(profile.security) ? profile.security : base.security, sni: stringField(profile.sni), path: stringField(profile.path),
      uuid: stringField(profile.uuid), cipher: stringField(profile.cipher), clientAddress: stringField(profile.clientAddress),
      peerPublicKey: stringField(profile.peerPublicKey), tunnelDomain: stringField(profile.tunnelDomain), resolver: stringField(profile.resolver),
      obfuscation: stringField(profile.obfuscation), secret: "",
    };
  });
  if (!drafts.length || drafts.some((draft) => Object.keys(validateProfileDraft(draft, { allowMissingSecret: true })).length > 0)) throw new Error("The file contains an incomplete or invalid profile.");
  return drafts;
}

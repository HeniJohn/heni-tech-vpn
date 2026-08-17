export const PROTOCOLS = [
  "ssh_direct",
  "http_proxy",
  "ssl_tunnel",
  "ssl_proxy",
  "ssl_http",
  "slowdns",
] as const;

export type Protocol = (typeof PROTOCOLS)[number];

export const protocolLabels: Record<Protocol, string> = {
  ssh_direct: "SSH Direct",
  http_proxy: "HTTP Proxy",
  ssl_tunnel: "SSL Tunnel",
  ssl_proxy: "SSL + Proxy",
  ssl_http: "SSL + HTTP",
  slowdns: "SlowDNS",
};

export type TunnelProfile = {
  id: string;
  name: string;
  protocol: Protocol;
  host: string;
  port: string;
  username: string;
  credentialRef?: string;
  proxyHost?: string;
  proxyPort?: string;
  proxyUsername?: string;
  sni?: string;
  payload?: string;
  dnsDomain?: string;
  dnsResolver?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConnectionState = "idle" | "validating" | "connecting" | "connected" | "disconnecting" | "error";

export type ConnectionSnapshot = {
  state: ConnectionState;
  profileId?: string;
  message: string;
  startedAt?: string;
  bytesUp: number;
  bytesDown: number;
};

export type LogLevel = "info" | "success" | "warning" | "error";

export type LogEvent = {
  id: string;
  at: string;
  level: LogLevel;
  title: string;
  detail: string;
};

export const EMPTY_CONNECTION: ConnectionSnapshot = {
  state: "idle",
  message: "Ready for a manual profile.",
  bytesUp: 0,
  bytesDown: 0,
};

export function createProfile(protocol: Protocol = "ssh_direct"): TunnelProfile {
  const now = new Date().toISOString();
  return {
    id: `profile-${Date.now()}`,
    name: protocolLabels[protocol],
    protocol,
    host: "",
    port: protocol === "http_proxy" ? "8080" : protocol === "slowdns" ? "53" : "22",
    username: "",
    credentialRef: "",
    proxyHost: "",
    proxyPort: "8080",
    proxyUsername: "",
    sni: "",
    payload: "",
    dnsDomain: "",
    dnsResolver: "1.1.1.1",
    createdAt: now,
    updatedAt: now,
  };
}

export function redactedProfile(profile: TunnelProfile) {
  return {
    ...profile,
    credentialRef: profile.credentialRef ? "[stored securely]" : "",
    proxyUsername: profile.proxyUsername ? "[stored securely]" : "",
  };
}

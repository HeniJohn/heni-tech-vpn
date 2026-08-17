import type { Protocol, TunnelProfile } from "./domain";

export type AdapterStatus = "available" | "pending" | "failed";

export type AdapterDescriptor = {
  protocol: Protocol;
  label: string;
  status: AdapterStatus;
  boundary: "android-vpn-service";
  reason: string;
};

export const adapterDescriptors: Record<Protocol, AdapterDescriptor> = {
  ssh_direct: { protocol: "ssh_direct", label: "SSH Direct", status: "pending", boundary: "android-vpn-service", reason: "Independent SSH transport adapter must be compiled and handshake-tested." },
  http_proxy: { protocol: "http_proxy", label: "HTTP Proxy", status: "pending", boundary: "android-vpn-service", reason: "Independent HTTP CONNECT adapter must be compiled and request-tested." },
  ssl_tunnel: { protocol: "ssl_tunnel", label: "SSL Tunnel", status: "pending", boundary: "android-vpn-service", reason: "Independent TLS/payload adapter must be compiled and certificate-tested." },
  ssl_proxy: { protocol: "ssl_proxy", label: "SSL + Proxy", status: "pending", boundary: "android-vpn-service", reason: "Independent proxy-over-TLS adapter must be compiled and handshake-tested." },
  ssl_http: { protocol: "ssl_http", label: "SSL + HTTP", status: "pending", boundary: "android-vpn-service", reason: "Independent HTTP-over-TLS adapter must be compiled and request-tested." },
  slowdns: { protocol: "slowdns", label: "SlowDNS", status: "pending", boundary: "android-vpn-service", reason: "Independent DNS tunnel adapter must be compiled and resolver-tested." },
};

export type AdapterRequest = { profile: TunnelProfile; payload?: string };
export type AdapterResult = { ok: true; sessionId: string } | { ok: false; code: "ADAPTER_PENDING" | "INVALID_PROFILE" | "HANDSHAKE_FAILED"; message: string };

export async function startTransport(request: AdapterRequest): Promise<AdapterResult> {
  const descriptor = adapterDescriptors[request.profile.protocol];
  return { ok: false, code: "ADAPTER_PENDING", message: `${descriptor.label}: ${descriptor.reason}` };
}

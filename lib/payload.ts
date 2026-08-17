import type { Protocol } from "./domain";

export const payloadTemplates: Record<Protocol, string> = {
  ssh_direct: "",
  http_proxy: "CONNECT [host_port] HTTP/1.1\\r\\nHost: [host]\\r\\n\\r\\n",
  ssl_tunnel: "GET / HTTP/1.1\\r\\nHost: [host]\\r\\nConnection: keep-alive\\r\\n\\r\\n",
  ssl_proxy: "CONNECT [host_port] HTTP/1.1\\r\\nHost: [host]\\r\\nProxy-Connection: keep-alive\\r\\n\\r\\n",
  ssl_http: "GET / HTTP/1.1\\r\\nHost: [host]\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\n\\r\\n",
  slowdns: "",
};

export function payloadFor(protocol: Protocol, custom?: string) {
  return custom?.trim() ? custom : payloadTemplates[protocol];
}

export function validatePayload(payload: string) {
  if (!payload.trim()) return "Payload is empty.";
  if (payload.length > 8192) return "Payload is too large.";
  if (!payload.includes("[host]") && !payload.includes("[host_port]")) return "Payload should include [host] or [host_port].";
  return null;
}

export function applyPayloadTokens(payload: string, host: string, port: string) {
  return payload.replaceAll("[host_port]", `${host}:${port}`).replaceAll("[host]", host).replaceAll("[port]", port);
}

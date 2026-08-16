import type { EngineRequest } from "./tunnel-engine-request";

type JsonObject = Record<string, unknown>;
function required(value: string | undefined, label: string) { const cleaned = value?.trim(); if (!cleaned) throw new Error(`${label} is required before the tunnel can start.`); return cleaned; }
function sshCredential(credential: string) { return credential.includes("-----BEGIN") ? { private_key: [credential] } : { password: credential }; }

function outboundFor(request: EngineRequest, credential?: string): JsonObject {
  const server = request.endpoint.host;
  const serverPort = request.endpoint.port;
  const username = request.options.username?.trim();
  switch (request.protocol) {
    case "ssh_direct":
      return { type: "ssh", tag: "proxy", server, server_port: serverPort, user: required(username, "SSH username"), ...sshCredential(required(credential, "SSH password or private key")) };
    case "http_proxy":
      return { type: "http", tag: "proxy", server, server_port: serverPort, ...(username ? { username } : {}), ...(credential ? { password: credential } : {}) };
    case "ssl_tunnel":
    case "ssl_proxy":
    case "ssl_http":
      throw new Error("The selected SSL mode requires the exact Heni Tech native transport adapter before it can connect.");
    case "slowdns":
      throw new Error("SlowDNS requires the exact Heni Tech DNS tunnel adapter before it can connect.");
  }
}

export function createNativeEngineConfig(request: EngineRequest, credential?: string): JsonObject {
  if (request.engine !== "sing-box") throw new Error("This profile requires the exact Heni Tech DNS tunnel adapter.");
  return {
    log: { level: "warn" },
    inbounds: [{ type: "tun", tag: "tun-in", address: ["172.19.0.1/30", "fdfe:dcba:9876::1/126"], auto_route: true, strict_route: false, stack: "system" }],
    outbounds: [outboundFor(request, credential), { type: "direct", tag: "direct" }],
    route: { auto_detect_interface: true, final: "proxy" },
  };
}

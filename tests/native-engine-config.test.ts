import { describe, expect, it } from "vitest";
import { createNativeEngineConfig } from "../lib/native-engine-config";
import type { EngineRequest } from "../lib/tunnel-engine-request";

function request(protocol: EngineRequest["protocol"]): EngineRequest {
  return { engine: "sing-box", protocol, endpoint: { host: "vpn.example.test", port: 22 }, transport: "raw", security: "none", options: { username: "operator", sni: undefined, path: undefined, uuid: undefined, cipher: undefined, clientAddress: undefined, peerPublicKey: undefined, tunnelDomain: undefined, resolver: undefined, obfuscation: undefined } };
}

describe("native Heni Tech engine boundary", () => {
  it("compiles SSH Direct into a TUN-routed SSH config", () => {
    const config = createNativeEngineConfig(request("ssh_direct"), "device-only-password");
    expect(config.inbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "tun", auto_route: true })]));
    expect(config.outbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "ssh", user: "operator", password: "device-only-password" })]));
    expect(config.route).toEqual(expect.objectContaining({ final: "proxy" }));
  });

  it("compiles HTTP Proxy without inventing another protocol", () => {
    const config = createNativeEngineConfig({ ...request("http_proxy"), endpoint: { host: "proxy.example.test", port: 8080 } }, undefined);
    expect(config.outbounds).toEqual(expect.arrayContaining([expect.objectContaining({ type: "http", server: "proxy.example.test", server_port: 8080 })]));
  });

  it("keeps the exact SSL and SlowDNS modes behind their dedicated native adapters", () => {
    expect(() => createNativeEngineConfig(request("ssl_tunnel"), "secret")).toThrow("exact Heni Tech native transport adapter");
    expect(() => createNativeEngineConfig(request("slowdns"), "secret")).toThrow("exact Heni Tech DNS tunnel adapter");
  });
});

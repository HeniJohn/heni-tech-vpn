import { describe, expect, it } from "vitest";

import { createEmptyDraft } from "../lib/profile-validation";
import { createEngineRequest } from "../lib/tunnel-engine-request";

describe("Heni Tech engine requests", () => {
  it("routes SSH Direct to the standard engine without exposing its secret", () => {
    const draft = { ...createEmptyDraft("ssh_direct"), name: "Office", host: "ssh.example.com", secret: "private-key", username: "operator" };
    expect(createEngineRequest(draft)).toMatchObject({ engine: "sing-box", protocol: "ssh_direct", endpoint: { host: "ssh.example.com", port: 22 } });
    expect(JSON.stringify(createEngineRequest(draft))).not.toContain("private-key");
  });

  it("routes SlowDNS to the dedicated DNS adapter", () => {
    const draft = { ...createEmptyDraft("slowdns"), name: "Fallback", host: "dns.example.com", secret: "client-key", tunnelDomain: "tunnel.example.com", resolver: "1.1.1.1" };
    expect(createEngineRequest(draft).engine).toBe("dns-adapter");
  });

  it("rejects a start request when a required secret is neither entered nor stored", () => {
    const draft = { ...createEmptyDraft("ssh_direct"), name: "Remote", host: "ssh.example.com", username: "user" };
    expect(() => createEngineRequest(draft)).toThrow("complete profile");
    expect(createEngineRequest(draft, { hasStoredSecret: true })).toMatchObject({ engine: "sing-box", protocol: "ssh_direct" });
  });
});

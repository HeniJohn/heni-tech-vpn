import { describe, expect, it } from "vitest";

import { createProfile, PROTOCOLS } from "../lib/domain";
import { exportHtv, importHtv } from "../lib/htv";
import { payloadFor, validatePayload } from "../lib/payload";
import { validateProfile } from "../lib/profile-service";

 describe("independent Heni Tech VPN core", () => {
  it("keeps exactly the six reference modes", () => {
    expect(PROTOCOLS).toEqual(["ssh_direct", "http_proxy", "ssl_tunnel", "ssl_proxy", "ssl_http", "slowdns"]);
  });

  it("validates a manual SSH profile", () => {
    const profile = createProfile("ssh_direct");
    expect(validateProfile(profile)).toMatchObject({ host: expect.any(String), username: expect.any(String) });
    expect(Object.keys(validateProfile({ ...profile, host: "server.example", username: "john" }))).toHaveLength(0);
  });

  it("requires a domain for SlowDNS", () => {
    const profile = createProfile("slowdns");
    profile.host = "server.example";
    expect(validateProfile(profile)).toHaveProperty("dnsDomain");
  });

  it("generates and validates a proxy payload", () => {
    const payload = payloadFor("http_proxy");
    expect(payload).toContain("[host_port]");
    expect(validatePayload(payload)).toBeNull();
  });

  it("exports profiles without credential values", () => {
    const profile = { ...createProfile("ssh_direct"), host: "server.example", username: "john", credentialRef: "secret-value" };
    const raw = exportHtv([profile]);
    expect(raw).not.toContain("secret-value");
    const imported = importHtv(raw);
    expect(imported[0].credentialRef).toBe("");
    expect(imported[0].host).toBe("server.example");
  });
});

import { describe, expect, it } from "vitest";
import { createProfile, PROTOCOLS } from "../lib/domain";
import { adapterDescriptors, startTransport } from "../lib/transport-contract";

describe("independent transport contract", () => {
  it("defines one explicit adapter descriptor for each reference mode", () => {
    expect(Object.keys(adapterDescriptors)).toEqual(PROTOCOLS);
    for (const protocol of PROTOCOLS) {
      expect(adapterDescriptors[protocol].boundary).toBe("android-vpn-service");
    }
  });

  it("does not report an adapter as connected before verification", async () => {
    const result = await startTransport({ profile: createProfile("ssh_direct") });
    expect(result).toEqual(expect.objectContaining({ ok: false, code: "ADAPTER_PENDING" }));
  });
});

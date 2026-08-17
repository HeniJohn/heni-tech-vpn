import { NativeModules, Platform } from "react-native";

export type NativeVpnStatus = "idle" | "starting" | "running" | "stopping" | "error";
export type NativeVpnStartRequest = { protocol: string; host: string; port: number; payload?: string; sni?: string; proxyHost?: string; proxyPort?: number; dnsDomain?: string };
export type NativeVpnResult = { ok: true; status: "running" } | { ok: false; code: string; message: string };

type NativeVpnModule = { start: (request: NativeVpnStartRequest) => Promise<NativeVpnResult>; stop: () => Promise<NativeVpnResult>; getStatus: () => Promise<{ status: NativeVpnStatus }> };

const nativeModule = NativeModules.HeniVpn as NativeVpnModule | undefined;

export async function startNativeVpn(request: NativeVpnStartRequest): Promise<NativeVpnResult> {
  if (Platform.OS !== "android" || !nativeModule) return { ok: false, code: "NATIVE_MODULE_UNAVAILABLE", message: "The independent Android VPN module is not available in this build." };
  return nativeModule.start(request);
}

export async function stopNativeVpn(): Promise<NativeVpnResult> {
  if (Platform.OS !== "android" || !nativeModule) return { ok: false, code: "NATIVE_MODULE_UNAVAILABLE", message: "The independent Android VPN module is not available in this build." };
  return nativeModule.stop();
}

export async function nativeVpnStatus() {
  if (Platform.OS !== "android" || !nativeModule) return { status: "idle" as const };
  return nativeModule.getStatus();
}

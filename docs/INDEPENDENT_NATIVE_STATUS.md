# Independent native engine status

The new Heni Tech VPN project is source-owned and does not copy the supplied reference APK’s classes, binaries, or resources. Its Android native boundary is an Expo module named `expo-heni-vpn` with a registered `VpnService` and explicit lifecycle cleanup.

The module currently establishes only the Android TUN boundary after VPN permission is available. It does not yet route traffic or claim a successful transport handshake. The TypeScript transport contract intentionally returns `ADAPTER_PENDING` until each independent adapter is implemented and tested.

| Mode | Current state | Required next verification |
|---|---|---|
| SSH Direct | Contract defined; adapter pending | Socket/auth handshake, packet forwarding, disconnect cleanup |
| HTTP Proxy | Contract defined; adapter pending | CONNECT request, proxy auth, packet forwarding |
| SSL Tunnel | Contract defined; adapter pending | TLS/SNI/payload handshake and certificate behavior |
| SSL + Proxy | Contract defined; adapter pending | Proxy connection followed by TLS/payload handshake |
| SSL + HTTP | Contract defined; adapter pending | TLS plus HTTP/payload request and forwarding |
| SlowDNS | Contract defined; adapter pending | Resolver exchange, DNS framing, loss/reconnect handling |

A profile is never shown as connected merely because the Android service started. Home changes to Connected only when an adapter returns a verified session result. This is a deliberate safety boundary against false-connected states and silent traffic leaks.

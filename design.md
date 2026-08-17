# Heni Tech VPN independent mobile interface design

## Product direction

Heni Tech VPN is a portrait-first Android VPN client for manually entered servers. The interface follows the supplied reference APK’s dark, compact tunnel-client layout while using Heni Tech VPN branding, electric-blue highlights, no bundled VPS list, and no startup popup. Every screen must work comfortably with one hand and must keep primary actions within the lower half of the display.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Welcome | Heni Tech VPN identity, Heni John developer line, a single continue action, no automatic popup |
| Home | Connection state, elapsed time, up/down traffic counters, selected mode, manual profile summary, payload summary, Connect/Disconnect action, compact settings/menu access |
| Protocol selector | Exactly six modes: SSH Direct, HTTP Proxy, SSL Tunnel, SSL + Proxy, SSL + HTTP, SlowDNS |
| Manual server/profile editor | Mode-dependent host, port, username, credential reference, proxy, SNI, payload, DNS-tunnel and authentication fields; local save only |
| Payload Generator | Preset/custom payload controls, generated request preview, copy/apply actions, validation feedback |
| Profiles | Local manual profiles, add/edit/delete/duplicate, import/export `.htv`, no random or bundled servers |
| Logs | Chronological connection events, filter/clear action, readable status colors, redacted secrets |
| Settings | Tunnel behavior, DNS choices, notifications, auto-connect/kill-switch options only where implemented, reset local data |
| About | Heni Tech VPN, Heni John, concise VPN terms, Telegram channel and developer links |
| Import/Export | Protected export fields, expiry/message options where needed, `.htv` file selection, invalid-header/payload errors |
| Diagnostics | Read-only local readiness, permission status, selected profile, native adapter status, no secret output |

## Key flows

1. **Welcome to Home:** User opens the app, sees the Heni Tech VPN welcome screen, taps Continue, and arrives at Home without any popup or automatic channel prompt.
2. **Manual profile:** User taps the profile area, chooses one of the six modes, enters their own server information, validates the form, and saves it locally. No remote server list is displayed.
3. **Connect:** User selects a saved profile and taps Connect. The app validates mode-specific fields, requests Android VPN consent when needed, starts the native service, verifies a protected request, and only then changes Home to Connected with traffic counters.
4. **Failure:** Any handshake, payload, proxy, DNS, or permission error produces a readable log event, returns Home to a non-connected state, and cleans up service, sockets, TUN, and notification resources.
5. **Payload Generator:** User opens Payload Generator, chooses a protocol template or custom mode, edits the request, previews it, and applies it to the current profile without exposing stored secrets.
6. **Import/export:** User exports selected profiles to `.htv` without credentials, optionally uses protection metadata, and imports a file through the document picker. Invalid headers, payloads, or expired protection produce explicit errors.
7. **Logs:** User opens Logs after a connection attempt, sees connection lifecycle and traffic events, clears logs, and never sees passwords, keys, or raw secrets.
8. **About:** User opens About, taps the Telegram channel or developer Telegram link, and leaves the app through the system browser. No Telegram link appears in a startup popup.

## Visual system

The primary background is deep navy `#07131F`, raised surfaces are `#0D2235` and `#12324A`, primary text is `#F2F7FB`, muted text is `#91A7B8`, electric-blue action color is `#2D9CFF`, connected green is `#39D98A`, warning amber is `#F6B73C`, and error red is `#FF5C6C`. Dividers use a low-contrast blue-gray. Cards are compact with 14–18px corner radii; primary actions are full-width or near-full-width and placed above the bottom safe area.

The Home screen uses a dark header with the Heni Tech VPN mark, a prominent circular/rounded connection control, a selected-protocol row, a manual profile card, and a restrained status footer. Motion is limited to short opacity/scale transitions; no splash animation may delay entry or cause an apparent crash.

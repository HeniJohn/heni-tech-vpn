# Build Heni Tech VPN on GitHub

The repository is designed for remote Android builds because the local development environment does not include the Android SDK. GitHub Actions installs Node, pnpm, Java 17, the Android SDK, dependencies, and the local `expo-heni-vpn` module before running the Android release build.

## From a phone

Create or open the GitHub repository for this independent project and push the complete source tree, including `.github/workflows/build-apk.yml`, `modules/hieni-vpn`, `app`, `lib`, `components`, `tests`, and `app.config.ts`. In GitHub, open **Actions**, choose **Build Heni Tech VPN APK**, and tap **Run workflow** on the `main` branch. The workflow also runs on pushes to `main`.

When the run is successful, open the completed run and download the artifact named `heni-tech-vpn-release-<commit>`. Extract the downloaded archive and install the release APK on Android. The build is unsigned for testing; publishing to Google Play requires a release keystore and a signed bundle/APK.

## Verification status

The workflow checks TypeScript and the independent core tests before generating Android. The current project includes a source-owned Android VpnService lifecycle boundary and exact six-mode contract. It intentionally does not report a tunnel as connected until the corresponding independent adapter verifies a session.

| Area | Current state |
|---|---|
| App identity and dark navy/electric-blue UI | Implemented |
| Manual profiles and no bundled VPS/random server | Implemented |
| `.htv` import/export with secret redaction | Implemented |
| Logs, Payload Generator, About, Settings | Implemented |
| Native Android VpnService boundary | Implemented and autolinking-resolved |
| SSH Direct, HTTP Proxy, SSL Tunnel, SSL + Proxy, SSL + HTTP, SlowDNS | Contracts defined; handshake and packet-forwarding adapters pending |
| Signed production release | Not configured; requires the owner’s keystore/signing policy |

Do not interpret a successful Gradle build as proof that all six transports are operational. The APK can compile while adapters remain pending. Each mode must be tested with a server the user owns before being marked available.

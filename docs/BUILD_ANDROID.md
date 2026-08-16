# Heni Tech VPN Android build guide

## Project status

This repository is a clean, source-owned React Native/Expo application branded **Heni Tech VPN** with developer **Heni John**. It does not patch, repackage, or depend on the supplied FlexNet APK. The UI, profile workflows, `.htv` import/export, logs, and exact six-mode selector are implemented in source code.

The six user-facing modes are **SSH Direct, HTTP Proxy, SSL Tunnel, SSL + Proxy, SSL + HTTP, and SlowDNS**. The project deliberately does not add other protocol choices and does not bundle a VPS or server list.

The TypeScript configuration compiler currently provides a concrete sing-box path for SSH Direct and HTTP Proxy. SSL modes and SlowDNS are guarded behind explicit native-adapter errors until independently sourced, audited adapters are added. This is intentional: the app must not display a false `Connected` state or silently substitute a different protocol.

## Build from a phone using GitHub Actions

Open the repository in GitHub, select **Actions**, choose **Build Heni Tech VPN APK**, and select **Run workflow**. The workflow installs Node.js, pnpm, Java 17, and the Android SDK on GitHub-hosted Linux, runs `pnpm check` and the complete Vitest suite, generates the Android project with Expo prebuild, and assembles an unsigned release APK. When the workflow completes, open its run summary and download the artifact named `heni-tech-vpn-release-<commit>`.

For a tagged build, create a tag beginning with `v`, such as `v1.0.0`, and push it. The same workflow will run automatically. The uploaded APK is unsigned; it is suitable for local installation and testing, but Google Play publishing requires a release keystore and a signed Android App Bundle or APK.

## Local developer build

On a computer with the Android SDK installed, run:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test -- --run
npx expo prebuild --platform android --non-interactive --clean
cd android
./gradlew assembleRelease
```

The generated release APK is under `android/app/build/outputs/apk/release/`. A native Android development build is required for the VPN service; Expo Go cannot load the source-owned native VPN service.

## Signing for publishing

Create and protect a release keystore outside the repository. Add the keystore and passwords as encrypted GitHub Actions secrets, then extend `android/app/build.gradle` or the Expo Android build configuration to use those secrets. Never commit a keystore, password, private key, profile secret, or server credential. After signing is configured, prefer an Android App Bundle (`.aab`) for Google Play distribution.

## Native engine completion gate

Before advertising production VPN connectivity, add the independently sourced native core and the exact SSL/SlowDNS adapters at the boundaries described in `docs/native-engine-architecture.md`. Pin every native dependency to a commit or release, record its checksum, include required license notices, test both ARM ABIs on real devices, and verify one protected request through each of the six modes. Android's VPN API requires a user consent step, a protected tunnel socket, a foreground service on modern Android, and an established TUN interface [1].

The project intentionally keeps the native service and UI stable while this adapter work is completed. This prevents crashes and prevents a misleading connection status while retaining a maintainable update path.

## Verification performed in this workspace

The current clean source passes `pnpm check` and the test suite: **5 test files passed, 13 tests passed, and 1 authentication test was intentionally skipped** because it requires an external authenticated service. The APK itself must be built by GitHub Actions or another Android-capable machine because this workspace does not contain the Android SDK.

## References

[1]: https://developer.android.com/develop/connectivity/vpn "Android Developers: VPN"
[2]: https://sing-box.sagernet.org/clients/android/ "sing-box for Android"
[3]: https://github.com/SagerNet/sing-box "SagerNet/sing-box source repository"

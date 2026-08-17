# Independent native-engine research

## Android VpnService

Android’s official `VpnService` documentation states that the service creates a virtual network interface and returns a file descriptor; reads retrieve outgoing IP packets and writes inject incoming packets. The application must process and exchange packets with a remote tunnel, not merely call `Builder.establish`. Android also requires user preparation, a secured `BIND_VPN_SERVICE` declaration, cleanup on revoke, and foreground handling on Android 8.0+.

Source: [Android VpnService API reference](https://developer.android.com/reference/android/net/VpnService)

## SSH Direct

Apache MINA SSHD documents itself as a 100% pure Java client/server SSH library, with a built-in asynchronous socket backend and Apache-2.0 licensing in its repository. It is a candidate for an independent SSH Direct adapter, but Android compatibility, dependency size, authentication, port forwarding, and packet forwarding through the TUN descriptor still require build and device tests.

Sources: [Apache MINA SSHD overview](https://mina.apache.org/sshd-project/) [Apache MINA SSHD repository](https://github.com/apache/mina-sshd)

## Consequence for this project

The current source-owned service is only a lifecycle boundary. It must not be called a completed VPN engine until a transport adapter has a verified remote handshake and a packet-forwarding loop. The project therefore keeps all six modes explicit and returns an adapter-pending result until those tests pass. This prevents a visually complete Home screen from claiming traffic routing that the native layer has not implemented.

## Android compatibility caveat

Apache MINA SSHD’s own Android guide says Android compatibility and usability have not been thoroughly checked and are not a stated project goal. It documents hooks for Android-specific filesystem and security-provider behavior, while noting that MINA and Netty I/O factories have not been tested on Android. Therefore MINA SSHD can be evaluated as a candidate for SSH Direct, but it cannot be presented as a verified Android transport until this project builds and tests it on a real device.

Source: [Apache MINA SSHD Android support](https://github.com/apache/mina-sshd/blob/master/docs/android.md)

## SSH library candidate

The maintained `com.github.mwiede:jsch` fork is a pure-Java SSH2 implementation with Revised BSD/ISC licensing and current Maven Central releases. Its project documentation highlights secure algorithm defaults and compatibility with RSA-SHA2, while the library remains a candidate rather than a verified Android VPN engine. Adding it would still require Android build testing, SSH authentication/host-key policy, port-forwarding design, and a TUN packet-forwarding layer.

Sources: [mwiede JSch repository](https://github.com/mwiede/jsch) [Maven Central metadata](https://central.sonatype.com/artifact/com.github.mwiede/jsch)

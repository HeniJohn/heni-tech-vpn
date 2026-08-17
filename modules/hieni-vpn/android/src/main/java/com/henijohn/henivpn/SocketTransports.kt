package com.henijohn.henivpn

import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStreamWriter
import java.io.PrintWriter
import java.net.InetSocketAddress
import java.net.Socket
import javax.net.ssl.SSLSocket
import javax.net.ssl.SSLSocketFactory

internal object SocketTransports {
  fun openTcp(host: String, port: Int, timeoutMs: Int = 10_000): Socket {
    return Socket().apply { connect(InetSocketAddress(host, port), timeoutMs); soTimeout = timeoutMs }
  }

  fun connectHttpProxy(socket: Socket, targetHost: String, targetPort: Int, username: String? = null, password: String? = null) {
    val writer = PrintWriter(OutputStreamWriter(socket.getOutputStream(), Charsets.ISO_8859_1), true)
    writer.print("CONNECT $targetHost:$targetPort HTTP/1.1\r\nHost: $targetHost:$targetPort\r\n")
    if (!username.isNullOrBlank() && !password.isNullOrBlank()) {
      val token = android.util.Base64.encodeToString("$username:$password".toByteArray(), android.util.Base64.NO_WRAP)
      writer.print("Proxy-Authorization: Basic $token\r\n")
    }
    writer.print("\r\n")
    writer.flush()
    val reader = BufferedReader(InputStreamReader(socket.getInputStream(), Charsets.ISO_8859_1))
    val status = reader.readLine().orEmpty()
    if (!status.startsWith("HTTP/1.1 2") && !status.startsWith("HTTP/1.0 2")) {
      throw IllegalStateException("HTTP proxy CONNECT failed: $status")
    }
    while (reader.readLine().orEmpty().isNotEmpty()) { }
  }

  fun upgradeTls(socket: Socket, host: String, port: Int): SSLSocket {
    val factory = SSLSocketFactory.getDefault() as SSLSocketFactory
    return (factory.createSocket(socket, host, port, true) as SSLSocket).apply {
      useClientMode = true
      startHandshake()
    }
  }
}

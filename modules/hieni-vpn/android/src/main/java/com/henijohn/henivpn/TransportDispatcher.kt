package com.henijohn.henivpn

internal enum class TransportMode {
  SSH_DIRECT,
  HTTP_PROXY,
  SSL_TUNNEL,
  SSL_PROXY,
  SSL_HTTP,
  SLOWDNS;

  companion object {
    fun parse(value: String): TransportMode? = when (value.lowercase()) {
      "ssh_direct" -> SSH_DIRECT
      "http_proxy" -> HTTP_PROXY
      "ssl_tunnel" -> SSL_TUNNEL
      "ssl_proxy" -> SSL_PROXY
      "ssl_http" -> SSL_HTTP
      "slowdns" -> SLOWDNS
      else -> null
    }
  }
}

internal data class TransportRequest(val mode: TransportMode, val host: String, val port: Int)

internal object TransportDispatcher {
  fun validate(modeValue: String, host: String, port: Int): Result<TransportRequest> {
    val mode = TransportMode.parse(modeValue)
      ?: return Result.failure(IllegalArgumentException("Unsupported Heni Tech VPN mode"))
    if (host.isBlank()) return Result.failure(IllegalArgumentException("Server host is required"))
    if (port !in 1..65535) return Result.failure(IllegalArgumentException("Server port is invalid"))
    return Result.success(TransportRequest(mode, host.trim(), port))
  }
}

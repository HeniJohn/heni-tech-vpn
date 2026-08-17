package com.henijohn.henivpn

import com.jcraft.jsch.JSch
import com.jcraft.jsch.Session

internal class SshDirectAdapter {
  fun connect(
    host: String,
    port: Int,
    username: String,
    password: String?,
    privateKeyPath: String?,
    knownHostKey: String?
  ): Result<Session> {
    if (host.isBlank() || username.isBlank() || port !in 1..65535) {
      return Result.failure(IllegalArgumentException("SSH host, port, and username are required"))
    }
    if (knownHostKey.isNullOrBlank()) {
      return Result.failure(IllegalArgumentException("SSH host-key verification is required"))
    }
    return runCatching {
      val jsch = JSch()
      jsch.setKnownHosts(knownHostKey)
      val session = jsch.getSession(username, host, port)
      if (!password.isNullOrEmpty()) session.setPassword(password)
      if (!privateKeyPath.isNullOrBlank()) jsch.addIdentity(privateKeyPath)
      session.connect(10_000)
      session
    }
  }

  fun disconnect(session: Session?) {
    session?.disconnect()
  }
}

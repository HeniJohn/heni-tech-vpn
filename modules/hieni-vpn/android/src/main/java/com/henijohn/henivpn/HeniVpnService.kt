package com.henijohn.henivpn

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.ParcelFileDescriptor

class HeniVpnService : VpnService() {
  private var interfaceFd: ParcelFileDescriptor? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_START) {
      startForeground(NOTIFICATION_ID, buildNotification())
      startTunnelInterface(intent.getStringExtra(EXTRA_PROTOCOL).orEmpty(), intent.getStringExtra(EXTRA_HOST).orEmpty(), intent.getIntExtra(EXTRA_PORT, 0))
    }
    return START_NOT_STICKY
  }

  private fun buildNotification(): Notification {
    val manager = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Heni Tech VPN", NotificationManager.IMPORTANCE_LOW))
    }
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
        .setContentTitle("Heni Tech VPN")
        .setContentText("VPN service is preparing the selected transport")
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setOngoing(true)
        .build()
    } else {
      Notification.Builder(this)
        .setContentTitle("Heni Tech VPN")
        .setContentText("VPN service is preparing the selected transport")
        .setSmallIcon(android.R.drawable.stat_sys_warning)
        .setOngoing(true)
        .build()
    }
  }

  private fun startTunnelInterface(protocol: String, host: String, port: Int) {
    stopTunnelInterface()
    if (protocol.isBlank() || host.isBlank() || port !in 1..65535) {
      stopSelf()
      return
    }
    interfaceFd = Builder()
      .setSession("Heni Tech VPN")
      .addAddress("10.7.0.2", 32)
      .addRoute("0.0.0.0", 0)
      .setBlocking(false)
      .establish()
    running = interfaceFd != null
  }

  private fun stopTunnelInterface() {
    interfaceFd?.close()
    interfaceFd = null
    running = false
  }

  override fun onRevoke() {
    stopTunnelInterface()
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
    super.onRevoke()
  }

  override fun onDestroy() {
    stopTunnelInterface()
    stopForeground(STOP_FOREGROUND_REMOVE)
    super.onDestroy()
  }

  companion object {
    const val ACTION_START = "com.henijohn.henivpn.START"
    const val EXTRA_PROTOCOL = "protocol"
    const val EXTRA_HOST = "host"
    const val EXTRA_PORT = "port"
    private const val CHANNEL_ID = "heni-tech-vpn"
    private const val NOTIFICATION_ID = 2424
    @Volatile var running: Boolean = false
  }
}

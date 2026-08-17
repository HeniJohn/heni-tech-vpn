package expo.modules.tunnelguardcore

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder
import android.os.ParcelFileDescriptor

/** Source-owned Android VPN lifecycle boundary. Protocol cores plug in above this boundary. */
class TunnelGuardVpnService : VpnService() {
  private var tunnel: ParcelFileDescriptor? = null

  companion object {
    private const val CHANNEL_ID = "heni-tech-vpn"
    private const val NOTIFICATION_ID = 711
    private const val ACTION_START = "expo.modules.tunnelguardcore.START"
    private const val ACTION_STOP = "expo.modules.tunnelguardcore.STOP"
    private const val EXTRA_CONFIG = "engine_config"

    @Volatile private var state = "idle"
    @Volatile private var detail = "Native tunnel is idle."

    fun statusSnapshot() = mapOf("state" to state, "detail" to detail, "nativeModule" to true)

    fun start(context: Context, config: String) {
      state = "starting"
      detail = "Preparing Android VPN service."
      val intent = Intent(context, TunnelGuardVpnService::class.java)
        .setAction(ACTION_START)
        .putExtra(EXTRA_CONFIG, config)
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        context.startForegroundService(intent)
      } else {
        context.startService(intent)
      }
    }

    fun stop(context: Context) {
      context.startService(Intent(context, TunnelGuardVpnService::class.java).setAction(ACTION_STOP))
    }
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    when (intent?.action) {
      ACTION_STOP -> stopEngine()
      ACTION_START -> {
        if (intent.getStringExtra(EXTRA_CONFIG).isNullOrBlank()) {
          state = "error"
          detail = "A native engine configuration was not supplied."
          stopSelf()
        } else {
          showForegroundNotification("Connecting")
          establishLocalInterface()
        }
      }
    }
    return START_NOT_STICKY
  }

  private fun establishLocalInterface() {
    try {
      if (VpnService.prepare(this) != null) throw IllegalStateException("Android VPN permission is not granted.")
      tunnel?.close()
      tunnel = Builder()
        .setSession("Heni Tech VPN")
        .setMtu(1500)
        .addAddress("172.19.0.1", 30)
        .addRoute("0.0.0.0", 0)
        .addDnsServer("1.1.1.1")
        .establish()
      if (tunnel == null) throw IllegalStateException("Android did not establish the VPN interface.")
      state = "connected"
      detail = "Android VPN interface is active; protocol adapter is pending."
      showForegroundNotification("Connected")
    } catch (error: Exception) {
      state = "error"
      detail = error.message ?: "Android VPN service could not start."
      stopEngine()
    }
  }

  private fun stopEngine() {
    tunnel?.close()
    tunnel = null
    state = "idle"
    detail = "Native tunnel stopped."
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) stopForeground(STOP_FOREGROUND_REMOVE) else @Suppress("DEPRECATION") stopForeground(true)
    stopSelf()
  }

  private fun showForegroundNotification(status: String) {
    val manager = getSystemService(NotificationManager::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Heni Tech VPN", NotificationManager.IMPORTANCE_LOW))
    }
    val notification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL_ID)
    } else {
      @Suppress("DEPRECATION") Notification.Builder(this)
    }.setSmallIcon(android.R.drawable.stat_sys_warning)
      .setContentTitle("Heni Tech VPN")
      .setContentText(status)
      .setOngoing(true)
      .build()
    startForeground(NOTIFICATION_ID, notification)
  }

  override fun onRevoke() = stopEngine()

  override fun onDestroy() {
    tunnel?.close()
    tunnel = null
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = super.onBind(intent)
}

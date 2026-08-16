const {
  withAndroidManifest,
  withDangerousMod,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const serviceName = "expo.modules.tunnelguardcore.TunnelGuardVpnService";
const packagePath = "expo/modules/tunnelguardcore";
const serviceSource = `package expo.modules.tunnelguardcore

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.net.VpnService
import android.os.Build
import android.os.IBinder

class TunnelGuardVpnService : VpnService() {
  private var tunnel: android.os.ParcelFileDescriptor? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    createChannel()
    startForeground(4101, notification())
    if (intent?.getBooleanExtra("establish", false) == true) {
      establishLocalInterface()
    }
    return START_STICKY
  }

  private fun establishLocalInterface() {
    tunnel?.close()
    tunnel = Builder()
      .setSession("Heni Tech VPN")
      .addAddress("172.19.0.1", 30)
      .addRoute("0.0.0.0", 0)
      .addDnsServer("1.1.1.1")
      .establish()
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannel(NotificationChannel("heni_vpn", "Heni Tech VPN", NotificationManager.IMPORTANCE_LOW))
    }
  }

  private fun notification(): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, "heni_vpn")
    } else {
      Notification.Builder(this)
    }
    return builder.setContentTitle("Heni Tech VPN")
      .setContentText("VPN service is active")
      .setSmallIcon(android.R.drawable.stat_sys_warning)
      .setOngoing(true)
      .build()
  }

  override fun onRevoke() {
    stopSelf()
    super.onRevoke()
  }

  override fun onDestroy() {
    tunnel?.close()
    tunnel = null
    stopForeground(STOP_FOREGROUND_REMOVE)
    super.onDestroy()
  }

  override fun onBind(intent: Intent?): IBinder? = super.onBind(intent)
}
`;

module.exports = function withHeniTechVpn(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest["uses-permission"] = manifest["uses-permission"] || [];
    for (const permission of [
      "android.permission.BIND_VPN_SERVICE",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.FOREGROUND_SERVICE_DATA_SYNC",
      "android.permission.POST_NOTIFICATIONS",
    ]) {
      if (!manifest["uses-permission"].some((entry) => entry.$?.["android:name"] === permission)) {
        manifest["uses-permission"].push({ $: { "android:name": permission } });
      }
    }
    const application = manifest.application?.[0];
    if (application) {
      application.service = application.service || [];
      if (!application.service.some((service) => service.$?.["android:name"] === serviceName)) {
        application.service.push({
          $: {
            "android:name": serviceName,
            "android:permission": "android.permission.BIND_VPN_SERVICE",
            "android:exported": "false",
            "android:foregroundServiceType": "dataSync",
          },
          "intent-filter": [{ action: [{ $: { "android:name": "android.net.VpnService" } }] }],
        });
      }
    }
    return config;
  });

  return withDangerousMod(config, ["android", async (config) => {
    const androidRoot = config.modRequest.platformProjectRoot;
    const sourceDir = path.join(androidRoot, "app", "src", "main", "java", packagePath);
    fs.mkdirSync(sourceDir, { recursive: true });
    fs.writeFileSync(path.join(sourceDir, "TunnelGuardVpnService.kt"), serviceSource);
    return config;
  }]);
};

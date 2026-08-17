package com.henijohn.henivpn

import android.content.Intent
import android.net.VpnService
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HeniVpnModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HeniVpn")

    AsyncFunction("start") { request: Map<String, Any?>, promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(mapOf("ok" to false, "code" to "NO_CONTEXT", "message" to "Android context unavailable"))
        return@AsyncFunction
      }
      val prepareIntent = VpnService.prepare(context)
      if (prepareIntent != null) {
        promise.resolve(mapOf("ok" to false, "code" to "VPN_PERMISSION_REQUIRED", "message" to "Android VPN permission is required before starting."))
        return@AsyncFunction
      }
      val mode = request["protocol"]?.toString().orEmpty()
      val host = request["host"]?.toString().orEmpty()
      val port = (request["port"] as? Number)?.toInt() ?: 0
      val validation = TransportDispatcher.validate(mode, host, port)
      if (validation.isFailure) {
        promise.resolve(mapOf("ok" to false, "code" to "INVALID_PROFILE", "message" to validation.exceptionOrNull()?.message.orEmpty()))
        return@AsyncFunction
      }
      promise.resolve(mapOf("ok" to false, "code" to "ADAPTER_PENDING", "message" to "The selected independent transport adapter is not verified yet."))
    }

    AsyncFunction("stop") { promise: Promise ->
      val context = appContext.reactContext ?: run {
        promise.resolve(mapOf("ok" to false, "code" to "NO_CONTEXT", "message" to "Android context unavailable"))
        return@AsyncFunction
      }
      context.stopService(Intent(context, HeniVpnService::class.java))
      promise.resolve(mapOf("ok" to true, "status" to "idle"))
    }

    AsyncFunction("getStatus") {
      mapOf("status" to if (HeniVpnService.running) "running" else "idle")
    }
  }
}

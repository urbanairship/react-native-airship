/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import com.urbanairship.UAirship
import com.urbanairship.analytics.Extension
import com.urbanairship.android.framework.proxy.BaseAutopilot
import com.urbanairship.android.framework.proxy.Event
import com.urbanairship.android.framework.proxy.EventType
import com.urbanairship.android.framework.proxy.ProxyLogger
import com.urbanairship.android.framework.proxy.ProxyStore
import com.urbanairship.android.framework.proxy.events.EventEmitter
import com.urbanairship.embedded.AirshipEmbeddedInfo
import com.urbanairship.embedded.AirshipEmbeddedObserver
import com.urbanairship.json.JsonMap
import com.urbanairship.json.jsonMapOf
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch

/**
 * Module's autopilot to customize Urban Airship.
 */
class ReactAutopilot : BaseAutopilot() {

    override fun onAirshipReady(airship: UAirship) {
        super.onAirshipReady(airship)

        ProxyLogger.info("Airship React Native version: %s, SDK version: %s", BuildConfig.AIRSHIP_MODULE_VERSION, UAirship.getVersion())

        val context = UAirship.getApplicationContext()

        MainScope().launch {
            EventEmitter.shared().pendingEventListener
                    .filter { !it.type.isForeground() }
                    .collect {
                        AirshipHeadlessEventService.startService(context)
                    }
        }

        MainScope().launch {
            AirshipEmbeddedObserver(filter = { true }).embeddedViewInfoFlow.collect {
                EventEmitter.shared().addEvent(PendingEmbeddedUpdated(it))
            }
        }

        // Set our custom notification providerr
        val notificationProvider = ReactNotificationProvider(context, airship.airshipConfigOptions)
        airship.pushManager.notificationProvider = notificationProvider

        airship.analytics.registerSDKExtension(Extension.REACT_NATIVE, BuildConfig.AIRSHIP_MODULE_VERSION)

        val extender = createExtender(context)
        extender?.onAirshipReady(context, airship)
    }

    override fun onMigrateData(context: Context, proxyStore: ProxyStore) {
        DataMigrator(context).migrateData(proxyStore)
    }

    private fun createExtender(context: Context): AirshipExtender? {
        val ai: ApplicationInfo
        try {
            ai = context.packageManager.getApplicationInfo(context.packageName, PackageManager.GET_META_DATA)

            if (ai.metaData == null) {
                return null
            }
        } catch (e: PackageManager.NameNotFoundException) {
            return null
        }

        val classname = ai.metaData.getString(EXTENDER_MANIFEST_KEY) ?: return null

        try {
            val extenderClass = Class.forName(classname)
            return extenderClass.newInstance() as AirshipExtender
        } catch (e: Exception) {
            ProxyLogger.error(e, "Unable to create extender: $classname")
        }
        return null
    }

    companion object {
        const val EXTENDER_MANIFEST_KEY = "com.urbanairship.reactnative.AIRSHIP_EXTENDER"
    }
}

internal class PendingEmbeddedUpdated(pending: List<AirshipEmbeddedInfo>) : Event {
    override val type = EventType.PENDING_EMBEDDED_UPDATED

    override val body: JsonMap = jsonMapOf(
        "pending" to pending.map { jsonMapOf( "embeddedId" to it.embeddedId ) }
    )
}
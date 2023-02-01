package com.urbanairship.reactnative

import android.content.Context
import com.urbanairship.android.framework.proxy.NotificationConfig
import com.urbanairship.android.framework.proxy.ProxyConfig
import com.urbanairship.android.framework.proxy.ProxyLogger
import com.urbanairship.android.framework.proxy.ProxyStore
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue

internal class DataMigrator(context: Context) {

    private val preferences =
        context.getSharedPreferences(SHARED_PREFERENCES_FILE, Context.MODE_PRIVATE)

    fun migrateData(proxyStore: ProxyStore) {
        // NotificationConfig
        if (preferences.contains(NOTIFICATION_ICON_KEY) ||
            preferences.contains(NOTIFICATION_LARGE_ICON_KEY) ||
            preferences.contains(NOTIFICATION_ACCENT_COLOR_KEY) ||
            preferences.contains(DEFAULT_NOTIFICATION_CHANNEL_ID)
        ) {

            proxyStore.notificationConfig = NotificationConfig(
                icon = preferences.getString(NOTIFICATION_ICON_KEY, null),
                largeIcon = preferences.getString(NOTIFICATION_LARGE_ICON_KEY, null),
                accentColor = preferences.getString(NOTIFICATION_ACCENT_COLOR_KEY, null),
                defaultChannelId = preferences.getString(DEFAULT_NOTIFICATION_CHANNEL_ID, null)
            )

            preferences.edit()
                .remove(NOTIFICATION_ICON_KEY)
                .remove(NOTIFICATION_LARGE_ICON_KEY)
                .remove(NOTIFICATION_ACCENT_COLOR_KEY)
                .remove(DEFAULT_NOTIFICATION_CHANNEL_ID)
                .apply()
        }

        // Opt-in cache
        if (preferences.contains(NOTIFICATIONS_OPT_IN_KEY)) {
            proxyStore.optInStatus = preferences.getBoolean(NOTIFICATIONS_OPT_IN_KEY, false)

            preferences.edit()
                .remove(NOTIFICATIONS_OPT_IN_KEY)
                .apply()
        }

        // Airship config
        if (preferences.contains(AIRSHIP_CONFIG)) {
            try {
                val config = JsonValue.parseString(
                    preferences.getString(AIRSHIP_CONFIG, null)
                ).optMap()

                val builder = JsonMap.newBuilder()
                    .putAll(config)

                // Feature names have changed
                config.get("enabledFeatures")?.let { featuresJson ->
                    val parsed = featuresJson.optList().mapNotNull { json ->
                        FEATURE_NAME_MAP[json.optString()]
                    }
                    builder.putOpt("enabledFeatures", JsonValue.wrapOpt(parsed))
                }

                val updatedConfig = builder.build()
                proxyStore.airshipConfig = ProxyConfig(updatedConfig)

                preferences.edit()
                    .remove(AIRSHIP_CONFIG)
                    .apply()
            } catch (exception: Exception) {
                ProxyLogger.error("Failed to migrate config", exception)
            }
        }

        // Message center
        if (preferences.contains(AUTO_LAUNCH_MESSAGE_CENTER)) {
            proxyStore.isAutoLaunchMessageCenterEnabled =
                preferences.getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, false)

            preferences.edit()
                .remove(AUTO_LAUNCH_MESSAGE_CENTER)
                .apply()
        }

        // Preference Center
        preferences.all.filter {
            it.key.startsWith("preference_center_auto_launch_")
        }.mapValues {
            if (it.value is Boolean) {
                it.value as Boolean
            } else {
                true
            }
        }.forEach {
            val preferenceCenterId = it.key.removePrefix("preference_center_auto_launch_")
            proxyStore.setAutoLaunchPreferenceCenter(preferenceCenterId, it.value)

            preferences.edit()
                .remove(it.key)
                .apply()
        }
    }

    companion object {
        private const val SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative"
        private const val NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY"
        private const val NOTIFICATION_ICON_KEY = "notification_icon"
        private const val NOTIFICATION_LARGE_ICON_KEY = "notification_large_icon"
        private const val NOTIFICATION_ACCENT_COLOR_KEY = "notification_accent_color"
        private const val DEFAULT_NOTIFICATION_CHANNEL_ID = "default_notification_channel_id"
        private const val AUTO_LAUNCH_MESSAGE_CENTER = "com.urbanairship.auto_launch_message_center"
        private const val AIRSHIP_CONFIG = "airship_config"
        private val FEATURE_NAME_MAP: Map<String, String> = mapOf(
            "FEATURE_NONE" to "none",
            "FEATURE_IN_APP_AUTOMATION" to "in_app_automation",
            "FEATURE_MESSAGE_CENTER" to "message_center",
            "FEATURE_PUSH" to "push",
            "FEATURE_CHAT" to "chat",
            "FEATURE_ANALYTICS" to "analytics",
            "FEATURE_TAGS_AND_ATTRIBUTES" to "tags_and_attributes",
            "FEATURE_CONTACTS" to "contacts",
            "FEATURE_LOCATION" to "location",
            "FEATURE_ALL" to "all"
        )
    }
}
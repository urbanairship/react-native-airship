/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.annotation.SuppressLint
import android.content.Context
import android.content.SharedPreferences
import android.preference.PreferenceManager
import com.urbanairship.json.JsonException
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Stores shared preferences and checks preference-dependent state.
 */
class ReactAirshipPreferences(private val context: Context) {

    private val preferences by lazy {
        context.getSharedPreferences(SHARED_PREFERENCES_FILE, Context.MODE_PRIVATE)
    }

    private val lock = Object()

    /**
     * Custom notification icon resource name.
     */
    var notificationIcon: String?
        get() = getString(NOTIFICATION_ICON_KEY, null)
        set(value) {
            edit().putString(NOTIFICATION_ICON_KEY, value).apply()
        }

    /**
     * Custom large notification icon resource name.
     */
    var notificationLargeIcon: String?
        get() = getString(NOTIFICATION_LARGE_ICON_KEY, null)
        set(value) {
            edit().putString(NOTIFICATION_LARGE_ICON_KEY, value).apply()
        }

    /**
     * Notification accent color resource name.
     */
    var notificationAccentColor: String?
        get() = getString(NOTIFICATION_ACCENT_COLOR_KEY, null)
        set(value) {
            edit().putString(NOTIFICATION_ACCENT_COLOR_KEY, value).apply()
        }

    /**
     * Airship Configuration.
     */
    var airshipConfig: JsonMap?
        get() {
            val config = getString(AIRSHIP_CONFIG, null) ?: return JsonMap.EMPTY_MAP
            return try {
                JsonValue.parseString(config).map
            } catch (e: JsonException) {
                PluginLogger.error("Failed to parse config.", e)
                null
            }
        }
        set(value) {
            edit().putString(AIRSHIP_CONFIG, value.toString()).apply()
        }

    /**
     * Default notification channel ID.
     */
    var defaultNotificationChannelId: String?
        get() = getString(DEFAULT_NOTIFICATION_CHANNEL_ID, null)
        set(value) {
            edit().putString(DEFAULT_NOTIFICATION_CHANNEL_ID, value).apply()
        }

    /**
     * Opt in status.
     */
    var optInStatus: Boolean
        get() = getBoolean(NOTIFICATIONS_OPT_IN_KEY, false)
        set(optIn) {
            edit().putBoolean(NOTIFICATIONS_OPT_IN_KEY, optIn).apply()
        }

    val isAutoLaunchMessageCenterEnabled: Boolean
        get() = getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true)

    fun setAutoLaunchMessageCenter(autoLaunch: Boolean) {
        edit().putBoolean(AUTO_LAUNCH_MESSAGE_CENTER, autoLaunch).apply()
    }

    val isAutoLaunchChatEnabled: Boolean
        get() = getBoolean(AUTO_LAUNCH_CHAT, true)

    fun setAutoLaunchChat(autoLaunch: Boolean) {
        edit().putBoolean(AUTO_LAUNCH_CHAT, autoLaunch).apply()
    }

    fun isAutoLaunchPreferenceCenterEnabled(preferenceId: String): Boolean {
        val key = getAutoLaunchPreferenceCenterKey(preferenceId)
        return getBoolean(key, true)
    }

    fun setAutoLaunchPreferenceCenter(preferenceId: String, autoLaunch: Boolean) {
        val key = getAutoLaunchPreferenceCenterKey(preferenceId)
        edit().putBoolean(key, autoLaunch).apply()
    }

    private fun getString(key: String, defaultValue: String?): String? {
        ensurePreferences()
        return preferences.getString(key, defaultValue)
    }

    private fun getBoolean(key: String, defaultValue: Boolean): Boolean {
        ensurePreferences()
        return preferences.getBoolean(key, defaultValue)
    }

    private fun edit(): SharedPreferences.Editor {
        ensurePreferences()
        return preferences.edit()
    }

    private fun ensurePreferences() {
        synchronized (lock) {
            // Migrate any data stored in default
            val defaultPreferences = PreferenceManager.getDefaultSharedPreferences(context)
            if (defaultPreferences.contains(AUTO_LAUNCH_MESSAGE_CENTER)) {
                val autoLaunchMessageCenter = defaultPreferences.getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true)
                defaultPreferences.edit().remove(AUTO_LAUNCH_MESSAGE_CENTER).apply()
                preferences.edit().putBoolean(AUTO_LAUNCH_MESSAGE_CENTER, autoLaunchMessageCenter).apply()
            }
        }
    }

    companion object {
        @SuppressLint("StaticFieldLeak")
        @Volatile
        private var sharedInstance: ReactAirshipPreferences? = null
        private val sharedInstanceLock = Any()

        private const val SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative"
        private const val AUTO_LAUNCH_CHAT = "AUTO_LAUNCH_CHAT"
        private const val NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY"
        private const val NOTIFICATION_ICON_KEY = "notification_icon"
        private const val NOTIFICATION_LARGE_ICON_KEY = "notification_large_icon"
        private const val NOTIFICATION_ACCENT_COLOR_KEY = "notification_accent_color"
        private const val DEFAULT_NOTIFICATION_CHANNEL_ID = "default_notification_channel_id"
        private const val AUTO_LAUNCH_MESSAGE_CENTER = "com.urbanairship.auto_launch_message_center"
        private const val AIRSHIP_CONFIG = "airship_config"

        /**
         * Returns the shared [ReactAirshipPreferences] instance.
         *
         * @return The shared [ReactAirshipPreferences] instance.
         */
        @JvmStatic
        fun shared(context: Context): ReactAirshipPreferences {
            synchronized(sharedInstanceLock) {
                if (sharedInstance == null) {
                    sharedInstance = ReactAirshipPreferences(context)
                }
                return sharedInstance!!
            }
        }

        private fun getAutoLaunchPreferenceCenterKey(preferenceId: String): String {
            return "preference_center_auto_launch_$preferenceId"
        }
    }
}
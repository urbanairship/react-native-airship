/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactMethod;
import com.urbanairship.UAirship;
import com.urbanairship.json.JsonException;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;

import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Stores shared preferences and checks preference-dependent state.
 */
public class ReactAirshipPreferences {

    private static ReactAirshipPreferences sharedInstance;
    private static Object sharedInstanceLock = new Object();

    private SharedPreferences preferences;

    private static final String SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative";

    private static final String AUTO_LAUNCH_CHAT = "AUTO_LAUNCH_CHAT";

    private static final String NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY";

    private static final String NOTIFICATION_ICON_KEY = "notification_icon";
    private static final String NOTIFICATION_LARGE_ICON_KEY = "notification_large_icon";
    private static final String NOTIFICATION_ACCENT_COLOR_KEY = "notification_accent_color";
    private static final String DEFAULT_NOTIFICATION_CHANNEL_ID = "default_notification_channel_id";
    private static final String AUTO_LAUNCH_MESSAGE_CENTER = "com.urbanairship.auto_launch_message_center";
    private static final String AIRSHIP_CONFIG = "airship_config";

    private AtomicBoolean created = new AtomicBoolean(false);
    private Context context;

    public ReactAirshipPreferences(@NonNull Context context) {
        this.context = context;
    }

    /**
     * Returns the shared {@link ReactAirshipPreferences} instance.
     *
     * @return The shared {@link ReactAirshipPreferences} instance.
     */
    public static ReactAirshipPreferences shared(@NonNull Context context) {
        synchronized (sharedInstanceLock) {
            if (sharedInstance == null) {
                sharedInstance = new ReactAirshipPreferences(context);
            }
            return sharedInstance;
        }
    }

    /**
     * Sets a custom notification icon resource name.
     *
     * @param value The value.
     */
    public void setNotificationIcon(@Nullable String value) {
        edit().putString(NOTIFICATION_ICON_KEY, value).apply();
    }

    /**
     * Gets the custom notification icon resource name.
     *
     * @return The icon name.
     */
    @Nullable
    public String getNotificationIcon() {
        return getString(NOTIFICATION_ICON_KEY, null);
    }

    /**
     * Sets the custom large notification icon resource name.
     *
     * @param value   The value.
     */
    public void setNotificationLargeIcon(@Nullable String value) {
        edit().putString(NOTIFICATION_LARGE_ICON_KEY, value).apply();
    }

    /**
     * Gets the custom large notification icon resource name.
     *
     * @return The large icon name.
     */
    @Nullable
    public String getNotificationLargeIcon() {
        return getString(NOTIFICATION_LARGE_ICON_KEY, null);
    }

    /**
     * Sets the notification accent color resource name.
     *
     * @param value   The value.
     */
    public void setNotificationAccentColor(@Nullable String value) {
        edit().putString(NOTIFICATION_ACCENT_COLOR_KEY, value).apply();
    }

    /**
     * Gets the notification accent color resource name.
     *
     * @return The accent color.
     */
    @Nullable
    public String getNotificationAccentColor() {
        return getString(NOTIFICATION_ACCENT_COLOR_KEY, null);
    }

    /**
     * Sets the default notification channel ID.
     *
     * @param value   The value.
     */
    public void setDefaultNotificationChannelId(@Nullable String value) {
        edit().putString(DEFAULT_NOTIFICATION_CHANNEL_ID, value).apply();
    }

    @Nullable
    public JsonMap getAirshipConfig() {
        String config = getString(AIRSHIP_CONFIG, null);
        if (config == null) {
            return JsonMap.EMPTY_MAP;
        }

        try {
            return JsonValue.parseString(config).getMap();
        } catch (JsonException e) {
            PluginLogger.error("Failed to parse config.", e);
            return null;
        }
    }

    public void setAirshipConfig(JsonMap config) {
        edit().putString(AIRSHIP_CONFIG, config.toString()).apply();
    }

    /**
     * Gets the default notification channel ID.
     *
     * @return The default notification channel ID.
     */
    @Nullable
    public String getDefaultNotificationChannelId() {
        return getString(DEFAULT_NOTIFICATION_CHANNEL_ID, null);
    }

    /**
     * Saves opt in status in shared preferences.
     *
     * @param optIn   The opt in state.
     */
    public void setOptInStatus(boolean optIn) {
        edit().putBoolean(NOTIFICATIONS_OPT_IN_KEY, optIn).apply();
    }

    /**
     * Gets opt in status from shared preferences.
     */
    public boolean getOptInStatus() {
        return getBoolean(NOTIFICATIONS_OPT_IN_KEY, false);
    }

    public void setAutoLaunchMessageCenter(boolean autoLaunch) {
        edit().putBoolean(AUTO_LAUNCH_MESSAGE_CENTER, autoLaunch).apply();
    }

    public boolean isAutoLaunchMessageCenterEnabled() {
        return getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true);
    }

    public void setAutoLaunchChat(boolean autoLaunch) {
        edit().putBoolean(AUTO_LAUNCH_CHAT, autoLaunch).apply();
    }

    public boolean isAutoLaunchChatEnabled() {
        return getBoolean(AUTO_LAUNCH_CHAT, true);
    }

    public void setAutoLaunchPreferenceCenter(@NonNull String preferenceId, boolean autoLaunch) {
        String key = getAutoLaunchPreferenceCenterKey(preferenceId);
        edit().putBoolean(key, autoLaunch).apply();
    }

    public boolean isAutoLaunchPreferenceCenterEnabled(@NonNull String preferenceId) {
        String key = getAutoLaunchPreferenceCenterKey(preferenceId);
        return getBoolean(key, true);
    }

    private static String getAutoLaunchPreferenceCenterKey(String preferenceId) {
        return "preference_center_auto_launch_" + preferenceId;
    }

    private String getString(@NonNull String key, @Nullable String defaultValue) {
        ensurePreferences();
        return preferences.getString(key, defaultValue);
    }

    private boolean getBoolean(@NonNull String key, boolean defaultValue) {
        ensurePreferences();
        return preferences.getBoolean(key, defaultValue);
    }

    private SharedPreferences.Editor edit() {
        ensurePreferences();
        return preferences.edit();
    }

    private void ensurePreferences() {
        if (preferences == null) {
            this.preferences = context.getSharedPreferences(SHARED_PREFERENCES_FILE, Context.MODE_PRIVATE);
        }

        if (!created.getAndSet(true)) {
            // Migrate any data stored in default
            SharedPreferences defaultPreferences = PreferenceManager.getDefaultSharedPreferences(context);
            if (defaultPreferences.contains(AUTO_LAUNCH_MESSAGE_CENTER)) {
                boolean autoLaunchMessageCenter = defaultPreferences.getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true);
                defaultPreferences.edit().remove(AUTO_LAUNCH_MESSAGE_CENTER).apply();
                this.preferences.edit().putBoolean(AUTO_LAUNCH_MESSAGE_CENTER, autoLaunchMessageCenter).apply();
            }
        }
    }
}

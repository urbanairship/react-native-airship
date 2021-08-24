/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.SharedPreferences;

import androidx.annotation.Nullable;

/**
 * Stores shared preferences and checks preference-dependent state.
 */
public class ReactAirshipPreferences {

    private static ReactAirshipPreferences sharedInstance = new ReactAirshipPreferences();

    private SharedPreferences preferences;

    private static final String SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative";

    private static final String NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY";

    private static final String NOTIFICATION_ICON_KEY = "notification_icon";
    private static final String NOTIFICATION_LARGE_ICON_KEY = "notification_large_icon";
    private static final String NOTIFICATION_ACCENT_COLOR_KEY = "notification_accent_color";
    private static final String DEFAULT_NOTIFICATION_CHANNEL_ID = "default_notification_channel_id";

    /**
     * Returns the shared {@link ReactAirshipPreferences} instance.
     *
     * @return The shared {@link ReactAirshipPreferences} instance.
     */
    static ReactAirshipPreferences shared() {
        return sharedInstance;
    }

    private SharedPreferences getPreferences(Context context) {
        if (preferences == null) {
            preferences = context.getSharedPreferences(SHARED_PREFERENCES_FILE, Context.MODE_PRIVATE);
        }

        return preferences;
    }

    /**
     * Sets a custom notification icon resource name.
     * @param context The application context.
     * @param value The value.
     */
    public void setNotificationIcon(Context context, @Nullable String value) {
        getPreferences(context).edit().putString(NOTIFICATION_ICON_KEY, value).apply();
    }

    /**
     * Gets the custom notification icon resource name.
     * @param context The application context.
     * @return The icon name.
     */
    @Nullable
    public String getNotificationIcon(Context context) {
        return getPreferences(context).getString(NOTIFICATION_ICON_KEY, null);
    }

    /**
     * Sets the custom large notification icon resource name.
     * @param context The application context.
     * @param value The value.
     */
    public void setNotificationLargeIcon(Context context, @Nullable String value) {
        getPreferences(context).edit().putString(NOTIFICATION_LARGE_ICON_KEY, value).apply();
    }

    /**
     * Gets the custom large notification icon resource name.
     * @param context The application context.
     * @return The large icon name.
     */
    @Nullable
    public String getNotificationLargeIcon(Context context) {
        return getPreferences(context).getString(NOTIFICATION_LARGE_ICON_KEY, null);
    }

    /**
     * Sets the notification accent color resource name.
     * @param context The application context.
     * @param value The value.
     */
    public void setNotificationAccentColor(Context context, @Nullable String value) {
        getPreferences(context).edit().putString(NOTIFICATION_ACCENT_COLOR_KEY, value).apply();
    }

    /**
     * Gets the notification accent color resource name.
     * @param context The application context.
     * @return The accent color.
     */
    @Nullable
    public String getNotificationAccentColor(Context context) {
        return getPreferences(context).getString(NOTIFICATION_ACCENT_COLOR_KEY, null);
    }

    /**
     * Sets the default notification channel ID.
     * @param context The application context.
     * @param value The value.
     */
    public void setDefaultNotificationChannelId(Context context, @Nullable String value) {
        getPreferences(context).edit().putString(DEFAULT_NOTIFICATION_CHANNEL_ID, value).apply();
    }

    /**
     * Gets the default notification channel ID.
     * @param context The application context.
     * @return The default notifiation channel ID.
     */
    @Nullable
    public String getDefaultNotificationChannelId(Context context) {
        return getPreferences(context).getString(DEFAULT_NOTIFICATION_CHANNEL_ID, null);
    }

    /**
     * Saves opt in status in shared preferences.
     * @param optIn The opt in state.
     * @param context The application context.
     */
    public void setOptInStatus(boolean optIn, Context context) {
        getPreferences(context).edit().putBoolean(NOTIFICATIONS_OPT_IN_KEY, optIn).apply();
    }

    /**
     * Gets opt in status from shared preferences.
     * @param context The application context.
     */
    public boolean getOptInStatus(Context context) {
        return getPreferences(context).getBoolean(NOTIFICATIONS_OPT_IN_KEY, false);
    }

    
}

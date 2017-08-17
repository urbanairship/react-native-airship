/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.SharedPreferences;

import com.urbanairship.UAirship;
import com.urbanairship.reactnative.events.NotificationOptInEvent;

/**
 * Stores shared preferences and checks preference-dependent state.
 */
public class ReactAirshipPreferences {

    private static ReactAirshipPreferences sharedInstance = new ReactAirshipPreferences();

    private SharedPreferences preferences;

    private static final String SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative";

    private static final String NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY";

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

/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.reactnative.Event;


/**
 * Notification opt-in status event.
 */
public class NotificationOptInEvent implements Event {

    private static final String NOTIFICATION_OPT_IN_STATUS_EVENT = "com.urbanairship.notification_opt_in_status";
    private static final String OPT_IN = "optIn";

    private final boolean optInStatus;

    /**
     * Default constructor.
     *
     * @param optInStatus The app opt-in status.
     */
    public NotificationOptInEvent(boolean optInStatus) {
        this.optInStatus = optInStatus;
    }

    @NonNull
    @Override
    public String getName() {
        return NOTIFICATION_OPT_IN_STATUS_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putBoolean(OPT_IN, optInStatus);
        return map;
    }


    @Override
    public boolean isForeground() {
        return true;
    }

}

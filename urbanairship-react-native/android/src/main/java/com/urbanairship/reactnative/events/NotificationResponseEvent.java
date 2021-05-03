/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.push.NotificationActionButtonInfo;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.reactnative.Event;

/**
 * Notification response event.
 */
public class NotificationResponseEvent implements Event {

    private static final String NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
    private static final String RESPONSE_ACTION_ID = "actionId";
    private static final String RESPONSE_FOREGROUND = "isForeground";
    private static final String RESPONSE_NOTIFICATION = "notification";

    private final NotificationInfo notificationInfo;
    private final NotificationActionButtonInfo actionButtonInfo;


    /**
     * Creates an event for a notification response.
     *
     * @param notificationInfo The notification info.
     */
    public NotificationResponseEvent(@NonNull NotificationInfo notificationInfo) {
        this(notificationInfo, null);
    }

    /**
     * Creates an event for a notification action button response.
     *
     * @param notificationInfo The notification info.
     */
    public NotificationResponseEvent(@NonNull NotificationInfo notificationInfo, @Nullable NotificationActionButtonInfo actionButtonInfo) {
        this.notificationInfo = notificationInfo;
        this.actionButtonInfo = actionButtonInfo;
    }

    @NonNull
    @Override
    public String getName() {
        return NOTIFICATION_RESPONSE_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putMap(RESPONSE_NOTIFICATION, new PushReceivedEvent(notificationInfo).getBody());

        if (actionButtonInfo != null) {
            map.putString(RESPONSE_ACTION_ID, actionButtonInfo.getButtonId());
            map.putBoolean(RESPONSE_FOREGROUND, actionButtonInfo.isForeground());
        } else {
            map.putBoolean(RESPONSE_FOREGROUND, true);
        }

        return map;
    }

    @Override
    public boolean isForeground() {
        return actionButtonInfo != null ? actionButtonInfo.isForeground() : true;
    }
}

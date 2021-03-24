/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import android.os.Bundle;
import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.push.PushMessage;
import com.urbanairship.reactnative.Event;
import com.urbanairship.util.UAStringUtil;

/**
 * Push received event.
 */
public class PushReceivedEvent implements Event {

    private static final String PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
    private static final String PUSH_ALERT = "alert";
    private static final String PUSH_TITLE = "title";
    private static final String PUSH_EXTRAS = "extras";
    private static final String NOTIFICATION_ID = "notificationId";

    private final PushMessage message;
    private Integer notificationId;
    private String notificationTag;

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    public PushReceivedEvent(@NonNull PushMessage message) {
        this.message = message;
    }

    /**
     * Default constructor.
     *
     * @param notificationInfo The posted notification info.
     */
    public PushReceivedEvent(@NonNull NotificationInfo notificationInfo) {
        this.message = notificationInfo.getMessage();
        this.notificationId = notificationInfo.getNotificationId();
        this.notificationTag = notificationInfo.getNotificationTag();
    }

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    public PushReceivedEvent(@NonNull PushMessage message, int notificationId, String notificationTag) {
        this.message = message;
        this.notificationId = notificationId;
        this.notificationTag = notificationTag;
    }

    @NonNull
    @Override
    public String getName() {
        return PUSH_RECEIVED_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();

        if (message.getAlert() != null) {
            map.putString(PUSH_ALERT, message.getAlert());
        }

        if (message.getTitle() != null) {
            map.putString(PUSH_TITLE, message.getTitle());
        }

        if (notificationId != null) {
            map.putString(NOTIFICATION_ID, getNotificationId(notificationId, notificationTag));
        }

        Bundle bundle = new Bundle(message.getPushBundle());
        bundle.remove("android.support.content.wakelockid");
        map.putMap(PUSH_EXTRAS, Arguments.fromBundle(bundle));

        return map;
    }

    private static String getNotificationId(int notificationId, String notificationTag) {
        String id = String.valueOf(notificationId);
        if (!UAStringUtil.isEmpty(notificationTag)) {
            id += ":" + notificationTag;
        }

        return id;
    }


    @Override
    public boolean isForeground() {
        return false;
    }
}

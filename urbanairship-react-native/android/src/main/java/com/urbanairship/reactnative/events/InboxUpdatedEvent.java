/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.reactnative.Event;

/**
 * Inbox updated event.
 */
public class InboxUpdatedEvent implements Event {

    private static final String INBOX_UPDATED_EVENT = "com.urbanairship.inbox_updated";
    private static final String MESSAGE_UNREAD_COUNT = "messageUnreadCount";
    private static final String MESSAGE_COUNT = "messageCount";

    private final int unreadCount;
    private final int count;

    /**
     * Default constructor.
     *
     * @param unreadCount The number of unread messages in the message center.
     * @param count The number of total messages in the message center.
     */
    public InboxUpdatedEvent(int unreadCount, int count) {
        this.unreadCount = unreadCount;
        this.count = count;
    }
    @NonNull
    @Override
    public String getName() {
        return INBOX_UPDATED_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putInt(MESSAGE_UNREAD_COUNT, unreadCount);
        map.putInt(MESSAGE_COUNT, count);

        return map;
    }


    @Override
    public boolean isForeground() {
        return true;
    }
}

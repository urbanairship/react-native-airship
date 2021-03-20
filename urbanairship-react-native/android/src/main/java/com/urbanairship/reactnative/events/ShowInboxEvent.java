/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.reactnative.Event;

/**
 * Show inbox event.
 */
public class ShowInboxEvent implements Event {

    private static final String SHOW_INBOX_EVENT = "com.urbanairship.show_inbox";
    private static final String MESSAGE_ID = "messageId";

    private final String messageId;

    /**
     * Default constructor.
     *
     * @param messageId The optional message ID.
     */
    public ShowInboxEvent(@Nullable String messageId) {
        this.messageId = messageId;
    }

    @NonNull
    @Override
    public String getName() {
        return SHOW_INBOX_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putString(MESSAGE_ID, messageId);
        return map;
    }
    @Override
    public boolean isForeground() {
        return true;
    }
}

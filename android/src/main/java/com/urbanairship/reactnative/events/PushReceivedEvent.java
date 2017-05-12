/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import android.os.Bundle;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.push.PushMessage;
import com.urbanairship.reactnative.Event;


/**
 * Push received event.
 */
public class PushReceivedEvent implements Event {

    private static final String PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
    private static final String PUSH_ALERT = "alert";
    private static final String PUSH_TITLE = "title";
    private static final String PUSH_EXTRAS = "extras";

    private final PushMessage message;

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    public PushReceivedEvent(@NonNull PushMessage message) {
        this.message = message;
    }

    @NonNull
    @Override
    public String getName() {
        return PUSH_RECEIVED_EVENT;
    }

    @NonNull
    @Override
    public WritableMap getBody() {
        WritableMap map = Arguments.createMap();

        if (message.getAlert() != null) {
            map.putString(PUSH_ALERT, message.getAlert());
        }

        if (message.getTitle() != null) {
            map.putString(PUSH_TITLE, message.getTitle());
        }

        Bundle bundle = new Bundle(message.getPushBundle());
        bundle.remove("android.support.content.wakelockid");
        map.putMap(PUSH_EXTRAS, Arguments.fromBundle(bundle));

        return map;
    }

    @Override
    public boolean isCritical() {
        return false;
    }
}

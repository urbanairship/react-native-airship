/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.reactnative.Event;

/**
 * Registration event.
 */
public class RegistrationEvent implements Event {

    private static final String CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
    private static final String CHANNEL_ID = "channelId";
    private static final String REGISTRATION_TOKEN = "registrationToken";

    private final String channelId;
    private final String registrationToken;

    /**
     * Default constructor.
     *
     * @param channelId The channel ID.
     * @param registrationToken The registration token.
     */
    public RegistrationEvent(@NonNull String channelId, @Nullable  String registrationToken) {
        this.channelId = channelId;
        this.registrationToken = registrationToken;
    }

    @NonNull
    @Override
    public String getName() {
        return CHANNEL_REGISTRATION_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putString(CHANNEL_ID, channelId);

        if (registrationToken != null) {
            map.putString(REGISTRATION_TOKEN, registrationToken);
        }

        return map;
    }


    @Override
    public boolean isForeground() {
        return true;
    }
}

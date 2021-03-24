/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.reactnative.Event;

/**
 * Deep link event.
 */
public class DeepLinkEvent implements Event {

    private static final String DEEP_LINK_EVENT = "com.urbanairship.deep_link";
    private static final String DEEP_LINK = "deepLink";
    private final String deepLink;

    /**
     * Default constructor.
     *
     * @param deepLink The deep link.
     */
    public DeepLinkEvent(@NonNull String deepLink) {
        this.deepLink = deepLink;
    }

    @NonNull
    @Override
    public String getName() {
        return DEEP_LINK_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putString(DEEP_LINK, deepLink);
        return map;
    }

    @Override
    public boolean isForeground() {
        return true;
    }
}

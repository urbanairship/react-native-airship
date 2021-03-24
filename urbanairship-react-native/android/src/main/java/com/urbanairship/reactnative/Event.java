/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReadableMap;

/**
 * Event interface.
 */
public interface Event {

    /**
     * The event name.
     *
     * @return The event name.
     */
    @NonNull
    String getName();

    /**
     * The event body.
     *
     * @return The event body.
     */
    @NonNull
    ReadableMap getBody();

    /**
     * Flags if the event should only be delivered in the foreground or not.
     *
     * @return {@code true} if the event should only be delivered in the foreground, otherwise {@code false}.
     */
    boolean isForeground();
}

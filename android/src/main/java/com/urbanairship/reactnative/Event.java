/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.WritableMap;

/**
 * Event interface.
 */
public interface Event {

    /**
     * The event name.
     * @return The event name.
     */
    @NonNull
    String getName();

    /**
     * The event body.
     * @return The event body.
     */
    @NonNull
    WritableMap getBody();
}

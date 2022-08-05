/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.bridge.ReadableMap

/**
 * Event interface.
 */
interface Event {

    /**
     * The event name.
     */
    val name: String

    /**
     * The event body.
     */
    val body: ReadableMap

    /**
     * Flags if the event should only be delivered in the foreground or not.
     */
    val isForeground: Boolean
}
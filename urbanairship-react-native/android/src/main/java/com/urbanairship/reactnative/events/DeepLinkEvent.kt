/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Deep link event.
 */
class DeepLinkEvent(private val deepLink: String) : Event {

    override val name: String
        get() = DEEP_LINK_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putString(DEEP_LINK, deepLink)
            return map
        }

    override val isForeground: Boolean
        get() = true

    companion object {
        private const val DEEP_LINK_EVENT = "com.urbanairship.deep_link"
        private const val DEEP_LINK = "deepLink"
    }
}
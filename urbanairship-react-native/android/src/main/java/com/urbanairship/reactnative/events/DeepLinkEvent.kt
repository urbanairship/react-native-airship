/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Deep link event.
 */
class DeepLinkEvent(private val deepLink: String) : Event {

    override val name = DEEP_LINK_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putString(DEEP_LINK, deepLink)
    }

    override val isForeground = true

    companion object {
        private const val DEEP_LINK_EVENT = "com.airship.deep_link"
        private const val DEEP_LINK = "deepLink"
    }
}
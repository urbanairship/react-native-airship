/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class DisplayPreferenceCenterEvent(private val preferenceCenterId: String?) : Event {

    override val name = OPEN_PREFERENCE_CENTER_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        preferenceCenterId?.let {
            putString("preferenceCenterId", it)
        }
    }

    override val isForeground = false

    companion object {
        private const val OPEN_PREFERENCE_CENTER_EVENT = "com.urbanairship.open_preference_center"
    }
}
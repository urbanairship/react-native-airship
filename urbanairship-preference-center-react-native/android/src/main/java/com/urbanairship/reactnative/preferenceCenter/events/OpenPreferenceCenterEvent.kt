/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class OpenPreferenceCenterEvent(private val preferenceCenterId: String?) : Event {

    override val name: String
        get() = OPEN_PREFERENCE_CENTER_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            preferenceCenterId?.let {
                map.putString("preferenceCenterId", preferenceCenterId)
            }
            return map
        }

    override val isForeground: Boolean
        get() = false

    companion object {

        private const val OPEN_PREFERENCE_CENTER_EVENT = "com.urbanairship.open_preference_center"

    }
}
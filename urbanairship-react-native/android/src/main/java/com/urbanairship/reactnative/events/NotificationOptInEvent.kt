/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Notification opt-in status event.
 *
 * @param optInStatus The app opt-in status.
 */
class NotificationOptInEvent(private val optInStatus: Boolean) : Event {

    override val name = NOTIFICATION_OPT_IN_STATUS_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putBoolean(OPT_IN, optInStatus)
    }

    override val isForeground = true

    companion object {
        private const val NOTIFICATION_OPT_IN_STATUS_EVENT = "com.airship.notification_opt_in_status"
        private const val OPT_IN = "optIn"
    }
}
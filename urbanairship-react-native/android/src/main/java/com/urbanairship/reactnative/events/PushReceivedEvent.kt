/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.push.NotificationInfo
import com.urbanairship.push.PushMessage
import com.urbanairship.reactnative.Event
import com.urbanairship.reactnative.Utils

/**
 * Push received event.
 */
class PushReceivedEvent : Event {
    override val body: ReadableMap = Arguments.createMap().apply {
        putMap("pushPayload", pushPayload)
    }

    private val pushPayload: ReadableMap

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    constructor(message: PushMessage) {
        this.pushPayload = Utils.pushPayload(message)
    }

    /**
     * Default constructor.
     *
     * @param notificationInfo The posted notification info.
     */
    constructor(notificationInfo: NotificationInfo) {
        this.pushPayload = Utils.pushPayload(notificationInfo)
    }

    override val name = "com.airship.push_received"

    override val isForeground = false
}
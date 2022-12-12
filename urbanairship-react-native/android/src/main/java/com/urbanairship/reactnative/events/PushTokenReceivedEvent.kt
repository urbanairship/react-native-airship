package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class PushTokenReceivedEvent(private val pushToken: String): Event {

    override val name = "com.airship.notification_opt_in_status"

    override val body: ReadableMap = Arguments.createMap().apply {
        putString("pushToken", pushToken)
    }

    override val isForeground = true
}
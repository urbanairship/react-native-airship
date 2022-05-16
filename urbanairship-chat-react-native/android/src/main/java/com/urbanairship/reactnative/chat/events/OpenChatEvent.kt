/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class OpenChatEvent(private val message: String?) : Event {

    override val name: String
        get() = OPEN_CHAT_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            message?.let {
                map.putString("message", message)
            }
            return map
        }

    override val isForeground: Boolean
        get() = false

    companion object {
        private const val OPEN_CHAT_EVENT = "com.urbanairship.open_chat"
    }
}
/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class OpenChatEvent(private val message: String?) : Event {

    override val name = OPEN_CHAT_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        message?.let {
            putString("message", it)
        }
    }

    override val isForeground = false

    companion object {
        private const val OPEN_CHAT_EVENT = "com.urbanairship.open_chat"
    }
}
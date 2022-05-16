/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class ConversationUpdatedEvent : Event {

    override val name: String
        get() = CONVERSATION_UPDATED_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putString("event", "Conversation updated")
            return map
        }

    override val isForeground: Boolean
        get() = true

    companion object {
        private const val CONVERSATION_UPDATED_EVENT = "com.urbanairship.conversation_updated"
    }
}
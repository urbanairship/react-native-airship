/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

class ConversationUpdatedEvent : Event {

    override val name = CONVERSATION_UPDATED_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putString("event", "Conversation updated")
    }

    override val isForeground = true

    companion object {
        private const val CONVERSATION_UPDATED_EVENT = "com.urbanairship.conversation_updated"
    }
}
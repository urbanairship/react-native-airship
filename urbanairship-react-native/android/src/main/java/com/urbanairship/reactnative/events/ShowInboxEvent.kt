/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Show inbox event.
 *
 * @param messageId The optional message ID.
 */
class ShowInboxEvent(private val messageId: String?) : Event {

    override val name: String
        get() = SHOW_INBOX_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putString(MESSAGE_ID, messageId)
            return map
        }
    override val isForeground: Boolean
        get() = true

    companion object {
        private const val SHOW_INBOX_EVENT = "com.urbanairship.show_inbox"
        private const val MESSAGE_ID = "messageId"
    }
}
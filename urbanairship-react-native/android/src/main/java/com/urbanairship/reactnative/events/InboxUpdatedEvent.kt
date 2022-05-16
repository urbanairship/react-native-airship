/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Inbox updated event.
 *
 * @param unreadCount The number of unread messages in the message center.
 * @param count The number of total messages in the message center.
 */
class InboxUpdatedEvent(private val unreadCount: Int, private val count: Int) : Event {

    override  val name: String
        get() = INBOX_UPDATED_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putInt(MESSAGE_UNREAD_COUNT, unreadCount)
            map.putInt(MESSAGE_COUNT, count)
            return map
        }

    override val isForeground: Boolean
        get() = true

    companion object {
        private const val INBOX_UPDATED_EVENT = "com.urbanairship.inbox_updated"
        private const val MESSAGE_UNREAD_COUNT = "messageUnreadCount"
        private const val MESSAGE_COUNT = "messageCount"
    }
}
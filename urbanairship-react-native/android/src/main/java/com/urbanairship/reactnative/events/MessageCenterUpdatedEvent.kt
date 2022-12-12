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
class MessageCenterUpdatedEvent(private val unreadCount: Int, private val count: Int) : Event {

    override  val name = INBOX_UPDATED_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putInt(MESSAGE_UNREAD_COUNT, unreadCount)
        putInt(MESSAGE_COUNT, count)
    }

    override val isForeground = true

    companion object {
        private const val INBOX_UPDATED_EVENT = "com.airship.message_center_updated"
        private const val MESSAGE_UNREAD_COUNT = "messageUnreadCount"
        private const val MESSAGE_COUNT = "messageCount"
    }
}
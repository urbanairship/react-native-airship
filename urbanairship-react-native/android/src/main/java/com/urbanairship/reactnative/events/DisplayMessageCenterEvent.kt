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
class DisplayMessageCenterEvent(private val messageId: String?) : Event {

    override val name = SHOW_INBOX_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putString(MESSAGE_ID, messageId)
    }

    override val isForeground = true

    companion object {
        private const val SHOW_INBOX_EVENT = "com.airship.display_message_center"
        private const val MESSAGE_ID = "messageId"
    }
}
/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.push.NotificationActionButtonInfo
import com.urbanairship.push.NotificationInfo
import com.urbanairship.reactnative.Event

/**
 * Notification response event.
 *
 * @param notificationInfo The notification info.
 * @param actionButtonInfo The notification action button info.
 */
class NotificationResponseEvent(
    private val notificationInfo: NotificationInfo,
    private val actionButtonInfo: NotificationActionButtonInfo? = null
) : Event {

    override val name = NOTIFICATION_RESPONSE_EVENT

    override val body: ReadableMap = Arguments.createMap().apply {
        putMap(RESPONSE_NOTIFICATION, PushReceivedEvent(notificationInfo).body)
        if (actionButtonInfo != null) {
            putString(RESPONSE_ACTION_ID, actionButtonInfo.buttonId)
            putBoolean(RESPONSE_FOREGROUND, actionButtonInfo.isForeground)
        } else {
            putBoolean(RESPONSE_FOREGROUND, true)
        }
    }

    override val isForeground = actionButtonInfo?.isForeground ?: true

    companion object {
        private const val NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response"
        private const val RESPONSE_ACTION_ID = "actionId"
        private const val RESPONSE_FOREGROUND = "isForeground"
        private const val RESPONSE_NOTIFICATION = "notification"
    }
}
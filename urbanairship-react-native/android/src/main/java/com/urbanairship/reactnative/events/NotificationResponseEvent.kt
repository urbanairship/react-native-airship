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

    override val name: String
        get() = NOTIFICATION_RESPONSE_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putMap(RESPONSE_NOTIFICATION, PushReceivedEvent(notificationInfo).body)
            if (actionButtonInfo != null) {
                map.putString(RESPONSE_ACTION_ID, actionButtonInfo.buttonId)
                map.putBoolean(RESPONSE_FOREGROUND, actionButtonInfo.isForeground)
            } else {
                map.putBoolean(RESPONSE_FOREGROUND, true)
            }
            return map
        }

    override val isForeground: Boolean
        get() = actionButtonInfo?.isForeground ?: true

    companion object {
        private const val NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response"
        private const val RESPONSE_ACTION_ID = "actionId"
        private const val RESPONSE_FOREGROUND = "isForeground"
        private const val RESPONSE_NOTIFICATION = "notification"
    }
}
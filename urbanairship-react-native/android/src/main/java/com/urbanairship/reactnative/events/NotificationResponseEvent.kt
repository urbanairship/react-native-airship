/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.push.NotificationActionButtonInfo
import com.urbanairship.push.NotificationInfo
import com.urbanairship.reactnative.Event
import com.urbanairship.reactnative.Utils

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

    override val name = "com.airship.notification_response"

    override val body: ReadableMap = Arguments.createMap().apply {
        putMap("pushPayload", Utils.pushPayload(notificationInfo))
        if (actionButtonInfo != null) {
            putString("actionId", actionButtonInfo.buttonId)
            putBoolean("isForeground", actionButtonInfo.isForeground)
        } else {
            putBoolean("isForeground", true)
        }
    }

    override val isForeground = actionButtonInfo?.isForeground ?: true

}
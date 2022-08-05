/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import android.os.Bundle
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.push.NotificationInfo
import com.urbanairship.push.PushMessage
import com.urbanairship.reactnative.Event
import com.urbanairship.util.UAStringUtil

/**
 * Push received event.
 */
class PushReceivedEvent : Event {
    private val message: PushMessage
    private var notificationId: Int? = null
    private var notificationTag: String? = null

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    constructor(message: PushMessage) {
        this.message = message
    }

    /**
     * Default constructor.
     *
     * @param notificationInfo The posted notification info.
     */
    constructor(notificationInfo: NotificationInfo) {
        message = notificationInfo.message
        notificationId = notificationInfo.notificationId
        notificationTag = notificationInfo.notificationTag
    }

    /**
     * Default constructor.
     *
     * @param message The push message.
     */
    constructor(message: PushMessage, notificationId: Int, notificationTag: String?) {
        this.message = message
        this.notificationId = notificationId
        this.notificationTag = notificationTag
    }

    override val name = PUSH_RECEIVED_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            message.alert?.let {
                map.putString(PUSH_ALERT, it)
            }
            message.title?.let {
                map.putString(PUSH_TITLE, it)
            }
            notificationId?.let {
                map.putString(NOTIFICATION_ID, getNotificationId(it, notificationTag))
            }
            val bundle = Bundle(message.pushBundle)
            bundle.remove(PUSH_WAKE_LOCK_ID)
            map.putMap(PUSH_EXTRAS, Arguments.fromBundle(bundle))
            return map
        }

    override val isForeground = false

    companion object {
        private const val PUSH_RECEIVED_EVENT = "com.urbanairship.push_received"
        private const val PUSH_ALERT = "alert"
        private const val PUSH_TITLE = "title"
        private const val PUSH_EXTRAS = "extras"
        private const val NOTIFICATION_ID = "notificationId"
        private const val PUSH_WAKE_LOCK_ID = "android.support.content.wakelockid"

        private fun getNotificationId(notificationId: Int, notificationTag: String?): String {
            var id = notificationId.toString()
            if (!UAStringUtil.isEmpty(notificationTag)) {
                id += ":$notificationTag"
            }
            return id
        }
    }
}
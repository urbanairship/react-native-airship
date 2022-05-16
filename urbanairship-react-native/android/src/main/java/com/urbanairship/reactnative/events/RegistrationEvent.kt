/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.urbanairship.reactnative.Event

/**
 * Registration event.
 *
 * @param channelId The channel ID.
 * @param registrationToken The registration token.
 */
class RegistrationEvent(private val channelId: String, private val registrationToken: String?) : Event {

    override val name: String
        get() = CHANNEL_REGISTRATION_EVENT

    override val body: ReadableMap
        get() {
            val map = Arguments.createMap()
            map.putString(CHANNEL_ID, channelId)
            registrationToken?.let {
                map.putString(REGISTRATION_TOKEN, it)
            }
            return map
        }

    override val isForeground: Boolean
        get() = true

    companion object {
        private const val CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration"
        private const val CHANNEL_ID = "channelId"
        private const val REGISTRATION_TOKEN = "registrationToken"
    }
}
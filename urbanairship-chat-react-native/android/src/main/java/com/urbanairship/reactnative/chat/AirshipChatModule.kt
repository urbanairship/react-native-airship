/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.urbanairship.UAirship
import com.urbanairship.chat.Chat
import com.urbanairship.chat.Chat.OnShowChatListener
import com.urbanairship.chat.ChatDirection
import com.urbanairship.chat.ChatMessage
import com.urbanairship.chat.ConversationListener
import com.urbanairship.reactnative.Event
import com.urbanairship.reactnative.EventEmitter
import com.urbanairship.reactnative.ReactAirshipPreferences
import com.urbanairship.reactnative.Utils
import com.urbanairship.reactnative.chat.events.ConversationUpdatedEvent
import com.urbanairship.reactnative.chat.events.OpenChatEvent

class AirshipChatModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val preferences: ReactAirshipPreferences by lazy { ReactAirshipPreferences.shared(reactContext) }

    init {
        UAirship.shared {
            Chat.shared().openChatListener = object : OnShowChatListener {
                override fun onOpenChat(message: String?): Boolean {
                    return if (preferences.isAutoLaunchChatEnabled) {
                        false
                    } else {
                        val event: Event = OpenChatEvent(message)
                        EventEmitter.shared().sendEvent(event)
                        true
                    }
                }
            }
            Chat.shared().conversation.addConversationListener(object : ConversationListener {
                override fun onConversationUpdated() {
                    val event: Event = ConversationUpdatedEvent()
                    EventEmitter.shared().sendEvent(event)
                }
            })
        }
    }

    override fun getName(): String {
        return "AirshipChatModule"
    }

    @ReactMethod
    fun setUseCustomChatUI(useCustomUI: Boolean) {
        preferences.setAutoLaunchChat(!useCustomUI)
    }

    @ReactMethod
    fun connect() {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        Chat.shared().conversation.connect()
    }

    @ReactMethod
    fun openChat() {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        Chat.shared().openChat()
    }

    @ReactMethod
    fun sendMessage(message: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        Chat.shared().conversation.sendMessage(message)
    }

    @ReactMethod
    fun sendMessageWithAttachment(message: String?, attachmentUrl: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        Chat.shared().conversation.sendMessage(message, attachmentUrl)
    }

    @ReactMethod
    fun getMessages(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        Chat.shared().conversation.getMessages().addResultCallback { result: List<ChatMessage>? ->
            val messagesArray = Arguments.createArray()

            result?.let {
                for ((messageId, text, createdOn, direction, attachmentUrl, pending) in it) {
                    val messageMap: WritableMap = WritableNativeMap()
                    messageMap.putString("messageId", messageId)
                    messageMap.putString("text", text)
                    messageMap.putDouble("createdOn", createdOn.toDouble())
                    if (direction == ChatDirection.OUTGOING) {
                        messageMap.putInt("direction", 0)
                    } else {
                        messageMap.putInt("direction", 1)
                    }
                    messageMap.putString("attachmentUrl", attachmentUrl)
                    messageMap.putBoolean("pending", pending)
                    messagesArray.pushMap(messageMap)
                }
            }
            promise.resolve(messagesArray)
        }
    }
}

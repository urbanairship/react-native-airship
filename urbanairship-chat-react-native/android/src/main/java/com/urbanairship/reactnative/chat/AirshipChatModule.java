/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.urbanairship.UAirship;
import com.urbanairship.chat.Chat;
import com.urbanairship.chat.ChatDirection;
import com.urbanairship.chat.ChatMessage;
import com.urbanairship.reactnative.Event;
import com.urbanairship.reactnative.EventEmitter;
import com.urbanairship.reactnative.ReactAirshipPreferences;
import com.urbanairship.reactnative.Utils;
import com.urbanairship.reactnative.chat.events.ConversationUpdatedEvent;
import com.urbanairship.reactnative.chat.events.OpenChatEvent;

public class AirshipChatModule extends ReactContextBaseJavaModule {
    public final ReactAirshipPreferences preferences;


    public AirshipChatModule(ReactApplicationContext reactContext) {
        super(reactContext);
        preferences = ReactAirshipPreferences.shared(reactContext);

        UAirship.shared(airship -> {
            Chat.shared().setOpenChatListener(message -> {

                if (preferences.isAutoLaunchChatEnabled()) {
                    return false;
                } else {
                    Event event = new OpenChatEvent(message);
                    EventEmitter.shared().sendEvent(event);
                    return true;
                }
            });

            Chat.shared().getConversation().addConversationListener(() -> {
                Event event = new ConversationUpdatedEvent();
                EventEmitter.shared().sendEvent(event);
            });
        });
    }

    @Override
    public String getName() {
        return "AirshipChatModule";
    }

    @ReactMethod
    public void setUseCustomChatUI(boolean useCustomUI) {
        preferences.setAutoLaunchChat(!useCustomUI);
    }

    @ReactMethod
    public void connect() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Chat.shared().getConversation().connect();
    }

    @ReactMethod
    public void openChat() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Chat.shared().openChat();
    }

    @ReactMethod
    public void sendMessage(String message) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Chat.shared().getConversation().sendMessage(message);
    }

    @ReactMethod
    public void sendMessageWithAttachment(String message, String attachmentUrl) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Chat.shared().getConversation().sendMessage(message, attachmentUrl);
    }

    @ReactMethod
    public void getMessages(final Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        Chat.shared().getConversation().getMessages().addResultCallback(result -> {
            WritableArray messagesArray = Arguments.createArray();

            if (result != null) {
                for (ChatMessage message : result) {
                    WritableMap messageMap = new WritableNativeMap();
                    messageMap.putString("messageId", message.getMessageId());
                    messageMap.putString("text", message.getText());
                    messageMap.putDouble("createdOn", message.getCreatedOn());
                    if (message.getDirection() == ChatDirection.OUTGOING) {
                        messageMap.putInt("direction", 0);
                    } else {
                        messageMap.putInt("direction", 1);
                    }
                    messageMap.putString("attachmentUrl", message.getAttachmentUrl());
                    messageMap.putBoolean("pending", message.getPending());
                    messagesArray.pushMap(messageMap);
                }
            }

            promise.resolve(messagesArray);
        });
    }
}

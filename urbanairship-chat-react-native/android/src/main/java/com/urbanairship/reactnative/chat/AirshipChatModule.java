/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.chat;

import android.util.Log;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableNativeMap;
import com.urbanairship.Logger;
import com.urbanairship.ResultCallback;
import com.urbanairship.UAirship;
import com.urbanairship.chat.Chat;
import com.urbanairship.chat.ChatDirection;
import com.urbanairship.chat.ChatMessage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.chat.ConversationListener;
import com.urbanairship.reactnative.Event;
import com.urbanairship.reactnative.chat.events.ConversationUpdatedEvent;
import com.urbanairship.reactnative.chat.events.OpenChatEvent;
import com.urbanairship.util.HelperActivity;
import com.urbanairship.reactnative.EventEmitter;

import java.util.ArrayList;
import java.util.List;

public class AirshipChatModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;
    List<ChatMessage> messagesList = new ArrayList<>();
    WritableArray messagesArray;
    boolean useCustomChatUI;

    public AirshipChatModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        addOpenChatListener();
    }

    @Override
    public String getName() {
        return "AirshipChatModule";
    }

    @ReactMethod
    private void addOpenChatListener() {
        Chat.shared().setOpenChatListener(new Chat.OnShowChatListener() {
            @Override
            public boolean onOpenChat(String message) {
                if (useCustomChatUI) {
                    Event event = new OpenChatEvent(message);
                    EventEmitter.shared().sendEvent(event);
                    return true;
                } else {
                    return false;
                }
            }
        });
    }

    @ReactMethod
    public void setUseCustomChatUI(boolean useCustomUI) {
        useCustomChatUI = useCustomUI;
    }

    @ReactMethod
    public void openChat() {
        Chat.shared().openChat();
    }

    @ReactMethod
    public void sendMessage(String message) {
        Chat.shared().getConversation().sendMessage(message);
    }

    @ReactMethod
    public void sendMessageWithAttachment(String message, String attachmentUrl) {
        Chat.shared().getConversation().sendMessage(message, attachmentUrl);
    }

    @ReactMethod
    public void getMessages(final Promise promise) {
        messagesArray = Arguments.createArray();

        Chat.shared().getConversation().getMessages().addResultCallback(new ResultCallback<List<ChatMessage>>() {
                        @Override
                        public void onResult(@Nullable List<ChatMessage> result) {
                            if (result != null) {
                                messagesList = result;
                            }

                            for (ChatMessage message : messagesList) {
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

                            promise.resolve(messagesArray);

                        }
        });
    }

    @ReactMethod
    public void addConversationListener() {
        Chat.shared().getConversation().addConversationListener(new ConversationListener() {
            @Override
            public void onConversationUpdated() {
                Event event = new ConversationUpdatedEvent();
                EventEmitter.shared().sendEvent(event);
            }
        });
    }
}

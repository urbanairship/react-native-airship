package com.urbanairship.reactnative.chat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.urbanairship.UAirship;
import com.urbanairship.chat.Chat;
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

public class AirshipChatModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AirshipChatModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AirshipChat";
    }

    //TODO : mettre les méthodes ici !!
    /**
    to get conversation list, send a message, 
    listen for message changes, and a way to show default list. 
    */

    @ReactMethod
    public void openChat() {
        Chat.shared().openChat();
    }

    @ReactMethod
    public void sendMessage(String message) {
        Chat.shared().getConversation().sendMessage(message);
    }

    @ReactMethod
    public void getMessages(Promise promise) {
        WritableArray messagesArray = Arguments.createArray();

        for (ChatMessage message : Chat.shared().getConversation().getMessages()) {
            WritableMap messageMap = new WritableNativeMap();
            messageMap.putString("messageId", message.getMessageId());
            messageMap.putString("text", message.getText());
            messageMap.putLong("createdOn", message.getCreatedOn());
            //Enum ? messageMap.put???("direction", message.getDirection());
            messageMap.putString("attachmentUrl", message.getAttachmentUrl());
            messageMap.putBoolean("pending", message.getPending());
        }
        
        messagesArray.pushMap(messageMap);
        promise.resolve(messagesArray);
    }

    public void addConversationListener() {
        
    }
}

package com.urbanairship.reactnative.chat.events;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.chat.ChatDirection;
import com.urbanairship.chat.ChatMessage;
import com.urbanairship.reactnative.Event;

public class OpenChatEvent implements Event {

    private static final String OPEN_CHAT_EVENT = "com.urbanairship.open_chat";
    private final String message;

    public OpenChatEvent(String message) {
        this.message = message;
    }

    @NonNull
    @Override
    public String getName() {
        return OPEN_CHAT_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();

        if (message != null) {
            map.putString("message", message);
        }
        return map;
    }

    @Override
    public boolean isForeground() {
        return false;
    }
}

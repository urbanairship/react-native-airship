package com.urbanairship.reactnative.chat.events;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.chat.Chat;
import com.urbanairship.chat.Conversation;
import com.urbanairship.reactnative.Event;

public class ConversationUpdatedEvent implements Event {

    private static final String CONVERSATION_UPDATED_EVENT = "com.urbanairship.conversation_updated";
    private static final String MESSAGE_COUNT = "messageCount";

    private final int count;

    /**
     * Default constructor.
     *
     * @param count The number of messages in the conversation.
     */
    public ConversationUpdatedEvent(int count) {
        this.count = count;
    }

    @NonNull
    @Override
    public String getName() {
        return CONVERSATION_UPDATED_EVENT;
    }

    @NonNull
    @Override
    public ReadableMap getBody() {
        WritableMap map = Arguments.createMap();
        map.putInt(MESSAGE_COUNT, count);

        return map;
    }

    @Override
    public boolean isForeground() {
        return true;
    }
}

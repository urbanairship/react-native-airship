/* Copyright Airship and Contributors */

package com.urbanairship.reactnative;


import androidx.annotation.Nullable;
import androidx.annotation.NonNull;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class ReactMessageViewManager extends SimpleViewManager<ReactMessageView> {

    @NonNull
    public static final String REACT_CLASS = "UARCTMessageView";

    @Override
    @NonNull
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected ReactMessageView createViewInstance(@NonNull ThemedReactContext reactContext) {
        ReactMessageView messageView = new ReactMessageView(reactContext);
        reactContext.addLifecycleEventListener(messageView);
        return messageView;
    }

    @Override
    public void onDropViewInstance(@NonNull ReactMessageView messageView) {
        super.onDropViewInstance(messageView);
        ((ThemedReactContext) messageView.getContext()).removeLifecycleEventListener(messageView);
        messageView.cleanup();
    }

    @ReactProp(name = "messageId")
    public void setMessageId(@NonNull ReactMessageView view, @Nullable String messageId) {
        view.loadMessage(messageId);
    }

    @Override
    @NonNull
    public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
        List<String> events = Arrays.asList(ReactMessageView.EVENT_CLOSE,
                ReactMessageView.EVENT_LOAD_ERROR,
                ReactMessageView.EVENT_LOAD_FINISHED,
                ReactMessageView.EVENT_LOAD_STARTED);

        MapBuilder.Builder<String, Object> builder = MapBuilder.builder();

        for (String event : events) {
            builder.put(event,
                    MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", event)));
        }

        return builder.build();
    }


}

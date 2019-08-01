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

    public static final String REACT_CLASS = "UARCTMessageView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected ReactMessageView createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new ReactMessageView(reactContext);
    }

    @ReactProp(name = "messageId")
    public void setMessageId(ReactMessageView view, @Nullable String messageId) {
        view.loadMessage(messageId);
    }

    public Map getExportedCustomBubblingEventTypeConstants() {
        List<String> events = Arrays.asList(ReactMessageView.EVENT_CLOSE,
                ReactMessageView.EVENT_LOAD_ERROR,
                ReactMessageView.EVENT_LOAD_FINISHED,
                ReactMessageView.EVENT_LOAD_STARTED);

        MapBuilder.Builder builder = MapBuilder.builder();

        for (String event : events) {
            builder.put(event,
                    MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", event)));
        }

        return builder.build();
    }


}

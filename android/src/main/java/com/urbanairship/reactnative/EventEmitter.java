/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import java.util.ArrayList;
import java.util.List;

/**
 * Emits events to listeners in the JS layer.
 */
class EventEmitter {

    private static EventEmitter sharedInstance = new EventEmitter();
    private final Object pendingEventsMonitor = new Object();
    private List<Event> pendingEvents = new ArrayList<>();

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    static EventEmitter shared() {
        return sharedInstance;
    }


    /**
     * Dispatch pending events (if any) to the JS layer
     */
    void dispatchEnqueuedEvents(@NonNull Context context) {
        List<Event> eventsToDispatch;
        synchronized (pendingEventsMonitor) {
            if (pendingEvents.isEmpty()) {
                return;
            }
            eventsToDispatch = pendingEvents;
            pendingEvents = new ArrayList<>();
        }
        for (Event event : eventsToDispatch) {
            sendEvent(context, event);
        }
    }

    /**
     * Sends an event to the JS layer.
     *
     * @param context The application context.
     * @param event   The event.
     */
    void sendEvent(Context context, Event event) {
        // Force the call to be on the main thread
        if (!tryEmit(context, event)) {
            synchronized (pendingEventsMonitor) {
                pendingEvents.add(event);
            }
        }
    }

    private boolean tryEmit(Context context, Event event) {
        ReactInstanceManager reactInstanceManager = getReactInstanceManager(context);
        if (reactInstanceManager == null) {
            return false;
        }

        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            if (reactContext.getNativeModule(UrbanAirshipReactModule.class).hasListeners()) {
                emit(reactContext, event.getName(), event.getBody());
                return true;
            }
        }
        return false;
    }


    /**
     * Helper method to emit data.
     *
     * @param reactContext The react context.
     * @param eventName The event name.
     * @param eventBody The event body.
     */
    private void emit(ReactContext reactContext, String eventName, Object eventBody) {
        reactContext.getJSModule(RCTNativeAppEventEmitter.class).emit(eventName, eventBody);
    }

    /**
     * Helper method to get the ReactInstanceManager.
     *
     * @param context The application context.
     * @return The ReactInstanceManager, or null if its unable to be retrieved.
     */
    static @Nullable ReactInstanceManager getReactInstanceManager(Context context) {
        return ((ReactApplication) context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
    }
}

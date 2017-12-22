/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.urbanairship.Logger;

import java.util.ArrayList;
import java.util.List;

/**
 * Emits events to listeners in the JS layer.
 */
class EventEmitter {

    private static EventEmitter sharedInstance = new EventEmitter();
    private ReactInstanceManager reactInstanceManager;
    private List<Event> pendingEvents = new ArrayList<>();
    private int listenerCount = 0;

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    static EventEmitter shared() {
        return sharedInstance;
    }

    /**
     * Increases the event listener count.
     * Sends any pending events.
     *
     * @param context The application context.
     */
    void increaseListenerCount(Context context) {
        listenerCount++;
        if (listenerCount > 0 && pendingEvents.size() > 0) {
            for (Event event : pendingEvents) {
                sendEvent(context, event);
            }
            pendingEvents.clear();
        }
    }

    /**
     * Decreases the event listener count.
     */
    void decreaseListenerCount() {
        listenerCount = Math.max(listenerCount - 1, 0);
    }

    /**
     * Sends an event to the JS layer.
     *
     * @param context The application context.
     * @param event   The event.
     */
    void sendEvent(Context context, final Event event) {
        // Force the call to be on the main thread
        if (Looper.getMainLooper() != Looper.myLooper()) {
            final Context applicationContext = context.getApplicationContext();
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    sendEvent(applicationContext, event);
                }
            });

            return;
        }

        if (listenerCount == 0) {
            pendingEvents.add(event);
            return;
        }

        final ReactInstanceManager reactInstanceManager = getReactInstanceManager(context);
        if (reactInstanceManager == null) {
            Logger.error("Unable to emit events. React Instance Manager is unavailable.");
            return;
        }

        ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
        if (reactContext != null && reactContext.hasActiveCatalystInstance()) {
            emit(reactContext, event.getName(), event.getBody());
        } else if (event.isCritical() || reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext reactContext) {
                    emit(reactContext, event.getName(), event.getBody());
                    reactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
        }
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
    @Nullable
    ReactInstanceManager getReactInstanceManager(Context context) {
        if (reactInstanceManager == null) {
            if (context.getApplicationContext() instanceof ReactApplication) {
                reactInstanceManager = ((ReactApplication) context.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
            }
        }

        return reactInstanceManager;
    }
}

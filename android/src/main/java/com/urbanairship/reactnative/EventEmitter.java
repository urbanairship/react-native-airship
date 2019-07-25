/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.MainThread;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


/**
 * Emits events to listeners in the JS layer.
 */
class EventEmitter {

    private static EventEmitter sharedInstance = new EventEmitter();

    private final List<Event> pendingEvents = new ArrayList<>();
    private final Set<String> knownListeners = new HashSet<>();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private long listenerCount;
    private ReactContext reactContext;

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    static EventEmitter shared() {
        return sharedInstance;
    }

    /**
     * Attaches the react context.
     *
     * @param reactContext The react context.
     */
    void attachReactContext(final ReactContext reactContext) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                EventEmitter.this.reactContext = reactContext;
                sendPendingEvents();
            }
        });
    }

    /**
     * Sends an event to the JS layer.
     *
     * @param event The event.
     */
    void sendEvent(final Event event) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                synchronized (knownListeners) {
                    if (!knownListeners.contains(event.getName()) || !emit(event)) {
                        pendingEvents.add(event);
                    }
                }
            }
        });
    }

    /**
     * Called when a new listener is added for a specified event name.
     *
     * @param eventName The event name.
     */
    void addAndroidListener(String eventName) {
        synchronized (knownListeners) {
            listenerCount++;
            knownListeners.add(eventName);
        }

        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                sendPendingEvents();
            }
        });
    }

    /**
     * Called when listeners are removed.
     *
     * @param count The count of listeners.
     */
    void removeAndroidListeners(int count) {
        synchronized (knownListeners) {
            listenerCount -= count;
            if (listenerCount <= 0) {
                listenerCount = 0;
                knownListeners.clear();
            }
        }
    }

    /**
     * Attempts to send pending events.
     */
    @MainThread
    private void sendPendingEvents() {
        synchronized (knownListeners) {
            for (Event event : new ArrayList<>(pendingEvents)) {
                if (knownListeners.contains(event.getName())) {
                    // Remove the event first before attempting to send. If it fails to
                    // send it will get added back to pendingEvents.
                    pendingEvents.remove(event);
                    sendEvent(event);
                }
            }
        }
    }

    /**
     * Helper method to emit data.
     *
     * @param event The event.
     * @return {@code true} if the event was emitted, otherwise {@code false}.
     */
    @MainThread
    private boolean emit(final Event event) {
        ReactContext reactContext = this.reactContext;
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return false;
        }

        try {
            reactContext.getJSModule(RCTNativeAppEventEmitter.class).emit(event.getName(), event.getBody());
        } catch (Exception e) {
            Log.d("UrbanAirshipReactModule", "Failed to emit event", e);
            return false;
        }

        return true;
    }

}

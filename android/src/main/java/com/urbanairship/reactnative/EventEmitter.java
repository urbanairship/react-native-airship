/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.MainThread;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.urbanairship.Logger;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static java.lang.Math.max;


/**
 * Emits events to listeners in the JS layer.
 */
class EventEmitter {

    private static EventEmitter sharedInstance;

    private final List<Event> pendingEvents = new ArrayList<>();
    private final Set<String> knownListeners = new HashSet<>();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Context context;

    private long listenerCount;
    private ReactContext reactContext;

    private EventEmitter(Context context) {
        this.context = context.getApplicationContext();
    }

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    static EventEmitter shared(Context context) {
        if (sharedInstance == null) {
            synchronized (EventEmitter.class) {
                if (sharedInstance == null) {
                    sharedInstance = new EventEmitter(context);
                }
            }
        }

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
                    pendingEvents.remove(event);
                    // Send event will add the event back as pending
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
        if (reactContext == null || reactContext.hasActiveCatalystInstance()) {
            return false;
        }

        try {
            reactContext.getJSModule(RCTNativeAppEventEmitter.class).emit(event.getName(), event.getBody());
        } catch (Exception e) {
            Logger.info("UrbanAirshipReactModule - Failed to emit event", e);
            return false;
        }

        return true;
    }

}

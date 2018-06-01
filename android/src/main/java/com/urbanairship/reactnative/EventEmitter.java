/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
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


    private long listenerCount;
    private List<Event> pendingEvents = new ArrayList<>();
    private Set<String> knownListeners = new HashSet<>();

    private static EventEmitter sharedInstance = new EventEmitter();

    private ReactInstanceManager reactInstanceManager;
    private boolean isEnabled;

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    static EventEmitter shared() {
        return sharedInstance;
    }

    /**
     * Enables/disables the event emitter.
     *
     * @param context The application context.
     * @param isEnabled {@code true} to enable, {@code false} to disable.
     */
    void setEnabled(@NonNull Context context, boolean isEnabled) {
        if (this.isEnabled == isEnabled) {
            return;
        }

        this.isEnabled = isEnabled;
        synchronized (pendingEvents) {
            if (isEnabled) {
                for (Event event : pendingEvents) {
                    sendEvent(context, event);
                }

                pendingEvents.clear();
            }
        }
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
                    synchronized (knownListeners) {
                        if (knownListeners.contains(event.getName())) {
                            sendEvent(applicationContext, event);
                        } else {
                            pendingEvents.add(event);
                        }
                    }
                }
            });

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
        } else if (reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext reactContext) {
                    emit(reactContext, event.getName(), event.getBody());
                    reactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
        }
    }

    /**
     * Called when a new listener is added for a specified event name.
     *
     * @param eventName The event name.
     */
    void addAndroidListener(ReactContext reactContext, String eventName) {
        synchronized (knownListeners) {
            List<Event> pending = new ArrayList<>();
            pending.addAll(pendingEvents);

            for (Event event : pendingEvents) {
                if (event.equals(eventName)) {
                    sendEvent(reactContext, event);
                    pending.remove(event);
                }
            }

            pendingEvents.clear();
            pendingEvents.addAll(pending);

            listenerCount++;
            knownListeners.add(eventName);
        }
    }

    /**
     * Called when listeners are removed.
     *
     * @param count The count of listeners.
     */
    void removeAndroidListeners(ReactContext reactContext, int count) {
        synchronized (knownListeners) {
            long currentCount = listenerCount;
            listenerCount = max(0, currentCount - count);

            if (listenerCount == 0) {
                setEnabled(reactContext, false);
                knownListeners.clear();
            }
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

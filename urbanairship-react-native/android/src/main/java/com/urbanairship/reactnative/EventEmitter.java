/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.os.Handler;
import android.os.Looper;

import androidx.annotation.NonNull;
import androidx.annotation.RestrictTo;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.urbanairship.UAirship;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;


/**
 * Emits events to listeners in the JS layer.
 */
public class EventEmitter {
    private static EventEmitter sharedInstance = new EventEmitter();

    private final List<Event> pendingForegroundEvents = new ArrayList<>();
    private final List<Event> pendingBackgroundEvents = new ArrayList<>();

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Object lock = new Object();
    private ReactContext reactContext;

    /**
     * Returns the shared {@link EventEmitter} instance.
     *
     * @return The shared {@link EventEmitter} instance.
     */
    public static EventEmitter shared() {
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
                synchronized (lock) {
                    if (!pendingForegroundEvents.isEmpty()) {
                        notifyPendingForegroundEvents();
                    }
                }
            }
        });
    }

    /**
     * Sends an event to the JS layer.
     *
     * @param event The event.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    public void sendEvent(final Event event) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                synchronized (lock) {
                    if (event.isForeground()) {
                        pendingForegroundEvents.add(event);
                        notifyPendingForegroundEvents();
                    } else {
                        pendingBackgroundEvents.add(event);
                        AirshipHeadlessEventService.startService(UAirship.getApplicationContext());
                    }
                }
            }
        });
    }

    /**
     * Removes and returns foreground events for the given type.
     * @param type The type.
     * @return A list of events.
     */
    @NonNull
    List<Event> takePendingForegroundEvents(@NonNull String type) {
        synchronized (lock) {
            List<Event> filteredEvents = filter(pendingForegroundEvents, type);
            pendingForegroundEvents.removeAll(filteredEvents);
            return filteredEvents;
        }
    }

    /**
     * Removes and returns background events for the given type.
     * @param type The type.
     * @return A list of events.
     */
    @NonNull
    List<Event> takePendingBackgroundEvents(@NonNull String type) {
        synchronized (lock) {
            List<Event> filteredEvents = filter(pendingBackgroundEvents, type);
            pendingBackgroundEvents.removeAll(filteredEvents);
            return filteredEvents;
        }
    }

    /**
     * Called when the host is resumed.
     */
    void onHostResume() {
        synchronized (lock) {
            if (!pendingBackgroundEvents.isEmpty()) {
                AirshipHeadlessEventService.startService(UAirship.getApplicationContext());
            }

            if (!pendingForegroundEvents.isEmpty()) {
                notifyPendingForegroundEvents();
            }
        }
    }

    /**
     * Called when an app listener is listening for an airship event.
     *
     * If any events are pending for that listener type it will trigger either
     * a headless JS service or a dispatch to the event emitter.
     *
     * @param listener The listener.
     */
    void onAirshipListenerAdded(@NonNull final String listener) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                synchronized (lock) {
                    if (contains(pendingBackgroundEvents, listener)) {
                        AirshipHeadlessEventService.startService(UAirship.getApplicationContext());
                    }

                    if (contains(pendingForegroundEvents, listener)) {
                        notifyPendingForegroundEvents();
                    }
                }
            }
        });
    }

    private void notifyPendingForegroundEvents() {
        ReactContext reactContext = this.reactContext;
        if (reactContext == null || !reactContext.hasActiveCatalystInstance()) {
            return;
        }

        try {
            reactContext.getJSModule(RCTNativeAppEventEmitter.class).emit("com.urbanairship.onPendingForegroundEvent", null);
        } catch (Exception e) {
            PluginLogger.error("UrbanAirshipReactModule - Failed to emit event", e);
        }
    }

    private static List<Event> filter(List<Event> events, String eventType) {
        List<Event> filtered = new ArrayList<>();
        for (Event event : events) {
            if (eventType.equals(event.getName())) {
                filtered.add(event);
            }
        }
        return filtered;
    }

    private static boolean contains(List<Event> events, String eventType) {
        for (Event event : events) {
            if (eventType.equals(event.getName())) {
                return true;
            }
        }
        return false;
    }
}

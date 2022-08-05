/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.os.Handler
import android.os.Looper
import androidx.annotation.RestrictTo
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import java.lang.Exception

/**
 * Emits events to listeners in the JS layer.
 */
class EventEmitter {

    private val pendingForegroundEvents: MutableList<Event> = ArrayList()
    private val pendingBackgroundEvents: MutableList<Event> = ArrayList()

    private val mainHandler = Handler(Looper.getMainLooper())
    private val lock = Any()

    private var reactContext: ReactContext? = null

    /**
     * Attaches the react context.
     *
     * @param reactContext The react context.
     */
    fun attachReactContext(reactContext: ReactContext) {
        mainHandler.post {
            this.reactContext = reactContext
            synchronized(lock) {
                if (pendingForegroundEvents.isNotEmpty()) {
                    notifyPendingForegroundEvents()
                }
            }
        }
    }

    /**
     * Sends an event to the JS layer.
     *
     * @param event The event.
     */
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    fun sendEvent(event: Event) {
        mainHandler.post {
            synchronized(lock) {
                if (event.isForeground) {
                    pendingForegroundEvents.add(event)
                    notifyPendingForegroundEvents()
                } else {
                    pendingBackgroundEvents.add(event)
                    reactContext?.let {
                        AirshipHeadlessEventService.startService(it.applicationContext)
                    }
                }
            }
        }
    }

    /**
     * Removes and returns foreground events for the given type.
     * @param type The type.
     * @return A list of events.
     */
    fun takePendingForegroundEvents(type: String): List<Event> {
        synchronized(lock) {
            val filteredEvents = filter(pendingForegroundEvents, type)
            pendingForegroundEvents.removeAll(filteredEvents)
            return filteredEvents
        }
    }

    /**
     * Removes and returns background events for the given type.
     * @param type The type.
     * @return A list of events.
     */
    fun takePendingBackgroundEvents(type: String): List<Event> {
        synchronized(lock) {
            val filteredEvents = filter(pendingBackgroundEvents, type)
            pendingBackgroundEvents.removeAll(filteredEvents)
            return filteredEvents
        }
    }

    /**
     * Called when the host is resumed.
     */
    fun onHostResume() {
        synchronized(lock) {
            if (pendingBackgroundEvents.isNotEmpty()) {
                reactContext?.let {
                    AirshipHeadlessEventService.startService(it.applicationContext)
                }
            }

            if (pendingForegroundEvents.isNotEmpty()) {
                notifyPendingForegroundEvents()
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
    fun onAirshipListenerAdded(listener: String) {
        mainHandler.post {
            synchronized(lock) {
                if (contains(pendingBackgroundEvents, listener)) {
                    reactContext?.let {
                        AirshipHeadlessEventService.startService(it.applicationContext)
                    }
                }

                if (contains(pendingForegroundEvents, listener)) {
                    notifyPendingForegroundEvents()
                }
            }
        }
    }

    private fun notifyPendingForegroundEvents() {
        reactContext?.let {
            if (!it.hasActiveCatalystInstance()) {
                return
            }
            try {
                it.getJSModule(RCTNativeAppEventEmitter::class.java)
                    .emit("com.urbanairship.onPendingForegroundEvent", null)
            } catch (e: Exception) {
                PluginLogger.error("UrbanAirshipReactModule - Failed to emit event", e)
            }
        }
    }

    companion object {
        private val sharedInstance = EventEmitter()

        /**
         * Returns the shared {@link EventEmitter} instance.
         *
         * @return The shared {@link EventEmitter} instance.
         */
        @JvmStatic
        fun shared(): EventEmitter {
            return sharedInstance
        }

        private fun filter(events: List<Event>, eventType: String): List<Event> {
            val filtered : MutableList<Event> = ArrayList()
            for (event in events) {
                if (eventType == event.name) {
                    filtered.add(event)
                }
            }
            return filtered
        }

        private fun contains(events: List<Event>, eventType: String): Boolean {
            for (event in events) {
                if (eventType == event.name) {
                    return true
                }
            }
            return false
        }
    }
}
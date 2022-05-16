/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter

import android.annotation.SuppressLint
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.urbanairship.PendingResult
import com.urbanairship.UAirship
import com.urbanairship.json.JsonValue
import com.urbanairship.preferencecenter.PreferenceCenter
import com.urbanairship.preferencecenter.PreferenceCenter.OnOpenListener
import com.urbanairship.reactive.Observable
import com.urbanairship.reactive.Subscriber
import com.urbanairship.reactnative.Event
import com.urbanairship.reactnative.EventEmitter
import com.urbanairship.reactnative.ReactAirshipPreferences
import com.urbanairship.reactnative.Utils
import com.urbanairship.reactnative.preferenceCenter.events.OpenPreferenceCenterEvent
import com.urbanairship.remotedata.RemoteDataPayload

@ReactModule(name = AirshipPreferenceCenterModule.NAME)
class AirshipPreferenceCenterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val preferences: ReactAirshipPreferences by lazy { ReactAirshipPreferences.shared(reactContext) }

    init {
        UAirship.shared {
            PreferenceCenter.shared().openListener = OnOpenListener { preferenceCenterId: String ->
                    if (preferences.isAutoLaunchPreferenceCenterEnabled(preferenceCenterId)) {
                        return@OnOpenListener false
                    } else {
                        val event: Event = OpenPreferenceCenterEvent(preferenceCenterId)
                        EventEmitter.shared().sendEvent(event)
                        return@OnOpenListener true
                    }
                }
        }
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun open(preferenceCenterId: String) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        PreferenceCenter.shared().open(preferenceCenterId)
    }

    @ReactMethod
    fun getConfiguration(preferenceCenterId: String, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }

        PreferenceCenter.shared().getJsonConfig(preferenceCenterId).addResultCallback { result: JsonValue? ->
            if (result == null) {
                promise.reject(Exception("Failed to get preference center configuration."))
                return@addResultCallback
            }
            promise.resolve(Utils.convertJsonValue(result))
        }
    }

    @ReactMethod
    fun setUseCustomPreferenceCenterUi(useCustomUI: Boolean, preferenceID: String) {
        preferences.setAutoLaunchPreferenceCenter(preferenceID, !useCustomUI)
    }

    companion object {
        const val NAME = "AirshipPreferenceCenterModule"
    }
}

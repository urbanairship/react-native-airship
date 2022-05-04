/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.urbanairship.UAirship;
import com.urbanairship.preferencecenter.PreferenceCenter;
import com.urbanairship.reactnative.Event;
import com.urbanairship.reactnative.EventEmitter;
import com.urbanairship.reactnative.ReactAirshipPreferences;
import com.urbanairship.reactnative.Utils;
import com.urbanairship.reactnative.preferenceCenter.events.OpenPreferenceCenterEvent;

@ReactModule(name = AirshipPreferenceCenterModule.NAME)
public class AirshipPreferenceCenterModule extends ReactContextBaseJavaModule {

    public static final String NAME = "AirshipPreferenceCenterModule";
    public final ReactAirshipPreferences preferences;

    public AirshipPreferenceCenterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        preferences = ReactAirshipPreferences.shared(reactContext);
        UAirship.shared(airship -> {
            PreferenceCenter.shared().setOpenListener(preferenceCenterId -> {
                if (preferences.isAutoLaunchPreferenceCenterEnabled(preferenceCenterId)) {
                    return false;
                } else {
                    Event event = new OpenPreferenceCenterEvent(preferenceCenterId);
                    EventEmitter.shared().sendEvent(event);
                    return true;
                }
            });
        });
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }

    @ReactMethod
    public void open(String preferenceCenterId) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        PreferenceCenter.shared().open(preferenceCenterId);
    }

    @ReactMethod
    public void getConfiguration(String preferenceCenterId, final Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        PreferenceCenter.shared().getJsonConfig(preferenceCenterId).addResultCallback(result -> {
            if (result == null) {
                promise.reject(new Exception("Failed to get preference center configuration."));
                return;
            }

            promise.resolve(Utils.convertJsonValue(result));
        });
    }

    @ReactMethod
    public void setUseCustomPreferenceCenterUi(boolean useCustomUI, String preferenceID) {
        preferences.setAutoLaunchPreferenceCenter(preferenceID, !useCustomUI);
    }
}

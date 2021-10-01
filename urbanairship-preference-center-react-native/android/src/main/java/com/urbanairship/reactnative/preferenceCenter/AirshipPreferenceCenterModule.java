/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative.preferenceCenter;

import androidx.annotation.NonNull;

import android.preference.PreferenceManager;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;
import com.urbanairship.preferencecenter.PreferenceCenter;
import com.urbanairship.UAirship;

@ReactModule(name = AirshipPreferenceCenterModule.NAME)
public class AirshipPreferenceCenterModule extends ReactContextBaseJavaModule {
    public static final String NAME = "UrbanairshipPreferenceCenterReactNative";

    public AirshipPreferenceCenterModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    @NonNull
    public String getName() {
        return NAME;
    }


    @ReactMethod
    public void open(String preferenceID) {
      PreferenceCenter.shared().open(preferenceID);
    }

    @ReactMethod
    public void setUseCustomPreferenceCenterUI(boolean useCustomUI, String preferenceID) {
      PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext())
      .edit()
      .putBoolean(preferenceID, useCustomUI)
      .apply();
    }

}

/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.urbanairship.UAirship;

public class UrbanAirshipReactModule extends ReactContextBaseJavaModule {


    public UrbanAirshipReactModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "UrbanAirshipReactModule";
    }

    @ReactMethod
    public void setUserNotificationsEnabled(boolean enabled) {
        UAirship.shared().getPushManager().setUserNotificationsEnabled(enabled);
    }

    @ReactMethod
    public void isUserNotificationsEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getUserNotificationsEnabled());
    }


}

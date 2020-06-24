package com.urbanairship.reactnative.hms;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;

public class AirshipHMSModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AirshipHMSModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AirshipHMS";
    }

}

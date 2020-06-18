package com.urbanairship.reactnative.location;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;

import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.urbanairship.location.AirshipLocationManager;
import com.facebook.react.bridge.Promise;

public class AirshipLocationReactModule extends ReactContextBaseJavaModule {

    private final ReactApplicationContext reactContext;

    public AirshipLocationReactModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "AirshipLocation";
    }

    /**
     * Enables/Disables location updates.
     *
     * @param enabled {@code true} to enable location updates, {@code false} to disable.
     */
    @ReactMethod
    public void setLocationEnabled(boolean enabled) {
        if (enabled && shouldRequestLocationPermissions()) {
            RequestPermissionsTask task = new RequestPermissionsTask(getReactApplicationContext(), new RequestPermissionsTask.Callback() {
                @Override
                public void onResult(boolean enabled) {
                    if (enabled) {
                        AirshipLocationManager.shared().setLocationUpdatesEnabled(true);
                    }
                }
            });
            task.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION);
        } else {
            AirshipLocationManager.shared().setLocationUpdatesEnabled(enabled);
        }
    }

    /**
     * Checks if location updates are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isLocationEnabled(Promise promise) {
        promise.resolve(AirshipLocationManager.shared().isLocationUpdatesEnabled());
    }

    /**
     * Allows/Disallows background location.
     *
     * @param enabled {@code true} to allow background location., {@code false} to disallow.
     */
    @ReactMethod
    public void setBackgroundLocationAllowed(boolean enabled) {
        AirshipLocationManager.shared().setBackgroundLocationAllowed(enabled);
    }

    /**
     * Checks if background location updates are allowed.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isBackgroundLocationAllowed(Promise promise) {
        promise.resolve(AirshipLocationManager.shared().isBackgroundLocationAllowed());
    }

    /**
     * Helper to determine if location permissions should be requested or not.
     *
     * @return {@code true} if permissions should be requested, otherwise {@code false}.
     */
    private boolean shouldRequestLocationPermissions() {
        if (Build.VERSION.SDK_INT < 23) {
            return false;
        }

        return ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_DENIED &&
                ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_DENIED;
    }
}

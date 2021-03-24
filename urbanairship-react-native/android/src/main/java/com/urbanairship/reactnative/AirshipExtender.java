package com.urbanairship.reactnative;

import android.content.Context;

import androidx.annotation.NonNull;

import com.urbanairship.UAirship;

/**
 * Extender that will be called during takeOff to customize the airship instance.
 * Register the extender fully qualified class name in the manifest under the key
 * `com.urbanairship.reactnative.AIRSHIP_EXTENDER`.
 */
public interface AirshipExtender {
    void onAirshipReady(@NonNull Context context, @NonNull UAirship airship);
}

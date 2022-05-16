/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import com.urbanairship.UAirship

/**
 * Extender that will be called during takeOff to customize the airship instance.
 * Register the extender fully qualified class name in the manifest under the key
 * `com.urbanairship.reactnative.AIRSHIP_EXTENDER`.
 */
interface AirshipExtender {
    fun onAirshipReady(context: Context, airship: UAirship)
}
/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import com.urbanairship.AirshipConfigOptions
import com.urbanairship.android.framework.proxy.BaseNotificationProvider

/**
 * React Native notification provider.
 */
// Empty to prevent breaking existing integrations
open class ReactNotificationProvider(context: Context, configOptions: AirshipConfigOptions)
    : BaseNotificationProvider(context, configOptions) {
}
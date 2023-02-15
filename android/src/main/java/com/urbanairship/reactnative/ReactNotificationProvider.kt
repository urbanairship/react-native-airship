/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import com.facebook.react.module.annotations.ReactModule
import com.urbanairship.AirshipConfigOptions
import com.urbanairship.android.framework.proxy.BaseNotificationProvider
import com.urbanairship.push.notifications.NotificationArguments
import com.urbanairship.push.notifications.NotificationResult
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.runBlocking

/**
 * React Native notification provider.
 */
// Empty to prevent breaking existing integrations
open class ReactNotificationProvider(context: Context, configOptions: AirshipConfigOptions)
    : BaseNotificationProvider(context, configOptions) {
}
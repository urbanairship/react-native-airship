/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import androidx.annotation.ColorInt
import androidx.annotation.DrawableRes
import com.urbanairship.AirshipConfigOptions
import com.urbanairship.push.notifications.AirshipNotificationProvider

open class ReactNotificationProvider(private val context: Context, configOptions: AirshipConfigOptions) : AirshipNotificationProvider(context, configOptions) {

    private val preferences: ReactAirshipPreferences by lazy {
        ReactAirshipPreferences.shared(context)
    }

    override fun getDefaultNotificationChannelId(): String {
        return preferences.defaultNotificationChannelId ?: super.getDefaultNotificationChannelId()
    }

    @DrawableRes
    override fun getSmallIcon(): Int {
        val iconResourceName: String? = preferences.notificationIcon

        iconResourceName?.let {
            val id = Utils.getNamedResource(context, it, "drawable")
            if (id > 0) {
                return id
            }
        }
        return super.getSmallIcon()
    }

    @DrawableRes
    override fun getLargeIcon(): Int {
        val largeIconResourceName: String? = preferences.notificationLargeIcon

        largeIconResourceName?.let {
            val id = Utils.getNamedResource(context, it, "drawable")
            if (id > 0) {
                return id
            }
        }
        return super.getLargeIcon()
    }

    @ColorInt
    override fun getDefaultAccentColor(): Int {
        val accentHexColor: String? = preferences.notificationAccentColor

        return if (accentHexColor != null) {
            Utils.getHexColor(accentHexColor, super.getDefaultAccentColor())
        } else {
            super.getDefaultAccentColor()
        }
    }

}
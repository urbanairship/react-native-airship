/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.os.Bundle;

import androidx.annotation.ColorInt;
import androidx.annotation.DrawableRes;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.push.notifications.AirshipNotificationProvider;
import com.urbanairship.push.notifications.NotificationArguments;

public class ReactNotificationProvider extends AirshipNotificationProvider {

    private final Context context;
    private final ReactAirshipPreferences preferences;

    public ReactNotificationProvider(@NonNull Context context, @NonNull AirshipConfigOptions configOptions) {
        super(context, configOptions);
        this.context = context;
        this.preferences = ReactAirshipPreferences.shared(context);
    }

    @NonNull
    @Override
    protected NotificationCompat.Builder onExtendBuilder(@NonNull Context context, @NonNull NotificationCompat.Builder builder, @NonNull NotificationArguments arguments) {
        Bundle extras = new Bundle();
        extras.putBundle(UrbanAirshipReactModule.AIRSHIP_PUSH_MESSAGE, arguments.getMessage().getPushBundle());
        builder.setExtras(extras);
        return super.onExtendBuilder(context, builder, arguments);
    }

    @Override
    @NonNull
    public String getDefaultNotificationChannelId() {
        String defaultChannelId = preferences.getDefaultNotificationChannelId();
        if (defaultChannelId != null) {
            return defaultChannelId;
        }

        return super.getDefaultNotificationChannelId();
    }

    @Override
    @DrawableRes
    public int getSmallIcon() {
        String iconResourceName = preferences.getNotificationIcon();
        if (iconResourceName != null) {
            int id = Utils.getNamedResource(context, iconResourceName, "drawable");
            if (id > 0) {
                return id;
            }
        }

        return super.getSmallIcon();
    }

    @Override
    @DrawableRes
    public int getLargeIcon() {
        String largeIconResourceName = preferences.getNotificationLargeIcon();

        if (largeIconResourceName != null) {
            int id = Utils.getNamedResource(context, largeIconResourceName, "drawable");
            if (id > 0) {
                return id;
            }
        }

        return super.getLargeIcon();
    }

    @Override
    @ColorInt
    public int getDefaultAccentColor() {
        String accentHexColor = preferences.getNotificationAccentColor();
        if (accentHexColor != null) {
            return Utils.getHexColor(accentHexColor, super.getDefaultAccentColor());
        }
        return super.getDefaultAccentColor();
    }
}

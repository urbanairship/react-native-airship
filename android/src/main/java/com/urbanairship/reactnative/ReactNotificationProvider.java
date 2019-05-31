/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.support.annotation.NonNull;
import android.support.annotation.WorkerThread;
import android.support.v4.app.NotificationCompat;

import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.push.notifications.AirshipNotificationProvider;
import com.urbanairship.push.notifications.NotificationArguments;

public class ReactNotificationProvider extends AirshipNotificationProvider {

    private Context context;

    public ReactNotificationProvider(@NonNull Context context, @NonNull AirshipConfigOptions configOptions) {
        super(context, configOptions);
        this.context = context;
    }

    @Override
    @NonNull
    public String getDefaultNotificationChannelId() {
        String defaultChannelId = ReactAirshipPreferences.shared().getDefaultNotificationChannelId(context);
        return defaultChannelId != null ? defaultChannelId : super.getDefaultNotificationChannelId();
    }

    @WorkerThread
    @NonNull
    @Override
    protected NotificationCompat.Builder onExtendBuilder(@NonNull Context context,
                                                         @NonNull NotificationCompat.Builder builder,
                                                         @NonNull NotificationArguments arguments) {

        builder.getExtras().putBundle("push_message", arguments.getMessage().getPushBundle());

        String iconResourceName = ReactAirshipPreferences.shared().getNotificationIcon(context);
        String largeIconResourceName = ReactAirshipPreferences.shared().getNotificationLargeIcon(context);
        String accentHexColor = ReactAirshipPreferences.shared().getNotificationAccentColor(context);

        if (iconResourceName != null) {
            int id = Utils.getNamedResource(context, iconResourceName, "drawable");
            if (id > 0) {
                builder.setSmallIcon(id);
            }
        }

        if (largeIconResourceName != null) {
            int id = Utils.getNamedResource(context, largeIconResourceName, "drawable");
            if (id > 0) {
                builder.setLargeIcon(BitmapFactory.decodeResource(context.getResources(), id));
            }
        }

        if (accentHexColor != null) {
            builder.setColor(Utils.getHexColor(accentHexColor, Color.GRAY));
        }

        return builder;
    }
}

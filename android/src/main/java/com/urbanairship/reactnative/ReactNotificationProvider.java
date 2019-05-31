/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.graphics.BitmapFactory;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.annotation.WorkerThread;
import android.support.v4.app.NotificationCompat;

import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.Logger;
import com.urbanairship.UAirship;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.notifications.AirshipNotificationProvider;
import com.urbanairship.push.notifications.NotificationArguments;

public class ReactNotificationProvider extends AirshipNotificationProvider {

    public ReactNotificationProvider(@NonNull Context context, @NonNull AirshipConfigOptions configOptions) {
        super(context, configOptions);
    }

    @NonNull
    @Override
    public NotificationArguments onCreateNotificationArguments(@NonNull Context context, @NonNull PushMessage message) {
        String defaultChannelId = ReactAirshipPreferences.shared().getDefaultNotificationChannelId(context);

        if (defaultChannelId == null) {
            defaultChannelId = getDefaultNotificationChannelId();
        }

        String requestedChannelId = message.getNotificationChannel(defaultChannelId);
        String activeChannelId = getActiveChannel(requestedChannelId, DEFAULT_NOTIFICATION_CHANNEL);

        return NotificationArguments.newBuilder(message)
                .setNotificationChannelId(activeChannelId)
                .setNotificationId(message.getNotificationTag(), getNextId(context, message))
                .build();
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
            int reactColor = Utils.getHexColor(accentHexColor, getDefaultAccentColor());
            builder.setColor(arguments.getMessage().getIconColor(reactColor));
        }

        return builder;
    }

    /**
     * Returns the provided channel if it exists or the default channel.
     *
     * @param channelId The notification channel.
     * @param defaultChannel The default notification channel.
     * @return The channelId if it exists, or the default channel.
     */
    @NonNull
    private String getActiveChannel(@Nullable String channelId, @NonNull String defaultChannel) {
        if (channelId == null) {
            return defaultChannel;
        }

        if (defaultChannel.equals(channelId)) {
            return channelId;
        }

        if (UAirship.shared().getPushManager().getNotificationChannelRegistry().getNotificationChannelSync(channelId) == null) {
            Logger.error("Notification channel %s does not exist. Falling back to %s", channelId, defaultChannel);
            return defaultChannel;
        }

        return channelId;
    }
}

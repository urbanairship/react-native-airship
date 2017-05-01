/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.support.annotation.NonNull;

import com.urbanairship.AirshipReceiver;
import com.urbanairship.push.PushMessage;


public class ReactAirshipReceiver extends AirshipReceiver {


    @Override
    protected void onChannelCreated(@NonNull Context context, @NonNull String channelId) {
        EventEmitter.shared().notifyChannelRegistrationFinished(channelId);
    }

    @Override
    protected void onChannelUpdated(@NonNull Context context, @NonNull String channelId) {
        EventEmitter.shared().notifyChannelRegistrationFinished(channelId);
    }

    @Override
    protected void onPushReceived(@NonNull Context context, @NonNull PushMessage message, boolean notificationPosted) {
        EventEmitter.shared().notifyPushReceived(message);
    }

    @Override
    protected boolean onNotificationOpened(@NonNull Context context, @NonNull NotificationInfo notificationInfo, @NonNull ActionButtonInfo actionButtonInfo) {
        EventEmitter.shared().notifyNotificationResponse(notificationInfo, actionButtonInfo);
        return false;
    }

    @Override
    protected boolean onNotificationOpened(@NonNull Context context, @NonNull NotificationInfo notificationInfo) {
        EventEmitter.shared().notifyNotificationResponse(notificationInfo);
        return false;
    }
}

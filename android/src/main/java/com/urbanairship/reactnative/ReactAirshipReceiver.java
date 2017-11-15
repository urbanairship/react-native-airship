/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.support.annotation.NonNull;

import com.urbanairship.AirshipReceiver;
import com.urbanairship.UAirship;
import com.urbanairship.push.PushMessage;
import com.urbanairship.reactnative.events.NotificationOptInEvent;
import com.urbanairship.reactnative.events.NotificationResponseEvent;
import com.urbanairship.reactnative.events.PushReceivedEvent;
import com.urbanairship.reactnative.events.RegistrationEvent;


/**
 * Module receiver used to dispatch Urban Airship events.
 */
public class ReactAirshipReceiver extends AirshipReceiver {

    @Override
    protected void onChannelCreated(@NonNull Context context, @NonNull String channelId) {
        Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getRegistrationToken());
        EventEmitter.shared().sendEvent(context, event);

        // If the opt-in status changes send an event
        UrbanAirshipReactModule.checkOptIn(context);
    }

    @Override
    protected void onChannelUpdated(@NonNull Context context, @NonNull String channelId) {
        Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getRegistrationToken());
        EventEmitter.shared().sendEvent(context, event);

        // If the opt-in status changes send an event
        UrbanAirshipReactModule.checkOptIn(context);
    }


    @Override
    protected void onPushReceived(@NonNull Context context, @NonNull PushMessage message, boolean notificationPosted) {
        if (!notificationPosted) {
            Event event = new PushReceivedEvent(message);
            EventEmitter.shared().sendEvent(context, event);
        }
    }

    @Override
    protected void onNotificationPosted(@NonNull Context context, @NonNull NotificationInfo notificationInfo) {
        Event event = new PushReceivedEvent(notificationInfo);
        EventEmitter.shared().sendEvent(context, event);
    }

    @Override
    protected boolean onNotificationOpened(@NonNull Context context, @NonNull NotificationInfo notificationInfo, @NonNull ActionButtonInfo actionButtonInfo) {
        Event event = new NotificationResponseEvent(notificationInfo, actionButtonInfo);
        EventEmitter.shared().sendEvent(context, event);
        return false;
    }

    @Override
    protected boolean onNotificationOpened(@NonNull Context context, @NonNull NotificationInfo notificationInfo) {
        Event event = new NotificationResponseEvent(notificationInfo);
        EventEmitter.shared().sendEvent(context, event);
        return false;
    }
}

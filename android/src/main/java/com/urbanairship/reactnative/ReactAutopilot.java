/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.annotation.XmlRes;

import com.urbanairship.Autopilot;
import com.urbanairship.Logger;
import com.urbanairship.UAirship;
import com.urbanairship.actions.DeepLinkListener;
import com.urbanairship.messagecenter.MessageCenter;
import com.urbanairship.push.NotificationActionButtonInfo;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.push.NotificationListener;
import com.urbanairship.push.PushListener;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.RegistrationListener;
import com.urbanairship.reactnative.events.DeepLinkEvent;
import com.urbanairship.reactnative.events.InboxUpdatedEvent;
import com.urbanairship.reactnative.events.NotificationResponseEvent;
import com.urbanairship.reactnative.events.PushReceivedEvent;
import com.urbanairship.reactnative.events.RegistrationEvent;
import com.urbanairship.reactnative.events.ShowInboxEvent;
import com.urbanairship.richpush.RichPushInbox;

import static com.urbanairship.reactnative.UrbanAirshipReactModule.AUTO_LAUNCH_MESSAGE_CENTER;

/**
 * Module's autopilot to customize Urban Airship.
 */
public class ReactAutopilot extends Autopilot {

    @Override
    public void onAirshipReady(UAirship airship) {
        super.onAirshipReady(airship);

        final Context context = UAirship.getApplicationContext();

        airship.setDeepLinkListener(new DeepLinkListener() {
            @Override
            public boolean onDeepLink(@NonNull String deepLink) {
                Event event = new DeepLinkEvent(deepLink);
                EventEmitter.shared().sendEvent(event);
                return true;
            }
        });

        airship.getPushManager().addPushListener(new PushListener() {
            @Override
            public void onPushReceived(@NonNull PushMessage pushMessage, boolean notificationPosted) {
                if (!notificationPosted) {
                    Event event = new PushReceivedEvent(pushMessage);
                    EventEmitter.shared().sendEvent(event);
                }
            }
        });

        airship.getPushManager().addRegistrationListener(new RegistrationListener() {
            @Override
            public void onChannelCreated(@NonNull String channelId) {
                Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getRegistrationToken());
                EventEmitter.shared().sendEvent(event);

                // If the opt-in status changes send an event
                UrbanAirshipReactModule.checkOptIn(context);
            }

            @Override
            public void onChannelUpdated(@NonNull String channelId) {
                Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getRegistrationToken());
                EventEmitter.shared().sendEvent(event);

                // If the opt-in status changes send an event
                UrbanAirshipReactModule.checkOptIn(context);
            }

            @Override
            public void onPushTokenUpdated(@NonNull String s) {}
        });

        airship.getPushManager().setNotificationListener(new NotificationListener() {
            @Override
            public void onNotificationPosted(@NonNull NotificationInfo notificationInfo) {
                Event event = new PushReceivedEvent(notificationInfo);
                EventEmitter.shared().sendEvent(event);
            }

            @Override
            public boolean onNotificationOpened(@NonNull NotificationInfo notificationInfo) {
                Event event = new NotificationResponseEvent(notificationInfo);
                EventEmitter.shared().sendEvent(event);
                return false;
            }

            @Override
            public boolean onNotificationForegroundAction(@NonNull NotificationInfo notificationInfo, @NonNull NotificationActionButtonInfo notificationActionButtonInfo) {
                Event event = new NotificationResponseEvent(notificationInfo, notificationActionButtonInfo);
                EventEmitter.shared().sendEvent(event);
                return false;
            }

            @Override
            public void onNotificationBackgroundAction(@NonNull NotificationInfo notificationInfo, @NonNull NotificationActionButtonInfo notificationActionButtonInfo) {
                Event event = new NotificationResponseEvent(notificationInfo, notificationActionButtonInfo);
                EventEmitter.shared().sendEvent(event);
            }

            @Override
            public void onNotificationDismissed(@NonNull NotificationInfo notificationInfo) {}
        });
        
        // Register a listener for inbox update event
        airship.getInbox().addListener(new RichPushInbox.Listener() {
            @Override
            public void onInboxUpdated() {
                Event event = new InboxUpdatedEvent(UAirship.shared().getInbox().getUnreadCount(), UAirship.shared().getInbox().getCount());
                EventEmitter.shared().sendEvent(event);
            }
        });

        airship.getMessageCenter().setOnShowMessageCenterListener(new MessageCenter.OnShowMessageCenterListener() {
            @Override
            public boolean onShowMessageCenter(@Nullable String messageId) {
                if (PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true)) {
                    return false;
                } else {
                    sendShowInboxEvent(messageId);
                    return true;
                }
            }
        });

        // Set our custom notification provider
        ReactNotificationProvider notificationProvider = new ReactNotificationProvider(context, airship.getAirshipConfigOptions());
        airship.getPushManager().setNotificationProvider(notificationProvider);

        loadCustomNotificationChannels(context, airship);
        loadCustomNotificationButtonGroups(context, airship);
    }

    private void loadCustomNotificationChannels(Context context, UAirship airship) {
        String packageName = UAirship.shared().getPackageName();
        @XmlRes int resId = context.getResources().getIdentifier("ua_custom_notification_channels", "xml", packageName);

        if (resId != 0) {
            Logger.debug("Loading custom notification channels");
            airship.getPushManager().getNotificationChannelRegistry().createNotificationChannels(resId);
        }
    }

    private void loadCustomNotificationButtonGroups(Context context, UAirship airship) {
        String packageName = UAirship.shared().getPackageName();
        @XmlRes int resId = context.getResources().getIdentifier("ua_custom_notification_buttons", "xml", packageName);

        if (resId != 0) {
            Logger.debug("Loading custom notification button groups");
            airship.getPushManager().addNotificationActionButtonGroups(context, resId);
        }
    }

    private static void sendShowInboxEvent(@Nullable String messageId) {
        Event event = new ShowInboxEvent(messageId);
        EventEmitter.shared().sendEvent(event);
    }
}

/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.preference.PreferenceManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.XmlRes;

import com.urbanairship.Autopilot;
import com.urbanairship.UAirship;
import com.urbanairship.actions.DeepLinkListener;
import com.urbanairship.analytics.Analytics;
import com.urbanairship.channel.AirshipChannelListener;
import com.urbanairship.messagecenter.InboxListener;
import com.urbanairship.messagecenter.MessageCenter;
import com.urbanairship.push.NotificationActionButtonInfo;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.push.NotificationListener;
import com.urbanairship.push.PushListener;
import com.urbanairship.push.PushMessage;
import com.urbanairship.reactnative.events.DeepLinkEvent;
import com.urbanairship.reactnative.events.InboxUpdatedEvent;
import com.urbanairship.reactnative.events.NotificationResponseEvent;
import com.urbanairship.reactnative.events.PushReceivedEvent;
import com.urbanairship.reactnative.events.RegistrationEvent;
import com.urbanairship.reactnative.events.ShowInboxEvent;

/**
 * Module's autopilot to customize Urban Airship.
 */
public class ReactAutopilot extends Autopilot {
    public static final String EXTENDER_MANIFEST_KEY = "com.urbanairship.reactnative.AIRSHIP_EXTENDER";

    @Override
    public void onAirshipReady(@NonNull UAirship airship) {
        super.onAirshipReady(airship);

        PluginLogger.setLogLevel(airship.getAirshipConfigOptions().logLevel);

        PluginLogger.debug("Airship React Native version: %s, SDK version: %s", BuildConfig.MODULE_VERSION, UAirship.getVersion());

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

        airship.getChannel().addChannelListener(new AirshipChannelListener() {
            @Override
            public void onChannelCreated(@NonNull String channelId) {
                Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getPushToken());
                EventEmitter.shared().sendEvent(event);

                // If the opt-in status changes send an event
                UrbanAirshipReactModule.checkOptIn(context);
            }

            @Override
            public void onChannelUpdated(@NonNull String channelId) {
                Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getPushToken());
                EventEmitter.shared().sendEvent(event);

                // If the opt-in status changes send an event
                UrbanAirshipReactModule.checkOptIn(context);
            }
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
        MessageCenter.shared().getInbox().addListener(new InboxListener() {
            @Override
            public void onInboxUpdated() {
                Event event = new InboxUpdatedEvent(MessageCenter.shared().getInbox().getUnreadCount(), MessageCenter.shared().getInbox().getCount());
                EventEmitter.shared().sendEvent(event);
            }
        });

        MessageCenter.shared().setOnShowMessageCenterListener(new MessageCenter.OnShowMessageCenterListener() {
            @Override
            public boolean onShowMessageCenter(@Nullable String messageId) {
                if (PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(UrbanAirshipReactModule.AUTO_LAUNCH_MESSAGE_CENTER, true)) {
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

        airship.getAnalytics().registerSDKExtension(Analytics.EXTENSION_REACT_NATIVE, BuildConfig.MODULE_VERSION);

        loadCustomNotificationChannels(context, airship);
        loadCustomNotificationButtonGroups(context, airship);

        AirshipExtender extender = createExtender(context);
        if (extender != null) {
            extender.onAirshipReady(context, airship);
        }
    }

    private void loadCustomNotificationChannels(Context context, UAirship airship) {
        String packageName = UAirship.getPackageName();
        @XmlRes int resId = context.getResources().getIdentifier("ua_custom_notification_channels", "xml", packageName);

        if (resId != 0) {
            PluginLogger.debug("Loading custom notification channels");
            airship.getPushManager().getNotificationChannelRegistry().createNotificationChannels(resId);
        }
    }

    private void loadCustomNotificationButtonGroups(Context context, UAirship airship) {
        String packageName = UAirship.getPackageName();
        @XmlRes int resId = context.getResources().getIdentifier("ua_custom_notification_buttons", "xml", packageName);

        if (resId != 0) {
            PluginLogger.debug("Loading custom notification button groups");
            airship.getPushManager().addNotificationActionButtonGroups(context, resId);
        }
    }

    private static void sendShowInboxEvent(@Nullable String messageId) {
        Event event = new ShowInboxEvent(messageId);
        EventEmitter.shared().sendEvent(event);
    }

    @Nullable
    private static AirshipExtender createExtender(@NonNull Context context) {
        ApplicationInfo ai;
        try {
            ai = context.getPackageManager().getApplicationInfo(context.getPackageName(), PackageManager.GET_META_DATA);
            if (ai == null || ai.metaData == null) {
                return null;
            }
        } catch (PackageManager.NameNotFoundException e) {
            return null;
        }

        String classname = ai.metaData.getString(EXTENDER_MANIFEST_KEY);

        if (classname == null) {
            return null;
        }

        try {
            Class<?> extenderClass = Class.forName(classname);
            return (AirshipExtender) extenderClass.newInstance();
        } catch (Exception e) {
            PluginLogger.error(e, "Unable to create extender: " + classname);
        }
        return null;
    }
}

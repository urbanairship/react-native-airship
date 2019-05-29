/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.support.annotation.XmlRes;
import android.support.v4.app.NotificationCompat;

import com.urbanairship.Autopilot;
import com.urbanairship.Logger;
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.DeepLinkAction;
import com.urbanairship.actions.OpenRichPushInboxAction;
import com.urbanairship.actions.OverlayRichPushMessageAction;
import com.urbanairship.push.NotificationActionButtonInfo;
import com.urbanairship.push.NotificationInfo;
import com.urbanairship.push.NotificationListener;
import com.urbanairship.push.PushListener;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.RegistrationListener;
import com.urbanairship.push.notifications.DefaultNotificationFactory;
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

        // Modify the deep link action to emit events
        airship.getActionRegistry().getEntry(DeepLinkAction.DEFAULT_REGISTRY_NAME).setDefaultAction(new DeepLinkAction() {
            @Override
            public ActionResult perform(@NonNull ActionArguments arguments) {
                String deepLink = arguments.getValue().getString();
                if (deepLink != null) {
                    Event event = new DeepLinkEvent(deepLink);
                    EventEmitter.shared().sendEvent(event);
                }
                return ActionResult.newResult(arguments.getValue());
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

        // Replace the message center actions to control auto launch behavior
        airship.getActionRegistry()
                .getEntry(OverlayRichPushMessageAction.DEFAULT_REGISTRY_NAME)
                .setDefaultAction(new CustomOverlayRichPushMessageAction());

        airship.getActionRegistry()
                .getEntry(OpenRichPushInboxAction.DEFAULT_REGISTRY_NAME)
                .setDefaultAction(new CustomOpenRichPushMessageAction());


        DefaultNotificationFactory notificationFactory = new DefaultNotificationFactory(context) {
            @Override
            public NotificationCompat.Builder extendBuilder(@NonNull NotificationCompat.Builder builder, @NonNull PushMessage message, int notificationId) {
                builder.getExtras().putBundle("push_message", message.getPushBundle());
                return builder;
            }
        };

        if (airship.getAirshipConfigOptions().notificationIcon != 0) {
            notificationFactory.setSmallIconId(airship.getAirshipConfigOptions().notificationIcon);
        }

        notificationFactory.setColor(airship.getAirshipConfigOptions().notificationAccentColor);
        notificationFactory.setNotificationChannel(airship.getAirshipConfigOptions().notificationChannel);

        airship.getPushManager().setNotificationFactory(notificationFactory);

        loadCustomNotificationButtonGroups(context, airship);
    }

    private void loadCustomNotificationButtonGroups(Context context, UAirship airship) {
        String packageName = UAirship.shared().getPackageName();
        @XmlRes int resId = context.getResources().getIdentifier("ua_custom_notification_buttons", "xml", packageName);

        if (resId != 0) {
            Logger.debug("Loading custom notification button groups");
            airship.getPushManager().addNotificationActionButtonGroups(context, resId);
        }
    }

    private static void sendShowInboxEvent(ActionArguments arguments) {
        String messageId = arguments.getValue().getString();

        if (messageId.equalsIgnoreCase(OverlayRichPushMessageAction.MESSAGE_ID_PLACEHOLDER)) {
            PushMessage pushMessage = arguments.getMetadata().getParcelable(ActionArguments.PUSH_MESSAGE_METADATA);
            if (pushMessage != null && pushMessage.getRichPushMessageId() != null) {
                messageId = pushMessage.getRichPushMessageId();
            } else if (arguments.getMetadata().containsKey(ActionArguments.RICH_PUSH_ID_METADATA)) {
                messageId = arguments.getMetadata().getString(ActionArguments.RICH_PUSH_ID_METADATA);
            } else {
                messageId = null;
            }
        }

        Event event = new ShowInboxEvent(messageId);
        EventEmitter.shared().sendEvent(event);
    }

    public static class CustomOverlayRichPushMessageAction extends OverlayRichPushMessageAction {
        @NonNull
        @Override
        public ActionResult perform(@NonNull ActionArguments arguments) {
            if (PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true)) {
                return super.perform(arguments);
            } else {
                sendShowInboxEvent(arguments);
                return ActionResult.newEmptyResult();
            }
        }
    }

    public static class CustomOpenRichPushMessageAction extends OpenRichPushInboxAction {
        @NonNull
        @Override
        public ActionResult perform(@NonNull ActionArguments arguments) {
            if (PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true)) {
                return super.perform(arguments);
            } else {
                sendShowInboxEvent(arguments);
                return ActionResult.newEmptyResult();
            }
        }
    }
}

/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.preference.PreferenceManager;
import android.support.annotation.NonNull;
import android.support.v4.app.NotificationCompat;

import com.urbanairship.Autopilot;
import com.urbanairship.UAirship;
import com.urbanairship.actions.Action;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionRegistry;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.DeepLinkAction;
import com.urbanairship.actions.OpenRichPushInboxAction;
import com.urbanairship.actions.OverlayRichPushMessageAction;
import com.urbanairship.push.PushManager;
import com.urbanairship.reactnative.events.DeepLinkEvent;
import com.urbanairship.reactnative.events.InboxUpdatedEvent;
import com.urbanairship.richpush.RichPushInbox;
import com.urbanairship.push.notifications.DefaultNotificationFactory;
import com.urbanairship.push.PushMessage;

import static com.urbanairship.reactnative.UrbanAirshipReactModule.AUTO_LAUNCH_MESSAGE_CENTER;

/**
 * Module's autopilot to customize Urban Airship.
 */
public class ReactAutopilot extends Autopilot {

    @Override
    public void onAirshipReady(UAirship airship) {
        super.onAirshipReady(airship);


        // Modify the deep link action to emit events
        airship.getActionRegistry().getEntry(DeepLinkAction.DEFAULT_REGISTRY_NAME).setDefaultAction(new DeepLinkAction() {
            @Override
            public ActionResult perform(@NonNull ActionArguments arguments) {
                String deepLink = arguments.getValue().getString();
                if (deepLink != null) {
                    Event event = new DeepLinkEvent(deepLink);
                    EventEmitter.shared().sendEvent(UAirship.getApplicationContext(), event);
                }
                return ActionResult.newResult(arguments.getValue());
            }
        });
        
        // Register a listener for inbox update event
        UAirship.shared().getInbox().addListener(new RichPushInbox.Listener() {
            @Override
            public void onInboxUpdated() {
                Event event = new InboxUpdatedEvent(UAirship.shared().getInbox().getUnreadCount(), UAirship.shared().getInbox().getCount());
                EventEmitter.shared().sendEvent(UAirship.getApplicationContext(), event);
            }
        });

        // Set predicates on message center actions to control auto launch behavior
        airship.getActionRegistry()
                .getEntry(OverlayRichPushMessageAction.DEFAULT_REGISTRY_NAME)
                .setPredicate(new ActionRegistry.Predicate() {
                    @Override
                    public boolean apply(ActionArguments actionArguments) {
                        if (actionArguments.getSituation() == Action.SITUATION_PUSH_OPENED) {
                            return PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true);
                        }

                        return true;
                    }
                });

        airship.getActionRegistry()
                .getEntry(OpenRichPushInboxAction.DEFAULT_REGISTRY_NAME)
                .setPredicate(new ActionRegistry.Predicate() {
                    @Override
                    public boolean apply(ActionArguments actionArguments) {
                        if (actionArguments.getSituation() == Action.SITUATION_PUSH_OPENED) {
                            return PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext()).getBoolean(AUTO_LAUNCH_MESSAGE_CENTER, true);
                        }

                        return true;
                    }
                });


        DefaultNotificationFactory notificationFactory = new DefaultNotificationFactory(UAirship.getApplicationContext()) {
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
    }

}
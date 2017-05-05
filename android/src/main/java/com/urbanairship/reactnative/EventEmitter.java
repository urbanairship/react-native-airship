/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.MainThread;
import android.support.annotation.Nullable;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.RCTNativeAppEventEmitter;
import com.urbanairship.AirshipReceiver;
import com.urbanairship.Logger;
import com.urbanairship.UAirship;
import com.urbanairship.push.PushMessage;

class EventEmitter {

    private static final String CHANNEL_REGISTRATION_EVENT = "com.urbanairship.registration";
    private static final String NOTIFICATION_RESPONSE_EVENT = "com.urbanairship.notification_response";
    private static final String PUSH_RECEIVED_EVENT = "com.urbanairship.push_received";
    private static final String NOTIFICATION_OPT_IN_STATUS_EVENT = "com.urbanairship.notification_opt_in_status";


    private static final String PUSH_ALERT = "alert";
    private static final String PUSH_TITLE = "title";
    private static final String PUSH_EXTRAS = "extras";

    private static final String RESPONSE_ACTION_ID = "actionId";
    private static final String RESPONSE_FOREGROUND = "isForeground";


    private static final String CHANNEL_ID = "channelId";
    private static final String REGISTRATION_TOKEN = "registrationToken";

    private static final String DEEP_LINK = "deepLink";

    private static final String OPTED_IN = "optedIn";



    private static EventEmitter sharedInstance = new EventEmitter();

    private ReactInstanceManager instanceManager;

    static EventEmitter shared() {
        return sharedInstance;
    }

    void notifyChannelRegistrationFinished(String channel) {
        WritableMap map = Arguments.createMap();
        map.putString(CHANNEL_ID, channel);

        if (UAirship.shared().getPushManager().getRegistrationToken() != null) {
            map.putString(REGISTRATION_TOKEN, UAirship.shared().getPushManager().getRegistrationToken());
        }

        emit(CHANNEL_REGISTRATION_EVENT, map, false);
    }

    void notifyPushReceived(PushMessage message) {
        WritableMap map = createPushMap(message);
        emit(PUSH_RECEIVED_EVENT, map, false);
    }

    void notifyNotificationResponse(AirshipReceiver.NotificationInfo notificationInfo, AirshipReceiver.ActionButtonInfo info) {
        WritableMap map = createPushMap(notificationInfo.getMessage());
        map.putString(RESPONSE_ACTION_ID, info.getButtonId());
        map.putBoolean(RESPONSE_FOREGROUND, info.isForeground());

        emit(NOTIFICATION_RESPONSE_EVENT, map, info.isForeground());
    }

    void notifyNotificationResponse(AirshipReceiver.NotificationInfo notificationInfo) {
        WritableMap map = createPushMap(notificationInfo.getMessage());
        map.putBoolean(RESPONSE_FOREGROUND, true);

        emit(NOTIFICATION_RESPONSE_EVENT, map, true);
    }

    void notifyDeepLink(String deepLink) {
        WritableMap map = Arguments.createMap();
        map.putString(DEEP_LINK, deepLink);

        emit(NOTIFICATION_RESPONSE_EVENT, map, true);
    }

    public void notifyNotificationOptInStatus(boolean optIn) {
        WritableMap map = Arguments.createMap();
        map.putBoolean(OPTED_IN, optIn);
        emit(NOTIFICATION_OPT_IN_STATUS_EVENT, map, true);
    }

    private void emit(final String name, final Object data, final boolean waitForReact) {
        // Force the call to be on the main thread
        if (Looper.getMainLooper() != Looper.myLooper()) {
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    emit(name, data, waitForReact);
                }
            });
        }

        final ReactInstanceManager reactInstanceManager = getReactInstanceManager();
        if (reactInstanceManager == null) {
            Logger.error("Unable to emit events. React Instance Manager is unavailable.");
            return;
        }


        ReactContext context = reactInstanceManager.getCurrentReactContext();
        if (context != null && context.hasActiveCatalystInstance()) {
            emit(context, name, data);
        } else if (waitForReact || reactInstanceManager.hasStartedCreatingInitialContext()) {
            reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext context) {
                    emit(context, name, data);
                    reactInstanceManager.removeReactInstanceEventListener(this);
                }
            });
        }
    }

    @MainThread
    private void emit(final ReactContext context, final String name, final Object data) {
        context.getJSModule(RCTNativeAppEventEmitter.class)
                .emit(name, data);
    }

    private static WritableMap createPushMap(PushMessage message) {
        WritableMap map = Arguments.createMap();

        if (message.getAlert() != null) {
            map.putString(PUSH_ALERT, message.getAlert());
        }

        if (message.getTitle() != null) {
            map.putString(PUSH_TITLE, message.getTitle());
        }

        Bundle bundle = new Bundle(message.getPushBundle());
        bundle.remove("android.support.content.wakelockid");
        map.putMap(PUSH_EXTRAS, Arguments.fromBundle(bundle));

        return map;
    }

    @Nullable
    ReactInstanceManager getReactInstanceManager() {
        if (instanceManager == null) {
            if (UAirship.getApplicationContext() instanceof ReactApplication) {
                instanceManager = ((ReactApplication) UAirship.getApplicationContext()).getReactNativeHost().getReactInstanceManager();
            }
        }

        return instanceManager;
    }


}

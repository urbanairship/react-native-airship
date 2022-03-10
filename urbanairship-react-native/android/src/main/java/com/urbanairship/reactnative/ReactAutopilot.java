/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.XmlRes;

import com.facebook.react.views.view.ColorUtil;
import com.urbanairship.AirshipConfigOptions;
import com.urbanairship.Autopilot;
import com.urbanairship.Logger;
import com.urbanairship.PrivacyManager;
import com.urbanairship.UAirship;
import com.urbanairship.actions.DeepLinkListener;
import com.urbanairship.analytics.Analytics;
import com.urbanairship.channel.AirshipChannelListener;
import com.urbanairship.json.JsonList;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
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

import okhttp3.internal.Util;

/**
 * Module's autopilot to customize Urban Airship.
 */
public class ReactAutopilot extends Autopilot {
    public static final String EXTENDER_MANIFEST_KEY = "com.urbanairship.reactnative.AIRSHIP_EXTENDER";

    private AirshipConfigOptions configOptions;

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
            }

            @Override
            public void onChannelUpdated(@NonNull String channelId) {
                Event event = new RegistrationEvent(channelId, UAirship.shared().getPushManager().getPushToken());
                EventEmitter.shared().sendEvent(event);
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
            public void onNotificationDismissed(@NonNull NotificationInfo notificationInfo) {
            }
        });

        // Register a listener for inbox update event
        MessageCenter.shared().getInbox().addListener(new InboxListener() {
            @Override
            public void onInboxUpdated() {
                Event event = new InboxUpdatedEvent(MessageCenter.shared().getInbox().getUnreadCount(), MessageCenter.shared().getInbox().getCount());
                EventEmitter.shared().sendEvent(event);
            }
        });

        ReactAirshipPreferences preferences = ReactAirshipPreferences.shared(context);
        MessageCenter.shared().setOnShowMessageCenterListener(new MessageCenter.OnShowMessageCenterListener() {
            @Override
            public boolean onShowMessageCenter(@Nullable String messageId) {
                if (preferences.isAutoLaunchMessageCenterEnabled()) {
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

    @Override
    public boolean isReady(@NonNull Context context) {
        configOptions = loadConfig(context);

        try {
            configOptions.validate();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Nullable
    @Override
    public AirshipConfigOptions createAirshipConfigOptions(@NonNull Context context) {
        return configOptions;
    }

    private AirshipConfigOptions loadConfig(@NonNull Context context) {
        AirshipConfigOptions.Builder builder = AirshipConfigOptions.newBuilder()
                .applyDefaultProperties(context);

        JsonMap config = ReactAirshipPreferences.shared(context).getAirshipConfig();
        if (config == null || config.isEmpty()) {
            return builder.build();
        }

        JsonMap developmentEnvironment = config.opt("development").getMap();
        JsonMap productionEnvironment = config.opt("production").getMap();
        JsonMap defaultEnvironment = config.opt("production").getMap();

        if (developmentEnvironment != null) {
            builder.setDevelopmentAppKey(developmentEnvironment.opt("appKey").getString())
                    .setDevelopmentAppSecret(developmentEnvironment.opt("appSecret").getString());

            String logLevel = developmentEnvironment.opt("logLevel").getString();
            if (logLevel != null) {
                builder.setLogLevel(convertLogLevel(logLevel, Log.DEBUG));
            }
        }

        if (productionEnvironment != null) {
            builder.setProductionAppKey(productionEnvironment.opt("appKey").getString())
                    .setProductionAppSecret(productionEnvironment.opt("appSecret").getString());

            String logLevel = productionEnvironment.opt("logLevel").getString();
            if (logLevel != null) {
                builder.setProductionLogLevel(convertLogLevel(logLevel, Log.ERROR));
            }
        }

        if (defaultEnvironment != null) {
            builder.setAppKey(defaultEnvironment.opt("appKey").getString())
                    .setAppSecret(defaultEnvironment.opt("appSecret").getString());

            String logLevel = defaultEnvironment.opt("logLevel").getString();
            if (logLevel != null) {
                builder.setLogLevel(convertLogLevel(logLevel, Log.ERROR));
            }
        }

        String site = config.opt("site").getString();
        if (site != null) {
            try {
                builder.setSite(parseSite(site));
            } catch (Exception e) {
                PluginLogger.error("Invalid site " + site, e);
            }
        }

        if (config.containsKey("inProduction")) {
            builder.setInProduction(config.opt("inProduction").getBoolean(false));
        }

        if (config.containsKey("isChannelCreationDelayEnabled")) {
            builder.setChannelCreationDelayEnabled(config.opt("isChannelCreationDelayEnabled").getBoolean(false));
        }

        if (config.containsKey("requireInitialRemoteConfigEnabled")) {
            builder.setRequireInitialRemoteConfigEnabled(config.opt("requireInitialRemoteConfigEnabled").getBoolean(false));
        }

        String[] urlAllowList = parseArray(config.opt("urlAllowList"));
        if (urlAllowList != null) {
            builder.setUrlAllowList(urlAllowList);
        }

        String[] urlAllowListScopeJavaScriptInterface = parseArray(config.opt("urlAllowListScopeJavaScriptInterface"));
        if (urlAllowListScopeJavaScriptInterface != null) {
            builder.setUrlAllowListScopeJavaScriptInterface(urlAllowListScopeJavaScriptInterface);
        }

        String[] urlAllowListScopeOpenUrl = parseArray(config.opt("urlAllowListScopeOpenUrl"));
        if (urlAllowListScopeOpenUrl != null) {
            builder.setUrlAllowListScopeOpenUrl(urlAllowListScopeOpenUrl);
        }

        JsonMap chat = config.opt("chat").getMap();
        if (chat != null) {
            builder.setChatSocketUrl(chat.opt("webSocketUrl").optString())
                    .setChatUrl(chat.opt("url").optString());
        }

        JsonMap android = config.opt("android").getMap();
        if (android != null) {
            if (android.containsKey("appStoreUri")) {
                builder.setAppStoreUri(Uri.parse(android.opt("appStoreUri").optString()));
            }

            if (android.containsKey("fcmFirebaseAppName")) {
                builder.setFcmFirebaseAppName(android.opt("fcmFirebaseAppName").optString());
            }

            if (android.containsKey("notificationConfig")) {
                applyNotificationConfig(context, android.opt("notificationConfig").optMap(), builder);
            }
        }

        JsonList enabledFeatures = config.opt("enabledFeatures").getList();
        try {
            if (enabledFeatures != null) {
                builder.setEnabledFeatures(parseFeatures(enabledFeatures));
            }
        } catch (Exception e) {
            PluginLogger.error("Invalid enabled features: " + enabledFeatures);
        }

        return builder.build();
    }

    private void applyNotificationConfig(@NonNull Context context, @NonNull JsonMap notificationConfig, @NonNull AirshipConfigOptions.Builder builder) {
        String icon = notificationConfig.opt(UrbanAirshipReactModule.NOTIFICATION_ICON_KEY).getString();
        if (icon != null) {
            int resourceId = Utils.getNamedResource(context, icon, "drawable");
            builder.setNotificationIcon(resourceId);
        }

        String largeIcon = notificationConfig.opt(UrbanAirshipReactModule.NOTIFICATION_LARGE_ICON_KEY).getString();
        if (largeIcon != null) {
            int resourceId = Utils.getNamedResource(context, largeIcon, "drawable");
            builder.setNotificationLargeIcon(resourceId);
        }

        String accentColor = notificationConfig.opt(UrbanAirshipReactModule.ACCENT_COLOR_KEY).getString();
        if (accentColor != null) {
            builder.setNotificationAccentColor(Utils.getHexColor(accentColor, 0));
        }

        String channelId = notificationConfig.opt(UrbanAirshipReactModule.DEFAULT_CHANNEL_ID_KEY).getString();
        if (channelId != null) {
            builder.setNotificationChannel(channelId);
        }
    }

    private static int convertLogLevel(@NonNull String logLevel, int defaultValue) {
        switch (logLevel) {
            case "verbose":
                return Log.VERBOSE;
            case "debug":
                return Log.DEBUG;
            case "info":
                return Log.INFO;
            case "warning":
                return Log.WARN;
            case "error":
                return Log.ERROR;
            case "none":
                return Log.ASSERT;
        }
        return defaultValue;
    }

    @Nullable
    private static String[] parseArray(@Nullable JsonValue value) {
        if (value == null || !value.isJsonList()) {
            return null;
        }

        String[] result = new String[value.optList().size()];
        for (int i = 0; i <= value.optList().size(); i++) {
            String string = value.optList().get(i).getString();
            if (string == null) {
                PluginLogger.error("Invalid string array: " + value);
                return null;
            }
            result[i] = string;
        }

        return result;
    }

    @PrivacyManager.Feature
    private int parseFeatures(@NonNull JsonList jsonList) {
        int result = PrivacyManager.FEATURE_NONE;
        for (JsonValue value : jsonList) {
            result |= Utils.parseFeature(value.optString());
        }
        return result;
    }

    @AirshipConfigOptions.Site
    @NonNull
    private String parseSite(@NonNull String value) {
        switch (value) {
            case "eu":
                return AirshipConfigOptions.SITE_EU;

            case "us":
                return AirshipConfigOptions.SITE_US;
        }

        throw new IllegalArgumentException("Invalid site: " + value);
    }
}

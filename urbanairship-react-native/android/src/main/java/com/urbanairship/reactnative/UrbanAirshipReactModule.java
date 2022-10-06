/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import static com.urbanairship.actions.ActionResult.STATUS_ACTION_NOT_FOUND;
import static com.urbanairship.actions.ActionResult.STATUS_COMPLETED;
import static com.urbanairship.actions.ActionResult.STATUS_EXECUTION_ERROR;
import static com.urbanairship.actions.ActionResult.STATUS_REJECTED_ARGUMENTS;
import static com.urbanairship.reactnative.Utils.convertDynamic;
import static com.urbanairship.reactnative.Utils.convertJsonValue;

import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.service.notification.StatusBarNotification;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.urbanairship.Autopilot;
import com.urbanairship.PrivacyManager;
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionCompletionCallback;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.ActionRunRequest;
import com.urbanairship.analytics.AssociatedIdentifiers;
import com.urbanairship.automation.InAppAutomation;
import com.urbanairship.channel.AirshipChannelListener;
import com.urbanairship.channel.AttributeEditor;
import com.urbanairship.channel.SubscriptionListEditor;
import com.urbanairship.channel.TagGroupsEditor;
import com.urbanairship.contacts.Scope;
import com.urbanairship.contacts.ScopedSubscriptionListEditor;
import com.urbanairship.json.JsonMap;
import com.urbanairship.messagecenter.Inbox;
import com.urbanairship.messagecenter.Message;
import com.urbanairship.messagecenter.MessageCenter;
import com.urbanairship.push.PushManager;
import com.urbanairship.push.PushMessage;
import com.urbanairship.reactnative.events.NotificationOptInEvent;
import com.urbanairship.reactnative.events.PushReceivedEvent;
import com.urbanairship.util.UAStringUtil;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * React module for Urban Airship.
 */
public class UrbanAirshipReactModule extends ReactContextBaseJavaModule {

    private static final String TAG_OPERATION_GROUP_NAME = "group";
    private static final String TAG_OPERATION_TYPE = "operationType";
    private static final String TAG_OPERATION_TAGS = "tags";
    private static final String TAG_OPERATION_ADD = "add";
    private static final String TAG_OPERATION_REMOVE = "remove";
    private static final String TAG_OPERATION_SET = "set";

    private static final String ATTRIBUTE_OPERATION_KEY = "key";
    private static final String ATTRIBUTE_OPERATION_VALUE = "value";
    private static final String ATTRIBUTE_OPERATION_TYPE = "action";
    private static final String ATTRIBUTE_OPERATION_SET = "set";
    private static final String ATTRIBUTE_OPERATION_REMOVE = "remove";
    private static final String ATTRIBUTE_OPERATION_VALUETYPE = "type";

    private static final String SUBSCRIBE_LIST_OPERATION_LISTID = "listId";
    private static final String SUBSCRIBE_LIST_OPERATION_TYPE = "type";
    private static final String SUBSCRIBE_LIST_OPERATION_SCOPE = "scope";

    static final String NOTIFICATION_ICON_KEY = "icon";
    static final String NOTIFICATION_LARGE_ICON_KEY = "largeIcon";
    static final String ACCENT_COLOR_KEY = "accentColor";
    static final String DEFAULT_CHANNEL_ID_KEY = "defaultChannelId";

    static final String CLOSE_MESSAGE_CENTER = "CLOSE";

    private static final String INVALID_FEATURE_ERROR_CODE = "INVALID_FEATURE";
    private static final String INVALID_FEATURE_ERROR_MESSAGE = "Invalid feature, cancelling the action.";

    private static final Executor BG_EXECUTOR = Executors.newCachedThreadPool();
    private final ReactAirshipPreferences preferences;

    /**
     * Default constructor.
     *
     * @param reactContext The react context.
     */
    public UrbanAirshipReactModule(ReactApplicationContext reactContext) {
        super(reactContext);
        preferences = ReactAirshipPreferences.shared(reactContext);
    }

    @Override
    public void initialize() {
        super.initialize();

        Autopilot.automaticTakeOff(getReactApplicationContext());

        EventEmitter.shared().attachReactContext(getReactApplicationContext());

        UAirship.shared(airship -> {
            checkOptIn();

            airship.getChannel().addChannelListener(new AirshipChannelListener() {
                @Override
                public void onChannelCreated(@NonNull String channelId) {
                    checkOptIn();
                }

                @Override
                public void onChannelUpdated(@NonNull String channelId) {
                    checkOptIn();
                }
            });
        });

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                // If the opt-in status changes send an event
                checkOptIn();
                EventEmitter.shared().onHostResume();
            }

            @Override
            public void onHostPause() {

            }

            @Override
            public void onHostDestroy() {

            }

        });

    }

    @NonNull
    @Override
    public String getName() {
        return "UrbanAirshipReactModule";
    }

    @ReactMethod
    public void addListener(String eventName) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void removeListeners(Integer count) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    public void takeOff(ReadableMap config, Promise promise) {
        JsonMap jsonMap = Utils.convertMap(config);
        preferences.setAirshipConfig(jsonMap);
        Autopilot.automaticTakeOff(getReactApplicationContext());
        promise.resolve(UAirship.isFlying() || UAirship.isTakingOff());
    }

    @ReactMethod
    public void isFlying(Promise promise) {
        promise.resolve(UAirship.isFlying() || UAirship.isTakingOff());
    }

    @ReactMethod
    public void setAndroidNotificationConfig(ReadableMap map) {
        preferences.setNotificationIcon(map.hasKey(NOTIFICATION_ICON_KEY) ? map.getString(NOTIFICATION_ICON_KEY) : null);
        preferences.setNotificationLargeIcon(map.hasKey(NOTIFICATION_LARGE_ICON_KEY) ? map.getString(NOTIFICATION_LARGE_ICON_KEY) : null);
        preferences.setNotificationAccentColor(map.hasKey(ACCENT_COLOR_KEY) ? map.getString(ACCENT_COLOR_KEY) : null);
        preferences.setDefaultNotificationChannelId(map.hasKey(DEFAULT_CHANNEL_ID_KEY) ? map.getString(DEFAULT_CHANNEL_ID_KEY) : null);
    }

    /**
     * Enables/Disables user notifications.
     *
     * @param enabled {@code true} to enable notifications, {@code false} to disable.
     */
    @ReactMethod
    public void setUserNotificationsEnabled(boolean enabled) {
        UAirship.shared().getPushManager().setUserNotificationsEnabled(enabled);
    }

    /**
     * If `channelCreationDelayEnabled` is enabled in the config, apps must call
     * this method to enable channel creation.
     */
    @ReactMethod
    public void enableChannelCreation() {
        UAirship.shared().getChannel().enableChannelCreation();
    }

    /**
     * Enables user notifications.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void enableUserPushNotifications(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        UAirship.shared().getPushManager().setUserNotificationsEnabled(true);
        promise.resolve(true);
    }

    /**
     * Checks if user notifications are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isUserNotificationsEnabled(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(UAirship.shared().getPushManager().getUserNotificationsEnabled());
    }

    /**
     * Sets the current enabled features.
     *
     * @param features The features to set as enabled.
     * @param promise  The promise.
     */
    @ReactMethod
    public void setEnabledFeatures(ReadableArray features, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        try {
            UAirship.shared().getPrivacyManager().setEnabledFeatures(parseFeatures(features));
        } catch (Exception e) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e);
        }
    }

    /**
     * Gets the current enabled features.
     *
     * @param promise The promise.
     * @return The enabled features.
     */
    @ReactMethod
    public void getEnabledFeatures(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        List<String> enabledFeatures = Utils.convertFeatures(UAirship.shared().getPrivacyManager().getEnabledFeatures());
        promise.resolve(toWritableArray(enabledFeatures));
    }

    /**
     * Enables features.
     *
     * @param features The features to enable.
     * @param promise  The promise.
     */
    @ReactMethod
    public void enableFeature(ReadableArray features, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        try {
            UAirship.shared().getPrivacyManager().enable(parseFeatures(features));
        } catch (Exception e) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e);
        }
    }

    /**
     * Disables features.
     *
     * @param features The features to disable.
     * @param promise  The promise.
     */
    @ReactMethod
    public void disableFeature(ReadableArray features, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        try {
            UAirship.shared().getPrivacyManager().disable(parseFeatures(features));
        } catch (Exception e) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e);
        }
    }

    /**
     * Checks if a given feature is enabled.
     *
     * @param features The features to check.
     * @param promise  The promise.
     * @return {@code true} if the provided features are enabled, otherwise {@code false}.
     */
    @ReactMethod
    public void isFeatureEnabled(ReadableArray features, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        try {
            boolean enabled = UAirship.shared().getPrivacyManager().isEnabled(parseFeatures(features));
            promise.resolve(enabled);
        } catch (Exception e) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e);
        }
    }

    /**
     * Checks if the app's notifications are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isUserNotificationsOptedIn(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(UAirship.shared().getPushManager().isOptIn());
    }

    /**
     * Checks if the app's notifications are enabled at the system level.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isSystemNotificationsEnabledForApp(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(NotificationManagerCompat.from(getReactApplicationContext()).areNotificationsEnabled());
    }

    /**
     * Gets the notification status.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getNotificationStatus(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        WritableMap result = Arguments.createMap();
        PushManager push = UAirship.shared().getPushManager();
        result.putBoolean("airshipOptIn", push.isOptIn());
        result.putBoolean("airshipEnabled", push.getUserNotificationsEnabled());
        result.putBoolean("systemEnabled", NotificationManagerCompat.from(getReactApplicationContext()).areNotificationsEnabled());
        promise.resolve(result);
    }

    @ReactMethod
    @RequiresApi(api = Build.VERSION_CODES.O)
    public void getNotificationChannelStatus(String channelId, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        NotificationManager manager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel channel = manager.getNotificationChannel(channelId);
        if (channel == null) {
            promise.resolve("unknown");
        } else {
            if (channel.getImportance() != NotificationManager.IMPORTANCE_NONE) {
                promise.resolve("enabled");
            } else {
                promise.resolve("disabled");
            }
        }
    }

    /**
     * Returns the channel ID.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getChannelId(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(UAirship.shared().getChannel().getId());
    }

    /**
     * Returns the registration token.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getRegistrationToken(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(UAirship.shared().getPushManager().getPushToken());
    }


    /**
     * Sets the named user.
     *
     * @param namedUser The named user ID.
     */
    @ReactMethod
    public void setNamedUser(String namedUser) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        if (namedUser != null) {
            namedUser = namedUser.trim();
        }

        if (UAStringUtil.isEmpty(namedUser)) {
            UAirship.shared().getContact().reset();
        } else {
            UAirship.shared().getContact().identify(namedUser);
        }
    }

    /**
     * Gets the named user.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getNamedUser(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        promise.resolve(UAirship.shared().getContact().getNamedUserId());
    }

    /**
     * Adds a channel tag.
     *
     * @param tag The tag to add.
     */
    @ReactMethod
    public void addTag(String tag) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        if (tag != null) {
            UAirship.shared().getChannel().editTags().addTag(tag).apply();
        }
    }

    /**
     * Removes a channel tag.
     *
     * @param tag The tag to remove.
     */
    @ReactMethod
    public void removeTag(String tag) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        if (tag != null) {
            UAirship.shared().getChannel().editTags().removeTag(tag).apply();
        }
    }

    /**
     * Gets the current channel tags.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getTags(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        promise.resolve(toWritableArray(UAirship.shared().getChannel().getTags()));
    }

    /**
     * Edits the channel tag groups.
     * Operations should each be a map with the following:
     * - operationType: Either add or remove
     * - group: The group to modify
     * - tags: The tags to add or remove.
     *
     * @param operations An array of operations.
     */
    @ReactMethod
    public void editChannelTagGroups(ReadableArray operations) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        applyTagGroupOperations(UAirship.shared().getChannel().editTagGroups(), operations);
    }

    /**
     * Edits the contact tag groups.
     * Operations should each be a map with the following:
     * - operationType: Either add or remove
     * - group: The group to modify
     * - tags: The tags to add or remove.
     *
     * @param operations An array of operations.
     */
    @ReactMethod
    public void editContactTagGroups(ReadableArray operations) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        applyTagGroupOperations(UAirship.shared().getContact().editTagGroups(), operations);
    }

    /**
     * Edits the channel attributes.
     * Operations should each be a map with the following:
     * - action: Either set or remove
     * - value: The group to modify
     * - key: The tags to add or remove.
     *
     * @param operations An array of operations.
     */
    @ReactMethod
    public void editChannelAttributes(ReadableArray operations) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        applyAttributeOperations(UAirship.shared().getChannel().editAttributes(), operations);
    }

    /**
     * Edits the contact attributes.
     * Operations should each be a map with the following:
     * - action: Either set or remove
     * - value: The group to modify
     * - key: The tags to add or remove.
     *
     * @param operations An array of operations.
     */
    @ReactMethod
    public void editContactAttributes(ReadableArray operations) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        applyAttributeOperations(UAirship.shared().getContact().editAttributes(), operations);
    }

    /**
     * Edit a subscription list.
     *
     * @param subscriptionListUpdates The subscription lists.
     * @deprecated Use {@link #editChannelSubscriptionLists(ReadableArray)} instead.
     */
    @ReactMethod
    @Deprecated
    public void editSubscriptionLists(ReadableArray subscriptionListUpdates) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        editChannelSubscriptionLists(subscriptionListUpdates);
    }

    /**
     * Edit subscription lists associated with the current Channel.
     * <p>
     * List updates should each be a map with the following:
     * - type: Either subscribe or unsubscribe.
     * - listId: ID of the subscription list to subscribe to or unsubscribe from.
     *
     * @param subscriptionListUpdates The subscription lists.
     */
    @ReactMethod
    public void editChannelSubscriptionLists(ReadableArray subscriptionListUpdates) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        SubscriptionListEditor editor = UAirship.shared().getChannel().editSubscriptionLists();

        for (int i = 0; i < subscriptionListUpdates.size(); i++) {
            ReadableMap subscriptionListUpdate = subscriptionListUpdates.getMap(i);
            String listId = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_LISTID);
            String type = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_TYPE);

            if (listId == null || type == null) {
                continue;
            }

            if ("subscribe".equals(type)) {
                editor.subscribe(listId);
            } else if ("unsubscribe".equals(type)) {
                editor.unsubscribe(listId);
            }

        }
        editor.apply();
    }


    /**
     * Edit subscription lists associated with the current Channel.
     * <p>
     * List updates should each be a map with the following:
     * - type: Either subscribe or unsubscribe.
     * - listId: ID of the subscription list to subscribe to or unsubscribe from.
     * - scope: Subscription scope (one of: app, web, sms, email).
     *
     * @param scopedSubscriptionListUpdates The subscription list updates.
     */
    @ReactMethod
    public void editContactSubscriptionLists(ReadableArray scopedSubscriptionListUpdates) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        ScopedSubscriptionListEditor editor = UAirship.shared().getContact().editSubscriptionLists();

        for (int i = 0; i < scopedSubscriptionListUpdates.size(); i++) {
            ReadableMap subscriptionListUpdate = scopedSubscriptionListUpdates.getMap(i);
            String listId = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_LISTID);
            String type = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_TYPE);
            String scopeString = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_SCOPE);

            if (listId == null || type == null || scopeString == null) {
                continue;
            }

            Scope scope;
            try {
                scope = Scope.valueOf(scopeString.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                continue;
            }

            if ("subscribe".equals(type)) {
                editor.subscribe(listId, scope);
            } else if ("unsubscribe".equals(type)) {
                editor.unsubscribe(listId, scope);
            }
        }

        editor.apply();
    }

    /**
     * Associated an identifier to the channel.
     *
     * @param key   The identifier's key.
     * @param value The identifier's value. If the value is null it will be removed from the current
     *              set of associated identifiers.
     */
    @ReactMethod
    public void associateIdentifier(String key, String value) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }


        AssociatedIdentifiers.Editor editor = UAirship.shared().getAnalytics().editAssociatedIdentifiers();

        if (value == null) {
            editor.removeIdentifier(key);
        } else {
            editor.addIdentifier(key, value);
        }

        editor.apply();
    }

    /**
     * Enables/Disables analytics.
     *
     * @param enabled {@code true} to enable analytics, {@code false} to disable.
     */
    @ReactMethod
    public void setAnalyticsEnabled(boolean enabled) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        if (enabled) {
            UAirship.shared().getPrivacyManager().enable(PrivacyManager.FEATURE_ANALYTICS);
        } else {
            UAirship.shared().getPrivacyManager().disable(PrivacyManager.FEATURE_ANALYTICS);
        }
    }

    /**
     * Checks if analytics are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isAnalyticsEnabled(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        promise.resolve(UAirship.shared().getPrivacyManager().isEnabled(PrivacyManager.FEATURE_ANALYTICS));
    }

    /**
     * Initiates screen tracking for a specific app screen, must be called once per tracked screen.
     *
     * @param {String} screen The screen's string identifier.
     */
    @ReactMethod
    public void trackScreen(String screen) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        UAirship.shared().getAnalytics().trackScreen(screen);
    }

    /**
     * Called when the app is listening for an airship event.
     *
     * @param listener The listener type.
     */
    @ReactMethod
    public void onAirshipListenerAdded(String listener) {
        EventEmitter.shared().onAirshipListenerAdded(listener);
    }

    /**
     * Removes and returns foreground events for the given type.
     *
     * @param type    The type.
     * @param promise The promise.
     */
    @ReactMethod
    public void takePendingForegroundEvents(String type, Promise promise) {
        List<Event> events = EventEmitter.shared().takePendingForegroundEvents(type);
        WritableArray array = Arguments.createArray();
        for (Event event : events) {
            array.pushMap(event.getBody());
        }
        promise.resolve(array);
    }

    /**
     * Removes and returns background events for the given type.
     *
     * @param type    The type.
     * @param promise The promise.
     */
    @ReactMethod
    public void takePendingBackgroundEvents(String type, Promise promise) {
        List<Event> events = EventEmitter.shared().takePendingBackgroundEvents(type);
        WritableArray array = Arguments.createArray();
        for (Event event : events) {
            array.pushMap(event.getBody());
        }
        promise.resolve(array);
    }

    enum SubscriptionListType {
        CHANNEL,
        CONTACT
    }

    /**
     * Gets the current subscription lists.
     *
     * @param types   The types of
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getSubscriptionLists(ReadableArray types, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        PluginLogger.debug("getSubscriptionLists(" + types + ")");

        Set<SubscriptionListType> parsedTypes = new HashSet<>();
        if (types != null) {
            for (int i = 0; i < types.size(); i++) {
                try {
                    SubscriptionListType type = SubscriptionListType.valueOf(types.getString(i).toUpperCase(Locale.ROOT));
                    parsedTypes.add(type);
                } catch (Exception e) {
                    promise.reject(e);
                    return;
                }
            }
        }

        if (parsedTypes.isEmpty()) {
            promise.reject(new Exception("Failed to fetch subscription lists, no types."));
            return;
        }

        BG_EXECUTOR.execute(() -> {
            WritableMap resultMap = Arguments.createMap();
            try {
                UAirship ua = UAirship.shared();
                for (SubscriptionListType type : parsedTypes) {
                    switch (type) {
                        case CHANNEL:
                            Set<String> channelSubs = ua.getChannel().getSubscriptionLists(true).get();
                            if (channelSubs == null) {
                                promise.reject(new Exception("Failed to fetch channel subscription lists."));
                                return;
                            }
                            resultMap.putArray("channel", toWritableArray(channelSubs));
                            break;
                        case CONTACT:
                            Map<String, Set<Scope>> contactSubs = ua.getContact().getSubscriptionLists(true).get();
                            if (contactSubs == null) {
                                promise.reject(new Exception("Failed to fetch contact subscription lists."));
                                return;
                            }
                            WritableMap contactSubsMap = Arguments.createMap();
                            for (Map.Entry<String, Set<Scope>> entry : contactSubs.entrySet()) {
                                WritableArray scopesArray = Arguments.createArray();
                                for (Scope s : entry.getValue()) {
                                    scopesArray.pushString(s.toString());
                                }
                                contactSubsMap.putArray(entry.getKey(), scopesArray);
                            }
                            resultMap.putMap("contact", contactSubsMap);
                            break;
                    }
                }
                promise.resolve(resultMap);
            } catch (Exception e) {
                promise.reject(e);
            }
        });
    }

    /**
     * Runs an action.
     *
     * @param name    The action's name.
     * @param value   The action's value.
     * @param promise A JS promise to deliver the action result.
     */
    @ReactMethod
    public void runAction(final String name, Dynamic value, final Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        ActionRunRequest.createRequest(name)
                .setValue(convertDynamic(value))
                .run(new ActionCompletionCallback() {
                    @Override
                    public void onFinish(@NonNull ActionArguments actionArguments, @NonNull ActionResult actionResult) {
                        switch (actionResult.getStatus()) {
                            case STATUS_COMPLETED:
                                promise.resolve(convertJsonValue(actionResult.getValue().toJsonValue()));
                                return;

                            case STATUS_REJECTED_ARGUMENTS:
                                promise.reject("STATUS_REJECTED_ARGUMENTS", "Action rejected arguments.");
                                return;

                            case STATUS_ACTION_NOT_FOUND:
                                promise.reject("STATUS_ACTION_NOT_FOUND", "Action " + name + "not found.");
                                return;

                            case STATUS_EXECUTION_ERROR:
                            default:
                                promise.reject("STATUS_EXECUTION_ERROR", actionResult.getException());
                                return;
                        }
                    }
                });
    }

    /**
     * Badging is not supported on Android. Returns 0 if a badge count is requested on Android.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getBadgeNumber(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        promise.resolve(0);
    }

    /**
     * Displays the default message center.
     */
    @ReactMethod
    public void displayMessageCenter() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        MessageCenter.shared().showMessageCenter();
    }

    /**
     * Dismisses the default message center.
     */
    @ReactMethod
    public void dismissMessageCenter() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, CustomMessageCenterActivity.class)
                    .setAction(CLOSE_MESSAGE_CENTER);
            activity.startActivity(intent);
        }
    }

    /**
     * Display an inbox message in the default message center.
     *
     * @param messageId The id of the message to be displayed.
     * @param promise   The JS promise.
     */
    @ReactMethod
    public void displayMessage(String messageId, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        MessageCenter.shared().showMessageCenter(messageId);
        promise.resolve(true);
    }

    /**
     * Dismisses the currently displayed inbox message.
     */
    @ReactMethod
    public void dismissMessage() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        Activity activity = getCurrentActivity();
        if (activity != null) {
            Intent intent = new Intent(activity, CustomMessageActivity.class)
                    .setAction(CLOSE_MESSAGE_CENTER)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            activity.startActivity(intent);
        }
    }

    /**
     * Retrieves the current inbox messages.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getInboxMessages(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        WritableArray messagesArray = Arguments.createArray();

        for (Message message : MessageCenter.shared().getInbox().getMessages()) {
            WritableMap messageMap = new WritableNativeMap();
            messageMap.putString("title", message.getTitle());
            messageMap.putString("id", message.getMessageId());
            messageMap.putDouble("sentDate", message.getSentDate().getTime());
            messageMap.putString("listIconUrl", message.getListIconUrl());
            messageMap.putBoolean("isRead", message.isRead());
            messageMap.putBoolean("isDeleted", message.isDeleted());

            WritableMap extrasMap = new WritableNativeMap();
            Bundle extras = message.getExtras();
            for (String key : extras.keySet()) {
                String value = String.valueOf(extras.get(key));
                extrasMap.putString(key, value);
            }

            messageMap.putMap("extras", extrasMap);
            messagesArray.pushMap(messageMap);
        }

        promise.resolve(messagesArray);
    }

    /**
     * Deletes an inbox message.
     *
     * @param messageId The id of the message to be deleted.
     * @param promise   The JS promise.
     */
    @ReactMethod
    public void deleteInboxMessage(String messageId, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        Message message = MessageCenter.shared().getInbox().getMessage(messageId);

        if (message == null) {
            promise.reject("STATUS_MESSAGE_NOT_FOUND", "Message not found");
        } else {
            message.delete();
            promise.resolve(true);
        }
    }

    /**
     * Marks an inbox message as read.
     *
     * @param messageId The id of the message to be marked as read.
     * @param promise   The JS promise.
     */
    @ReactMethod
    public void markInboxMessageRead(String messageId, Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        Message message = MessageCenter.shared().getInbox().getMessage(messageId);

        if (message == null) {
            promise.reject("STATUS_MESSAGE_NOT_FOUND", "Message not found.");
        } else {
            message.markRead();
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void clearNotifications() {
        NotificationManagerCompat.from(UAirship.getApplicationContext()).cancelAll();
    }

    @ReactMethod
    public void clearNotification(String identifier) {
        if (UAStringUtil.isEmpty(identifier)) {
            return;
        }

        String[] parts = identifier.split(":", 2);
        if (parts.length == 0) {
            Log.e(getName(), "Invalid identifier: " + identifier);
            return;
        }

        int id;
        String tag = null;
        try {
            id = Integer.parseInt(parts[0]);
        } catch (NumberFormatException e) {
            Log.e(getName(), "Invalid identifier: " + identifier);
            return;
        }

        if (parts.length == 2) {
            tag = parts[1];
        }

        NotificationManagerCompat.from(UAirship.getApplicationContext()).cancel(tag, id);
    }


    /**
     * Retrieves the current inbox messages.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getActiveNotifications(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            WritableArray notifications = Arguments.createArray();

            NotificationManager notificationManager = (NotificationManager) UAirship.getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            StatusBarNotification[] statusBarNotifications = notificationManager.getActiveNotifications();

            for (StatusBarNotification statusBarNotification : statusBarNotifications) {
                int id = statusBarNotification.getId();
                String tag = statusBarNotification.getTag();

                PushMessage pushMessage;
                Bundle extras = statusBarNotification.getNotification().extras;
                Bundle bundle = extras == null ? null : extras.getBundle("push_message");

                if (bundle != null) {
                    pushMessage = new PushMessage(bundle);
                } else {
                    pushMessage = new PushMessage(new Bundle());
                }

                notifications.pushMap(new PushReceivedEvent(pushMessage, id, tag).getBody());
            }

            promise.resolve(notifications);
        } else {
            promise.reject("UNSUPPORTED", "Getting active notifications is only supported on Marshmallow and newer devices.");
        }
    }


    /**
     * Forces the inbox to refresh. This is normally not needed as the inbox will automatically refresh on foreground or when a push arrives thats associated with a message.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void refreshInbox(final Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        MessageCenter.shared().getInbox().fetchMessages(new Inbox.FetchMessagesCallback() {
            @Override
            public void onFinished(boolean success) {
                if (success) {
                    promise.resolve(true);
                } else {
                    promise.reject("STATUS_DID_NOT_REFRESH", "Inbox failed to refresh");
                }
            }
        });
    }

    /**
     * Gets the count of Unread messages in the inbox.
     */
    @ReactMethod
    public void getUnreadMessagesCount(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }

        promise.resolve(MessageCenter.shared().getInbox().getUnreadCount());
    }

    /**
     * Sets the default behavior when the message center is launched from a push notification. If set to false the message center must be manually launched.
     *
     * @param enabled {@code true} to automatically launch the default message center, {@code false} to disable.
     */
    @ReactMethod
    public void setAutoLaunchDefaultMessageCenter(boolean enabled) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        preferences.setAutoLaunchMessageCenter(enabled);
    }

    /**
     * Overriding the locale.
     *
     * @param localeIdentifier The locale identifier.
     */
    @ReactMethod
    public void setCurrentLocale(String localeIdentifier) {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        UAirship.shared().setLocaleOverride(new Locale(localeIdentifier));
    }

    /**
     * Getting the locale currently used by Airship.
     */
    @ReactMethod
    public void getCurrentLocale(Promise promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return;
        }
        Locale airshipLocale = UAirship.shared().getLocale();
        promise.resolve(airshipLocale.getLanguage());
    }

    /**
     * Resets the current locale.
     */
    @ReactMethod
    public void clearLocale() {
        UAirship.shared().setLocaleOverride(null);
    }

    /**
     * Sets the minimum number of seconds between IAA displays.
     */
    @ReactMethod
    public void setInAppAutomationDisplayInterval(double seconds) {
        InAppAutomation.shared().getInAppMessageManager().setDisplayInterval((long) seconds, TimeUnit.SECONDS);
    }

    /**
     * Helper method to apply tag group changes.
     *
     * @param editor     The tag group editor.
     * @param operations A list of tag group operations.
     */
    private static void applyTagGroupOperations(@NonNull TagGroupsEditor editor, @NonNull ReadableArray operations) {
        for (int i = 0; i < operations.size(); i++) {
            ReadableMap operation = operations.getMap(i);
            if (operation == null) {
                continue;
            }

            String group = operation.getString(TAG_OPERATION_GROUP_NAME);
            ReadableArray tags = operation.getArray(TAG_OPERATION_TAGS);
            String operationType = operation.getString(TAG_OPERATION_TYPE);

            if (group == null || tags == null || operationType == null) {
                continue;
            }

            HashSet<String> tagSet = new HashSet<>();
            for (int j = 0; j < tags.size(); j++) {
                String tag = tags.getString(j);
                if (tag != null) {
                    tagSet.add(tags.getString(j));
                }
            }

            if (TAG_OPERATION_ADD.equals(operationType)) {
                editor.addTags(group, tagSet);
            } else if (TAG_OPERATION_REMOVE.equals(operationType)) {
                editor.removeTags(group, tagSet);
            } else if (TAG_OPERATION_SET.equals(operationType)) {
                editor.setTags(group, tagSet);
            }
        }

        editor.apply();
    }

    /**
     * Helper method to apply attribute changes.
     *
     * @param editor     The attribute editor.
     * @param operations A list of attribute operations.
     */
    private static void applyAttributeOperations(@NonNull AttributeEditor editor, @NonNull ReadableArray operations) {
        for (int i = 0; i < operations.size(); i++) {
            ReadableMap operation = operations.getMap(i);
            if (operation == null) {
                continue;
            }

            String action = operation.getString(ATTRIBUTE_OPERATION_TYPE);
            String key = operation.getString(ATTRIBUTE_OPERATION_KEY);

            if (action == null || key == null) {
                continue;
            }

            if (ATTRIBUTE_OPERATION_SET.equals(action)) {
                String valueType = (String) operation.getString(ATTRIBUTE_OPERATION_VALUETYPE);
                if ("string".equals(valueType)) {
                    String value = operation.getString(ATTRIBUTE_OPERATION_VALUE);
                    if (value == null) {
                        continue;
                    }
                    editor.setAttribute(key, value);
                } else if ("number".equals(valueType)) {
                    double value = operation.getDouble(ATTRIBUTE_OPERATION_VALUE);
                    editor.setAttribute(key, value);
                } else if ("date".equals(valueType)) {
                    double value = operation.getDouble(ATTRIBUTE_OPERATION_VALUE);
                    // JavaScript's date type doesn't pass through the JS to native bridge. Dates are instead serialized as milliseconds since epoch.
                    editor.setAttribute(key, new Date((long) value));
                }
            } else if (ATTRIBUTE_OPERATION_REMOVE.equals(action)) {
                editor.removeAttribute(key);
            }
        }

        editor.apply();
    }

    /**
     * Helper to determine user notifications authorization status
     */
    void checkOptIn() {
        if (!Utils.ensureAirshipReady()) {
            return;
        }

        boolean optIn = UAirship.shared().getPushManager().isOptIn();

        if (preferences.getOptInStatus() != optIn) {
            preferences.setOptInStatus(optIn);
            Event optInEvent = new NotificationOptInEvent(optIn);
            EventEmitter.shared().sendEvent(optInEvent);
        }
    }

    /**
     * Helper method to parse a String features array into {@link PrivacyManager.Feature}.
     *
     * @param features The String features to parse.
     * @return The resulting feature flag.
     */
    @PrivacyManager.Feature
    private int parseFeatures(@NonNull ReadableArray features) throws IllegalArgumentException {
        int result = PrivacyManager.FEATURE_NONE;
        for (int i = 0; i < features.size(); i++) {
            result |= Utils.parseFeature(features.getString(i));
        }
        return result;
    }

    private static WritableArray toWritableArray(Collection<String> strings) {
        WritableArray result = Arguments.createArray();
        for (String value : strings) {
            result.pushString(value);
        }
        return result;
    }
}

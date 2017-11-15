/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.Manifest;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.service.notification.StatusBarNotification;
import android.support.annotation.NonNull;
import android.support.v4.app.NotificationManagerCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.os.AsyncTaskCompat;
import android.util.Log;

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
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionCompletionCallback;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.ActionRunRequest;
import com.urbanairship.actions.LandingPageActivity;
import com.urbanairship.analytics.AssociatedIdentifiers;
import com.urbanairship.push.PushMessage;
import com.urbanairship.push.TagGroupsEditor;
import com.urbanairship.reactnative.events.NotificationOptInEvent;
import com.urbanairship.reactnative.events.PushReceivedEvent;
import com.urbanairship.richpush.RichPushInbox;
import com.urbanairship.richpush.RichPushMessage;
import com.urbanairship.util.UAStringUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.HashSet;

import static com.urbanairship.actions.ActionResult.STATUS_ACTION_NOT_FOUND;
import static com.urbanairship.actions.ActionResult.STATUS_COMPLETED;
import static com.urbanairship.actions.ActionResult.STATUS_EXECUTION_ERROR;
import static com.urbanairship.actions.ActionResult.STATUS_REJECTED_ARGUMENTS;
import static com.urbanairship.reactnative.Utils.convertDynamic;
import static com.urbanairship.reactnative.Utils.convertJsonValue;

/**
 * React module for Urban Airship.
 */
public class UrbanAirshipReactModule extends ReactContextBaseJavaModule {

    private static final String TAG_OPERATION_GROUP_NAME = "group";
    private static final String TAG_OPERATION_TYPE = "operationType";
    private static final String TAG_OPERATION_TAGS = "tags";

    private static final String TAG_OPERATION_ADD = "add";
    private static final String TAG_OPERATION_REMOVE = "remove";

    private static final String QUIET_TIME_START_HOUR = "startHour";
    private static final String QUIET_TIME_START_MINUTE = "startMinute";
    private static final String QUIET_TIME_END_HOUR = "endHour";
    private static final String QUIET_TIME_END_MINUTE = "endMinute";

    static final String AUTO_LAUNCH_MESSAGE_CENTER = "com.urbanairship.auto_launch_message_center";
    static final String CLOSE_MESSAGE_CENTER = "CLOSE";

    /**
     * Default constructor.
     *
     * @param reactContext The react context.
     */
    public UrbanAirshipReactModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public void initialize() {
        super.initialize();

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                // If the opt-in status changes send an event
                checkOptIn(getReactApplicationContext());
            }

            @Override
            public void onHostPause() {

            }

            @Override
            public void onHostDestroy() {

            }

        });
    }

    @Override
    public String getName() {
        return "UrbanAirshipReactModule";
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
     * Checks if user notifications are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isUserNotificationsEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getUserNotificationsEnabled());
    }

    /**
     * Checks if the app's notifications are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isUserNotificationsOptedIn(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().isOptIn());
    }

    /**
     * Returns the channel ID.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getChannelId(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getChannelId());
    }

    /**
     * Sets the named user.
     *
     * @param namedUser The named user ID.
     */
    @ReactMethod
    public void setNamedUser(String namedUser) {
        UAirship.shared().getNamedUser().setId(namedUser);
    }

    /**
     * Gets the named user.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getNamedUser(Promise promise) {
        promise.resolve(UAirship.shared().getNamedUser().getId());
    }

    /**
     * Adds a channel tag.
     *
     * @param tag The tag to add.
     */
    @ReactMethod
    public void addTag(String tag) {
        if (tag != null) {
            UAirship.shared().getPushManager().editTags().addTag(tag).apply();
        }
    }

    /**
     * Removes a channel tag.
     *
     * @param tag The tag to remove.
     */
    @ReactMethod
    public void removeTag(String tag) {
        if (tag != null) {
            UAirship.shared().getPushManager().editTags().removeTag(tag).apply();
        }
    }

    /**
     * Gets the current channel tags.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getTags(Promise promise) {
        WritableArray array = Arguments.createArray();
        for (String tag : UAirship.shared().getPushManager().getTags()) {
            array.pushString(tag);
        }

        promise.resolve(array);
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
        applyTagGroupOperations(UAirship.shared().getPushManager().editTagGroups(), operations);
    }

    /**
     * Edits the named user tag groups.
     * Operations should each be a map with the following:
     * - operationType: Either add or remove
     * - group: The group to modify
     * - tags: The tags to add or remove.
     *
     * @param operations An array of operations.
     */
    @ReactMethod
    public void editNamedUserTagGroups(ReadableArray operations) {
        applyTagGroupOperations(UAirship.shared().getNamedUser().editTagGroups(), operations);
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
        UAirship.shared().getAnalytics().setEnabled(enabled);
    }

    /**
     * Checks if analytics are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isAnalyticsEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getAnalytics().isEnabled());
    }

    /**
     * Enables/Disables location updates.
     *
     * @param enabled {@code true} to enable location updates, {@code false} to disable.
     */
    @ReactMethod
    public void setLocationEnabled(boolean enabled) {
        if (enabled && shouldRequestLocationPermissions()) {
            RequestPermissionsTask task = new RequestPermissionsTask(getReactApplicationContext(), new RequestPermissionsTask.Callback() {
                @Override
                public void onResult(boolean enabled) {
                    if (enabled) {
                        UAirship.shared().getLocationManager().setLocationUpdatesEnabled(true);
                    }
                }
            });

            AsyncTaskCompat.executeParallel(task, Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION);
        } else {
            UAirship.shared().getLocationManager().setLocationUpdatesEnabled(enabled);
        }
    }

    /**
     * Checks if location updates are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isLocationEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getLocationManager().isLocationUpdatesEnabled());
    }

    /**
     * Allows/Disallows background location.
     *
     * @param enabled {@code true} to allow background location., {@code false} to disallow.
     */
    @ReactMethod
    public void setBackgroundLocationAllowed(boolean enabled) {
        UAirship.shared().getLocationManager().setBackgroundLocationAllowed(enabled);
    }

    /**
     * Checks if background location updates are allowed.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isBackgroundLocationAllowed(Promise promise) {
        promise.resolve(UAirship.shared().getLocationManager().isBackgroundLocationAllowed());
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
     * Sets the quiet time.
     * Map should be in the form of:
     * - startHour
     * - startMinute
     * - endHour
     * - endMinute
     *
     * @param map The quiet time map.
     */
    @ReactMethod
    public void setQuietTime(ReadableMap map) {
        Calendar start = new GregorianCalendar();
        Calendar end = new GregorianCalendar();

        int startHour = map.hasKey(QUIET_TIME_START_HOUR) ? map.getInt(QUIET_TIME_START_HOUR) : 0;
        int startMinute = map.hasKey(QUIET_TIME_START_MINUTE) ? map.getInt(QUIET_TIME_START_MINUTE) : 0;

        int endHour = map.hasKey(QUIET_TIME_END_HOUR) ? map.getInt(QUIET_TIME_END_HOUR) : 0;
        int endMinute = map.hasKey(QUIET_TIME_END_MINUTE) ? map.getInt(QUIET_TIME_END_MINUTE) : 0;

        start.set(Calendar.HOUR_OF_DAY, startHour);
        start.set(Calendar.MINUTE, startMinute);
        end.set(Calendar.HOUR_OF_DAY, endHour);
        end.set(Calendar.MINUTE, endMinute);
        UAirship.shared().getPushManager().setQuietTimeInterval(start.getTime(), end.getTime());
    }

    /**
     * Gets the current quiet time.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getQuietTime(Promise promise) {
        Date[] quietTime = UAirship.shared().getPushManager().getQuietTimeInterval();

        int startHour = 0;
        int startMinute = 0;
        int endHour = 0;
        int endMinute = 0;

        if (quietTime != null) {
            Calendar start = new GregorianCalendar();
            Calendar end = new GregorianCalendar();
            start.setTime(quietTime[0]);
            end.setTime(quietTime[1]);

            startHour = start.get(Calendar.HOUR_OF_DAY);
            startMinute = start.get(Calendar.MINUTE);
            endHour = end.get(Calendar.HOUR_OF_DAY);
            endMinute = end.get(Calendar.MINUTE);
        }

        WritableMap map = Arguments.createMap();
        map.putInt(QUIET_TIME_START_HOUR, startHour);
        map.putInt(QUIET_TIME_START_MINUTE, startMinute);
        map.putInt(QUIET_TIME_END_HOUR, endHour);
        map.putInt(QUIET_TIME_END_MINUTE, endMinute);

        promise.resolve(map);
    }

    /**
     * Enables/Disables quiet time
     *
     * @param enabled {@code true} to enable quiet time, {@code false} to disable.
     */
    @ReactMethod
    public void setQuietTimeEnabled(Boolean enabled) {
        UAirship.shared().getPushManager().setQuietTimeEnabled(enabled);
    }

    /**
     * Checks if quiet time is enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void isQuietTimeEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().isQuietTimeEnabled());
    }

    /**
     * Badging is not supported on Android. Returns 0 if a badge count is requested on Android.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getBadgeNumber(Promise promise) {
        promise.resolve(0);
    }

    /**
     * Displays the default message center.
     */
    @ReactMethod
    public void displayMessageCenter() {
        UAirship.shared().getInbox().startInboxActivity();
    }

    /**
     * Dismisses the default message center.
     */
    @ReactMethod
    public void dismissMessageCenter() {
        Intent intent = new Intent(this.getCurrentActivity(), CustomMessageCenterActivity.class)
                .setAction(CLOSE_MESSAGE_CENTER);
        this.getCurrentActivity().startActivity(intent);
    }

    /**
     * Display an inbox message in the default message center.
     *
     * @param messageId The id of the message to be displayed.
     * @param overlay Display the message in an overlay.
     * @param promise The JS promise.
     */
    @ReactMethod
    public void displayMessage(String messageId, boolean overlay, Promise promise) {
        RichPushMessage message = UAirship.shared().getInbox().getMessage(messageId);

        if (message == null) {
            promise.reject("STATUS_MESSAGE_NOT_FOUND", "Message not found.");
        } else {
            if (overlay == true) {
                Intent intent = new Intent(this.getReactApplicationContext().getCurrentActivity(), CustomLandingPageActivity.class)
                        .setAction(RichPushInbox.VIEW_MESSAGE_INTENT_ACTION)
                        .setPackage(this.getReactApplicationContext().getCurrentActivity().getPackageName())
                        .setData(Uri.fromParts(RichPushInbox.MESSAGE_DATA_SCHEME, messageId, null))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);

                this.getReactApplicationContext().startActivity(intent);
            } else {
                Intent intent = new Intent(this.getReactApplicationContext().getCurrentActivity(), CustomMessageActivity.class)
                        .setAction(RichPushInbox.VIEW_MESSAGE_INTENT_ACTION)
                        .setPackage(this.getReactApplicationContext().getCurrentActivity().getPackageName())
                        .setData(Uri.fromParts(RichPushInbox.MESSAGE_DATA_SCHEME, messageId, null))
                        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                
                this.getReactApplicationContext().startActivity(intent);
            }
        }
    }
    
    /**
     * Dismisses the currently displayed inbox message.
     *
     * @param overlay Dismiss the message from an overlay.
     */
    @ReactMethod
    public void dismissMessage(boolean overlay) {
        if (overlay){
            Intent intent = new Intent(this.getCurrentActivity(), CustomLandingPageActivity.class)
                    .setAction(CLOSE_MESSAGE_CENTER)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            this.getCurrentActivity().startActivity(intent);
        } else {
            Intent intent = new Intent(this.getCurrentActivity(), CustomMessageActivity.class)
                    .setAction(CLOSE_MESSAGE_CENTER)
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            this.getCurrentActivity().startActivity(intent);
        }
    }

    /**
     * Retrieves the current inbox messages.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    public void getInboxMessages(Promise promise) {
        WritableArray messagesArray = Arguments.createArray();

        for (RichPushMessage message : UAirship.shared().getInbox().getMessages()) {
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
                String value = extras.get(key).toString();
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
     * @param promise The JS promise.
     */
    @ReactMethod
    public void deleteInboxMessage(String messageId, Promise promise) {
        RichPushMessage message = UAirship.shared().getInbox().getMessage(messageId);

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
     * @param promise The JS promise.
     */
    @ReactMethod
    public void markInboxMessageRead(String messageId, Promise promise) {
        RichPushMessage message = UAirship.shared().getInbox().getMessage(messageId);

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
            id = Integer.valueOf(parts[0]);
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
                if (extras != null && extras.containsKey("push_message")) {
                    pushMessage = new PushMessage(extras.getBundle("push_message"));
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
    public  void refreshInbox(final Promise promise)  {
        UAirship.shared().getInbox().fetchMessages(new RichPushInbox.FetchMessagesCallback() {
            @Override
            public void onFinished(boolean success) {
                if (success) {
                    promise.resolve(true);
                } else {
                   promise.reject("STATUS_DID_NOT_REFRESH","Inbox failed to refresh");
                }
            }
        });
    }

    /**
     * Sets the default behavior when the message center is launched from a push notification. If set to false the message center must be manually launched.
     *
     * @param enabled {@code true} to automatically launch the default message center, {@code false} to disable.
     */
    @ReactMethod
    public void setAutoLaunchDefaultMessageCenter(boolean enabled)  {
        PreferenceManager.getDefaultSharedPreferences(UAirship.getApplicationContext())
                .edit()
                .putBoolean(AUTO_LAUNCH_MESSAGE_CENTER, enabled)
                .apply();
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
            }
        }

        editor.apply();
    }

    /**
     * Helper to determine if location permissions should be requested or not.
     *
     * @return {@code true} if permissions should be requested, otherwise {@code false}.
     */
    private boolean shouldRequestLocationPermissions() {
        if (Build.VERSION.SDK_INT < 23) {
            return false;
        }

        return ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_DENIED &&
                ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_DENIED;
    }

    /**
     * Helper to determine user notifications authorization status
     *
     * @param context The application context.
     */
    static protected void checkOptIn(Context context) {
        boolean optIn = UAirship.shared().getPushManager().isOptIn();

        if (ReactAirshipPreferences.shared().getOptInStatus(context) != optIn) {
            ReactAirshipPreferences.shared().setOptInStatus(optIn, context);

            Event optInEvent = new NotificationOptInEvent(optIn);
            EventEmitter.shared().sendEvent(context, optInEvent);
        }
    }

}

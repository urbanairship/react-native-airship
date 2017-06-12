/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.support.annotation.NonNull;
import android.support.v4.content.ContextCompat;
import android.support.v4.os.AsyncTaskCompat;

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
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionCompletionCallback;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.ActionRunRequest;
import com.urbanairship.analytics.AssociatedIdentifiers;
import com.urbanairship.push.TagGroupsEditor;
import com.urbanairship.reactnative.events.NotificationOptInEvent;

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

    private static final String SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative";
    private static final String NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY";

    private static final String TAG_OPERATION_GROUP_NAME = "group";
    private static final String TAG_OPERATION_TYPE = "operationType";
    private static final String TAG_OPERATION_TAGS = "tags";

    private static final String TAG_OPERATION_ADD = "add";
    private static final String TAG_OPERATION_REMOVE = "remove";

    private static final String QUIET_TIME_START_HOUR = "startHour";
    private static final String QUIET_TIME_START_MINUTE = "startMinute";
    private static final String QUIET_TIME_END_HOUR = "endHour";
    private static final String QUIET_TIME_END_MINUTE = "endMinute";

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

        final SharedPreferences preferences = getReactApplicationContext().getSharedPreferences(SHARED_PREFERENCES_FILE, Context.MODE_PRIVATE);

        getReactApplicationContext().addLifecycleEventListener(new LifecycleEventListener() {
            @Override
            public void onHostResume() {
                // If the opt-in status changes send an event
                boolean optIn = UAirship.shared().getPushManager().isOptIn();
                if (preferences.getBoolean(NOTIFICATIONS_OPT_IN_KEY, true) != optIn) {
                    preferences.edit().putBoolean(NOTIFICATIONS_OPT_IN_KEY, optIn).apply();

                    Event event = new NotificationOptInEvent(optIn);
                    EventEmitter.shared().sendEvent(getReactApplicationContext(), event);
                }
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

}



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
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionCompletionCallback;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.ActionRunRequest;
import com.urbanairship.analytics.AssociatedIdentifiers;
import com.urbanairship.push.TagGroupsEditor;

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
                boolean optIn = UAirship.shared().getPushManager().isOptIn();
                if (preferences.getBoolean(NOTIFICATIONS_OPT_IN_KEY, true) != optIn) {
                    preferences.edit().putBoolean(NOTIFICATIONS_OPT_IN_KEY, optIn).apply();
                    EventEmitter.shared().notifyNotificationOptInStatus(UAirship.shared().getPushManager().isOptIn());
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

    @ReactMethod
    public void setUserNotificationsEnabled(boolean enabled) {
        UAirship.shared().getPushManager().setUserNotificationsEnabled(enabled);
    }

    @ReactMethod
    public void isUserNotificationsEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getUserNotificationsEnabled());
    }

    @ReactMethod
    public void isUserNotificationsOptedIn(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().isOptIn());
    }

    @ReactMethod
    public void getChannelId(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getChannelId());
    }

    @ReactMethod
    public void setNamedUser(String namedUser) {
        UAirship.shared().getNamedUser().setId(namedUser);
    }

    @ReactMethod
    public void getNamedUser(Promise promise) {
        promise.resolve(UAirship.shared().getNamedUser().getId());
    }

    @ReactMethod
    public void addTag(String tag) {
        UAirship.shared().getPushManager().editTags().addTag(tag).apply();
    }

    @ReactMethod
    public void removeTag(String tag) {
        UAirship.shared().getPushManager().editTags().removeTag(tag).apply();
    }

    @ReactMethod
    public void getTags(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().getTags());
    }

    @ReactMethod
    public void editChannelTagGroups(ReadableArray operations) {
        applyTagGroupOperations(UAirship.shared().getPushManager().editTagGroups(), operations);
    }

    @ReactMethod
    public void editNamedUserTagGroups(ReadableArray operations) {
        applyTagGroupOperations(UAirship.shared().getNamedUser().editTagGroups(), operations);
    }

    @ReactMethod
    public void associateIdentifier(String key, String id) {
        AssociatedIdentifiers.Editor editor = UAirship.shared().getAnalytics().editAssociatedIdentifiers();

        if (id == null) {
            editor.removeIdentifier(key);
        } else {
            editor.addIdentifier(key, id);
        }

        editor.apply();
    }

    @ReactMethod
    public void setAnalyticsEnabled(boolean enabled) {
        UAirship.shared().getAnalytics().setEnabled(enabled);
    }

    @ReactMethod
    public void isAnalyticsEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getAnalytics().isEnabled());
    }

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

            AsyncTaskCompat.executeParallel(task, Manifest.permission.ACCESS_COARSE_LOCATION,  Manifest.permission.ACCESS_FINE_LOCATION);
        } else {
            UAirship.shared().getLocationManager().setLocationUpdatesEnabled(enabled);
        }
    }

    @ReactMethod
    public void isLocationEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getLocationManager().isLocationUpdatesEnabled());
    }

    @ReactMethod
    public void setBackgroundLocationAllowed(boolean enabled) {
        UAirship.shared().getLocationManager().setBackgroundLocationAllowed(enabled);
    }

    @ReactMethod
    public void isBackgroundLocationAllowed(Promise promise) {
        promise.resolve(UAirship.shared().getLocationManager().isBackgroundLocationAllowed());
    }

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

    @ReactMethod
    public void setQuietTimeEnabled(Boolean enabled) {
        UAirship.shared().getPushManager().setQuietTimeEnabled(enabled);
    }

    @ReactMethod
    public void isQuietTimeEnabled(Promise promise) {
        promise.resolve(UAirship.shared().getPushManager().isQuietTimeEnabled());
    }

    private static void applyTagGroupOperations(TagGroupsEditor editor, ReadableArray operations) {
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


    private boolean shouldRequestLocationPermissions() {
        if (Build.VERSION.SDK_INT < 23) {
            return false;
        }

        return ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_DENIED &&
                ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_DENIED;
    }
}



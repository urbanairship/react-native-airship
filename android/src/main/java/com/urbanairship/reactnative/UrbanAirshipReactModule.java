/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.content.SharedPreferences;
import android.support.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionCompletionCallback;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.ActionRunRequest;
import com.urbanairship.analytics.AssociatedIdentifiers;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
import com.urbanairship.push.TagGroupsEditor;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import static com.urbanairship.actions.ActionResult.STATUS_ACTION_NOT_FOUND;
import static com.urbanairship.actions.ActionResult.STATUS_COMPLETED;
import static com.urbanairship.actions.ActionResult.STATUS_EXECUTION_ERROR;
import static com.urbanairship.actions.ActionResult.STATUS_REJECTED_ARGUMENTS;

public class UrbanAirshipReactModule extends ReactContextBaseJavaModule {


    private static final String SHARED_PREFERENCES_FILE = "com.urbanairship.reactnative";
    private static final String NOTIFICATIONS_OPT_IN_KEY = "NOTIFICATIONS_OPT_IN_KEY";

    private static final String TAG_OPERATION_GROUP_NAME = "group";
    private static final String TAG_OPERATION_TYPE = "operationType";
    private static final String TAG_OPERATION_TAGS = "tags";

    private static final String TAG_OPERATION_ADD = "add";
    private static final String TAG_OPERATION_REMOVE = "remove";




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
        UAirship.shared().getLocationManager().setLocationUpdatesEnabled(enabled);
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
    public void runAction(String name, Dynamic value, final Promise promise) {
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
                                promise.reject("STATUS_ACTION_NOT_FOUND", "Action not found.");
                                return;

                            case STATUS_EXECUTION_ERROR:
                            default:
                                promise.reject("STATUS_EXECUTION_ERROR", actionResult.getException());
                                return;
                        }
                    }
                });
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


    private static JsonValue convertDynamic(Dynamic object) {
        if (object == null) {
            return JsonValue.NULL;
        }

        switch (object.getType()) {
            case Null:
                return JsonValue.NULL;

            case Boolean:
                return JsonValue.wrapOpt(object.asBoolean());

            case String:
                return JsonValue.wrapOpt(object.asString());

            case Number:
                return JsonValue.wrapOpt(object.asDouble());

            case Map:
                ReadableMap map = (ReadableMap) object;
                JsonMap.Builder mapBuilder = JsonMap.newBuilder();

                ReadableMapKeySetIterator iterator = map.keySetIterator();
                while (iterator.hasNextKey()) {
                    String key = iterator.nextKey();
                    mapBuilder.putOpt(key, convertDynamic(map.getDynamic(key)));
                }

                return mapBuilder.build().toJsonValue();

            case Array:
                List<JsonValue> jsonValues = new ArrayList<>();
                ReadableArray array = object.asArray();
                for (int i = 0; i < array.size(); i++) {
                    jsonValues.add(convertDynamic(array.getDynamic(i)));
                }

                return JsonValue.wrapOpt(jsonValues);

            default:
                return JsonValue.NULL;
        }
    }


    private static Object convertJsonValue(JsonValue value) {
        if (value.isNull()) {
            return null;
        }

        if (value.isJsonList()) {
            WritableArray array = Arguments.createArray();
            for (JsonValue arrayValue : value.getList()) {
                if (arrayValue.isNull()) {
                    array.pushNull();
                    continue;
                }

                if (arrayValue.isBoolean()) {
                    array.pushBoolean(arrayValue.getBoolean(false));
                    continue;
                }

                if (arrayValue.isInteger()) {
                    array.pushInt(arrayValue.getInt(0));
                    continue;
                }

                if (arrayValue.isDouble() || arrayValue.isNumber()) {
                    array.pushDouble(arrayValue.getDouble(0));
                    continue;
                }

                if (arrayValue.isString()) {
                    array.pushString(arrayValue.getString());
                    continue;
                }

                if (arrayValue.isJsonList()) {
                    array.pushArray((WritableArray) convertJsonValue(arrayValue));
                    continue;
                }

                if (arrayValue.isJsonMap()) {
                    array.pushMap((WritableMap) convertJsonValue(arrayValue));
                    continue;
                }
            }

            return array;
        }

        if (value.isJsonMap()) {
            WritableMap map = Arguments.createMap();
            for (Map.Entry<String, JsonValue> entry : value.getMap().entrySet()) {

                String key = entry.getKey();
                JsonValue mapValue = entry.getValue();

                if (mapValue.isNull()) {
                    map.putNull(key);
                    continue;
                }

                if (mapValue.isBoolean()) {
                    map.putBoolean(key, mapValue.getBoolean(false));
                    continue;
                }

                if (mapValue.isInteger()) {
                    map.putInt(key, mapValue.getInt(0));
                    continue;
                }

                if (mapValue.isDouble() || mapValue.isNumber()) {
                    map.putDouble(key, mapValue.getDouble(0));
                    continue;
                }

                if (mapValue.isString()) {
                    map.putString(key, mapValue.getString());
                    continue;
                }

                if (mapValue.isJsonList()) {
                    map.putArray(key, (WritableArray) convertJsonValue(mapValue));
                    continue;
                }

                if (mapValue.isJsonMap()) {
                    map.putMap(key, (WritableMap) convertJsonValue(mapValue));
                    continue;
                }
            }

            return map;
        }

        return value.getValue();
    }
}



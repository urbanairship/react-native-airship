package com.urbanairship.reactnative;

import android.content.Context;
import android.graphics.Color;

import androidx.annotation.ColorInt;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.PrivacyManager;
import com.urbanairship.UAirship;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;
import com.urbanairship.util.UAStringUtil;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Module utils.
 */
public class Utils {

    private static final Map<String, Integer> featureMap = new HashMap<>();
    static {
        featureMap.put("FEATURE_NONE", PrivacyManager.FEATURE_NONE);
        featureMap.put("FEATURE_IN_APP_AUTOMATION", PrivacyManager.FEATURE_IN_APP_AUTOMATION);
        featureMap.put("FEATURE_MESSAGE_CENTER", PrivacyManager.FEATURE_MESSAGE_CENTER);
        featureMap.put("FEATURE_PUSH", PrivacyManager.FEATURE_PUSH);
        featureMap.put("FEATURE_CHAT", PrivacyManager.FEATURE_CHAT);
        featureMap.put("FEATURE_ANALYTICS", PrivacyManager.FEATURE_ANALYTICS);
        featureMap.put("FEATURE_TAGS_AND_ATTRIBUTES", PrivacyManager.FEATURE_TAGS_AND_ATTRIBUTES);
        featureMap.put("FEATURE_CONTACTS", PrivacyManager.FEATURE_CONTACTS);
        featureMap.put("FEATURE_LOCATION", PrivacyManager.FEATURE_LOCATION);
        featureMap.put("FEATURE_ALL", PrivacyManager.FEATURE_ALL);
    }

    /**
     * Converts a dynamic object into a {@link JsonValue}.
     *
     * @param object The dynamic object.
     * @return A {@link JsonValue}.
     */
    public static JsonValue convertDynamic(Dynamic object) {
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
                ReadableMap map = object.asMap();
                return convertMap(map).toJsonValue();

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

    public static JsonMap convertMap(@Nullable ReadableMap map) {
        if (map == null) {
            return JsonMap.EMPTY_MAP;
        }

        JsonMap.Builder mapBuilder = JsonMap.newBuilder();
        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            mapBuilder.putOpt(key, convertDynamic(map.getDynamic(key)));
        }

        return mapBuilder.build();
    }

    /**
     * Gets a resource value by name.
     *
     * @param context        The context.
     * @param resourceName   The resource name.
     * @param resourceFolder The resource folder.
     * @return The resource ID or 0 if not found.
     */
    public static int getNamedResource(Context context, @NonNull String resourceName, @NonNull String resourceFolder) {
        if (!UAStringUtil.isEmpty(resourceName)) {
            int id = context.getResources().getIdentifier(resourceName, resourceFolder, context.getPackageName());
            if (id != 0) {
                return id;
            } else {
                PluginLogger.error("Unable to find resource with name: %s", resourceName);
            }
        }
        return 0;
    }

    /**
     * Gets a hex color as a color int.
     *
     * @param hexColor     The hex color.
     * @param defaultColor Default value if the conversion was not successful.
     * @return The color int.
     */
    @ColorInt
    public static int getHexColor(@NonNull String hexColor, @ColorInt int defaultColor) {
        if (!UAStringUtil.isEmpty(hexColor)) {
            try {
                return Color.parseColor(hexColor);
            } catch (IllegalArgumentException e) {
                PluginLogger.error(e, "Unable to parse color: %s", hexColor);
            }
        }
        return defaultColor;
    }


    /**
     * Converts a JsonValue into either a WritableArray, WritableMap, or primitive type.
     *
     * @param value The JsonValue.
     * @return The converted object.
     */
    public static Object convertJsonValue(JsonValue value) {
        if (value.isNull()) {
            return null;
        }

        if (value.isJsonList()) {
            WritableArray array = Arguments.createArray();
            for (JsonValue arrayValue : value.optList()) {
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
                }
            }

            return array;
        }

        if (value.isJsonMap()) {
            WritableMap map = Arguments.createMap();
            for (Map.Entry<String, JsonValue> entry : value.optMap().entrySet()) {

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
                }
            }

            return map;
        }

        return value.getValue();
    }

    public static boolean ensureAirshipReady() {
        return ensureAirshipReady(null);
    }

    public static boolean ensureAirshipReady(@Nullable Promise promise) {
        if (UAirship.isFlying() || UAirship.isTakingOff()) {
            return true;
        } else {
            if (promise != null) {
                promise.reject("TAKE_OFF_NOT_CALLED", "Airship not ready, takeOff not called");
            }
            PluginLogger.error("Airship not ready, unable to process command.");
            return false;
        }
    }

    @PrivacyManager.Feature
    public static int parseFeature(String feature) {
        Integer value = featureMap.get(feature);
        if (value != null) {
            return value;
        }
        throw new IllegalArgumentException("Invalid feature: " + feature);
    }

    public static List<String> convertFeatures(@PrivacyManager.Feature int features) {
        List<String> result = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : featureMap.entrySet()) {
            int value = entry.getValue();
            if (value == PrivacyManager.FEATURE_ALL) {
                if (features == value) {
                    return Collections.singletonList(entry.getKey());
                }
                continue;
            }

            if (value == PrivacyManager.FEATURE_NONE) {
                if (features == value) {
                    return Collections.singletonList(entry.getKey());
                }
                continue;
            }

            if ((value & features) == value) {
                result.add(entry.getKey());
            }
        }
        return result;
    }
}

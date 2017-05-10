package com.urbanairship.reactnative;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.urbanairship.json.JsonMap;
import com.urbanairship.json.JsonValue;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


class Utils {

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


    public static Object convertJsonValue(JsonValue value) {
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

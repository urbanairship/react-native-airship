/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.bridge.*
import com.urbanairship.PrivacyManager
import com.urbanairship.android.framework.proxy.EventType
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue

/**
 * Module utils.
 */
object Utils {
    private val eventMap: Map<String, List<EventType>> = mapOf(
        "com.airship.deep_link" to listOf(EventType.DEEP_LINK_RECEIVED),
        "com.airship.channel_created" to listOf(EventType.CHANNEL_CREATED),
        "com.airship.push_token_received" to listOf(EventType.PUSH_TOKEN_RECEIVED),
        "com.airship.message_center_updated" to listOf(EventType.MESSAGE_CENTER_UPDATED),
        "com.airship.display_message_center" to listOf(EventType.DISPLAY_MESSAGE_CENTER),
        "com.airship.display_preference_center" to listOf(EventType.DISPLAY_PREFERENCE_CENTER),
        "com.airship.notification_response" to listOf(
            EventType.FOREGROUND_NOTIFICATION_RESPONSE_RECEIVED,
            EventType.BACKGROUND_NOTIFICATION_RESPONSE_RECEIVED
        ),
        "com.airship.push_received" to listOf(
                EventType.FOREGROUND_PUSH_RECEIVED,
                EventType.BACKGROUND_PUSH_RECEIVED
        ),
        "com.airship.notification_opt_in_status" to listOf(EventType.NOTIFICATION_OPT_IN_CHANGED)
    )

    fun convertArray(array: ReadableArray?): JsonValue {
        return if (array == null) {
            JsonValue.NULL
        } else {
            val jsonValues: MutableList<JsonValue> = ArrayList()
            var i = 0
            while (i < array.size()) {
                jsonValues.add(convertDynamic(array.getDynamic(i)))
                i++
            }
            JsonValue.wrapOpt(jsonValues)
        }
    }

    /**
     * Converts a dynamic object into a [JsonValue].
     *
     * @param `object` The dynamic object.
     * @return A [JsonValue].
     */
    @JvmStatic
    fun convertDynamic(obj: Dynamic?): JsonValue {
        return if (obj == null) {
            JsonValue.NULL
        } else when (obj.type) {
            ReadableType.Null -> JsonValue.NULL
            ReadableType.Boolean -> JsonValue.wrapOpt(obj.asBoolean())
            ReadableType.String -> JsonValue.wrapOpt(obj.asString())
            ReadableType.Number -> JsonValue.wrapOpt(obj.asDouble())
            ReadableType.Map -> {
                val map = obj.asMap()
                convertMap(map).toJsonValue()
            }
            ReadableType.Array -> {
                val array = obj.asArray()
                convertArray(array)
            }
            else -> JsonValue.NULL
        }
    }

    @JvmStatic
    fun convertMap(map: ReadableMap?): JsonMap {
        if (map == null) {
            return JsonMap.EMPTY_MAP
        }
        val mapBuilder = JsonMap.newBuilder()
        val iterator = map.keySetIterator()
        while (iterator.hasNextKey()) {
            val key = iterator.nextKey()
            mapBuilder.putOpt(key, convertDynamic(map.getDynamic(key)))
        }
        return mapBuilder.build()
    }


    /**
     * Converts a JsonValue into either a WritableArray, WritableMap, or primitive type.
     *
     * @param value The JsonValue.
     * @return The converted object.
     */
    @JvmStatic
    fun convertJsonValue(value: JsonValue): Any? {
        if (value.isNull) {
            return null
        }
        if (value.isJsonList) {
            val array = Arguments.createArray()
            for (arrayValue in value.optList()) {
                if (arrayValue.isNull) {
                    array.pushNull()
                    continue
                }
                if (arrayValue.isBoolean) {
                    array.pushBoolean(arrayValue.getBoolean(false))
                    continue
                }
                if (arrayValue.isInteger) {
                    array.pushInt(arrayValue.getInt(0))
                    continue
                }
                if (arrayValue.isDouble || arrayValue.isNumber) {
                    array.pushDouble(arrayValue.getDouble(0.0))
                    continue
                }
                if (arrayValue.isString) {
                    array.pushString(arrayValue.string)
                    continue
                }
                if (arrayValue.isJsonList) {
                    array.pushArray(convertJsonValue(arrayValue) as WritableArray?)
                    continue
                }
                if (arrayValue.isJsonMap) {
                    array.pushMap(convertJsonValue(arrayValue) as WritableMap?)
                }
            }
            return array
        }
        if (value.isJsonMap) {
            val map = Arguments.createMap()
            for ((key, mapValue) in value.optMap().entrySet()) {
                if (mapValue.isNull) {
                    map.putNull(key)
                    continue
                }
                if (mapValue.isBoolean) {
                    map.putBoolean(key, mapValue.getBoolean(false))
                    continue
                }
                if (mapValue.isInteger) {
                    map.putInt(key, mapValue.getInt(0))
                    continue
                }
                if (mapValue.isDouble || mapValue.isNumber) {
                    map.putDouble(key, mapValue.getDouble(0.0))
                    continue
                }
                if (mapValue.isString) {
                    map.putString(key, mapValue.string)
                    continue
                }
                if (mapValue.isJsonList) {
                    map.putArray(key, convertJsonValue(mapValue) as WritableArray?)
                    continue
                }
                if (mapValue.isJsonMap) {
                    map.putMap(key, convertJsonValue(mapValue) as WritableMap?)
                }
            }
            return map
        }
        return value.value
    }

    fun parseEventTypes(string: String): List<EventType> {
        return eventMap[string] ?: emptyList()
    }
}
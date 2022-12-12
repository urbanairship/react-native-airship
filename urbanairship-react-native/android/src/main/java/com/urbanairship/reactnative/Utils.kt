/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.graphics.Color
import android.os.Bundle
import androidx.annotation.ColorInt
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.urbanairship.PrivacyManager
import com.urbanairship.UAirship
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue
import com.urbanairship.push.NotificationInfo
import com.urbanairship.push.PushMessage
import com.urbanairship.reactnative.PluginLogger.error
import com.urbanairship.util.UAStringUtil

/**
 * Module utils.
 */
object Utils {

    private val legacyFeatureMap: Map<String, Int> = mapOf(
        "FEATURE_NONE" to PrivacyManager.FEATURE_NONE,
        "FEATURE_IN_APP_AUTOMATION" to PrivacyManager.FEATURE_IN_APP_AUTOMATION,
        "FEATURE_MESSAGE_CENTER" to PrivacyManager.FEATURE_MESSAGE_CENTER,
        "FEATURE_PUSH" to PrivacyManager.FEATURE_PUSH,
        "FEATURE_CHAT" to PrivacyManager.FEATURE_CHAT,
        "FEATURE_ANALYTICS" to PrivacyManager.FEATURE_ANALYTICS,
        "FEATURE_TAGS_AND_ATTRIBUTES" to PrivacyManager.FEATURE_TAGS_AND_ATTRIBUTES,
        "FEATURE_CONTACTS" to PrivacyManager.FEATURE_CONTACTS,
        "FEATURE_LOCATION" to PrivacyManager.FEATURE_LOCATION,
        "FEATURE_ALL" to PrivacyManager.FEATURE_ALL
    )

    private val featureMap: Map<String, Int> = mapOf(
        "none" to PrivacyManager.FEATURE_NONE,
        "in_app_automation" to PrivacyManager.FEATURE_IN_APP_AUTOMATION,
        "message_center" to PrivacyManager.FEATURE_MESSAGE_CENTER,
        "push" to PrivacyManager.FEATURE_PUSH,
        "chat" to PrivacyManager.FEATURE_CHAT,
        "analytics" to PrivacyManager.FEATURE_ANALYTICS,
        "tags_and_attributes" to PrivacyManager.FEATURE_TAGS_AND_ATTRIBUTES,
        "contacts" to PrivacyManager.FEATURE_CONTACTS,
        "location" to PrivacyManager.FEATURE_LOCATION,
        "all" to PrivacyManager.FEATURE_ALL
    )

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
                val jsonValues: MutableList<JsonValue> = ArrayList()
                val array = obj.asArray()
                var i = 0
                while (i < array.size()) {
                    jsonValues.add(convertDynamic(array.getDynamic(i)))
                    i++
                }
                JsonValue.wrapOpt(jsonValues)
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
     * Gets a resource value by name.
     *
     * @param context        The context.
     * @param resourceName   The resource name.
     * @param resourceFolder The resource folder.
     * @return The resource ID or 0 if not found.
     */
    @JvmStatic
    fun getNamedResource(context: Context, resourceName: String, resourceFolder: String): Int {
        if (!UAStringUtil.isEmpty(resourceName)) {
            val id = context.resources.getIdentifier(resourceName, resourceFolder, context.packageName)
            if (id != 0) {
                return id
            } else {
                error("Unable to find resource with name: %s", resourceName)
            }
        }
        return 0
    }

    /**
     * Gets a hex color as a color int.
     *
     * @param hexColor     The hex color.
     * @param defaultColor Default value if the conversion was not successful.
     * @return The color int.
     */
    @ColorInt
    @JvmStatic
    fun getHexColor(hexColor: String, @ColorInt defaultColor: Int): Int {
        if (!UAStringUtil.isEmpty(hexColor)) {
            try {
                return Color.parseColor(hexColor)
            } catch (e: IllegalArgumentException) {
                error(e, "Unable to parse color: %s", hexColor)
            }
        }
        return defaultColor
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

    @JvmOverloads
    @JvmStatic
    fun ensureAirshipReady(promise: Promise? = null): Boolean {
        return if (UAirship.isFlying() || UAirship.isTakingOff()) {
            true
        } else {
            promise?.reject("TAKE_OFF_NOT_CALLED", "Airship not ready, takeOff not called")
            error("Airship not ready, unable to process command.")
            false
        }
    }

    @PrivacyManager.Feature
    @JvmStatic
    fun parseFeature(feature: String): Int {
        val value = featureMap[feature] ?: legacyFeatureMap[feature]
        value?.let {
            return it
        }

        throw IllegalArgumentException("Invalid feature: $feature")
    }

    @JvmStatic
    fun convertFeatures(@PrivacyManager.Feature features: Int): List<String> {
        val result: MutableList<String> = ArrayList()
        for ((key, value) in featureMap) {
            if (value == PrivacyManager.FEATURE_ALL) {
                if (features == value) {
                    return listOf(key)
                }
                continue
            }
            if (value == PrivacyManager.FEATURE_NONE) {
                if (features == value) {
                    return listOf(key)
                }
                continue
            }
            if (value and features == value) {
                result.add(key)
            }
        }
        return result
    }

    private fun getNotificationId(notificationId: Int, notificationTag: String?): String {
        var id = notificationId.toString()
        if (!UAStringUtil.isEmpty(notificationTag)) {
            id += ":$notificationTag"
        }
        return id
    }

    fun pushPayload(
        notificationInfo: NotificationInfo,
    ): ReadableMap {
        return pushPayload(
            notificationInfo.message,
            notificationInfo.notificationId,
            notificationInfo.notificationTag
        )
    }

    fun pushPayload(
        message: PushMessage,
        notificationId: Int? = null,
        notificationTag: String? = null
    ): ReadableMap {
        val map = Arguments.createMap()

        message.alert?.let {
            map.putString("alert", it)
        }

        message.title?.let {
            map.putString("title", it)
        }
        notificationId?.let {
            map.putString("notificationId", getNotificationId(it, notificationTag))
        }

        val bundle = Bundle(message.pushBundle)
        bundle.remove("android.support.content.wakelockid")
        map.putMap("extras", Arguments.fromBundle(bundle))
        return map
    }
}
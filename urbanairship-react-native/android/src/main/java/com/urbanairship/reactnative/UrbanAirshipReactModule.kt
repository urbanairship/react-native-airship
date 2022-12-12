/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Dynamic
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap
import com.urbanairship.Autopilot
import com.urbanairship.PrivacyManager
import com.urbanairship.UAirship
import com.urbanairship.actions.ActionCompletionCallback
import com.urbanairship.actions.ActionResult
import com.urbanairship.actions.ActionRunRequest
import com.urbanairship.channel.AirshipChannelListener
import com.urbanairship.channel.AttributeEditor
import com.urbanairship.channel.TagGroupsEditor
import com.urbanairship.contacts.Scope
import com.urbanairship.json.JsonValue
import com.urbanairship.messagecenter.MessageCenter
import com.urbanairship.preferencecenter.PreferenceCenter
import com.urbanairship.push.PushMessage
import com.urbanairship.reactnative.events.NotificationOptInEvent
import com.urbanairship.reactnative.events.PushReceivedEvent
import com.urbanairship.util.UAStringUtil
import java.util.*
import java.util.concurrent.Executor
import java.util.concurrent.Executors

/**
 * React module for Urban Airship.
 */
class UrbanAirshipReactModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val preferences: ReactAirshipPreferences by lazy { ReactAirshipPreferences.shared(reactContext) }

    override fun initialize() {
        super.initialize()

        Autopilot.automaticTakeOff(reactApplicationContext)

        EventEmitter.shared().attachReactContext(reactApplicationContext)

        UAirship.shared { airship: UAirship ->
            checkOptIn()

            airship.channel.addChannelListener(object : AirshipChannelListener {
                override fun onChannelCreated(channelId: String) {
                    checkOptIn()
                }

                override fun onChannelUpdated(channelId: String) {
                    checkOptIn()
                }
            })
        }

        reactApplicationContext.addLifecycleEventListener(object : LifecycleEventListener {
            override fun onHostResume() {
                // If the opt-in status changes send an event
                checkOptIn()
                EventEmitter.shared().onHostResume()
            }

            override fun onHostPause() {}

            override fun onHostDestroy() {}
        })
    }

    override fun getName(): String {
        return "UrbanAirshipReactModule"
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }

    @ReactMethod
    fun takeOff(config: ReadableMap?, promise: Promise) {
        val jsonMap = Utils.convertMap(config)
        preferences.airshipConfig = jsonMap
        Autopilot.automaticTakeOff(reactApplicationContext)
        promise.resolve(UAirship.isFlying() || UAirship.isTakingOff())
    }

    @ReactMethod
    fun isFlying(promise: Promise) {
        promise.resolve(UAirship.isFlying() || UAirship.isTakingOff())
    }

    @ReactMethod
    fun setAndroidNotificationConfig(map: ReadableMap) {
        preferences.notificationIcon = if (map.hasKey(NOTIFICATION_ICON_KEY)) map.getString(NOTIFICATION_ICON_KEY) else null
        preferences.notificationLargeIcon = if (map.hasKey(NOTIFICATION_LARGE_ICON_KEY)) map.getString(NOTIFICATION_LARGE_ICON_KEY) else null
        preferences.notificationAccentColor = if (map.hasKey(ACCENT_COLOR_KEY)) map.getString(ACCENT_COLOR_KEY) else null
        preferences.defaultNotificationChannelId = if (map.hasKey(DEFAULT_CHANNEL_ID_KEY)) map.getString(DEFAULT_CHANNEL_ID_KEY) else null
    }

    /**
     * Enables/Disables user notifications.
     *
     * @param enabled `true` to enable notifications, `false` to disable.
     */
    @ReactMethod
    fun setUserNotificationsEnabled(enabled: Boolean) {
        UAirship.shared().pushManager.userNotificationsEnabled = enabled
    }

    /**
     * If `channelCreationDelayEnabled` is enabled in the config, apps must call
     * this method to enable channel creation.
     */
    @ReactMethod
    fun enableChannelCreation() {
        UAirship.shared().channel.enableChannelCreation()
    }

    /**
     * Enables user notifications.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun enableUserPushNotifications(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        UAirship.shared().pushManager.userNotificationsEnabled = true
        promise.resolve(true)
    }

    /**
     * Checks if user notifications are enabled.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun isUserNotificationsEnabled(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(UAirship.shared().pushManager.userNotificationsEnabled)
    }

    /**
     * Sets the current enabled features.
     *
     * @param features The features to set as enabled.
     * @param promise  The promise.
     */
    @ReactMethod
    fun setEnabledFeatures(features: ReadableArray, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        try {
            UAirship.shared().privacyManager.setEnabledFeatures(parseFeatures(features))
        } catch (e: Exception) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e)
        }
    }

    /**
     * Gets the current enabled features.
     *
     * @param promise The promise.
     * @return The enabled features.
     */
    @ReactMethod
    fun getEnabledFeatures(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val enabledFeatures = Utils.convertFeatures(UAirship.shared().privacyManager.enabledFeatures)
        promise.resolve(toWritableArray(enabledFeatures))
    }

    /**
     * Enables features.
     *
     * @param features The features to enable.
     * @param promise  The promise.
     */
    @ReactMethod
    fun enableFeature(features: ReadableArray, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        try {
            UAirship.shared().privacyManager.enable(parseFeatures(features))
        } catch (e: Exception) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e)
        }
    }

    /**
     * Disables features.
     *
     * @param features The features to disable.
     * @param promise  The promise.
     */
    @ReactMethod
    fun disableFeature(features: ReadableArray, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        try {
            UAirship.shared().privacyManager.disable(parseFeatures(features))
        } catch (e: Exception) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e)
        }
    }

    /**
     * Checks if a given feature is enabled.
     *
     * @param features The features to check.
     * @param promise  The promise.
     * @return `true` if the provided features are enabled, otherwise `false`.
     */
    @ReactMethod
    fun isFeatureEnabled(features: ReadableArray, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        try {
            val enabled = UAirship.shared().privacyManager.isEnabled(parseFeatures(features))
            promise.resolve(enabled)
        } catch (e: Exception) {
            promise.reject(INVALID_FEATURE_ERROR_CODE, INVALID_FEATURE_ERROR_MESSAGE, e)
        }
    }

    /**
     * Gets the notification status.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getNotificationStatus(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val result = Arguments.createMap()
        val push = UAirship.shared().pushManager
        result.putBoolean("airshipOptIn", push.isOptIn)
        result.putBoolean("airshipEnabled", push.userNotificationsEnabled)
        result.putBoolean("systemEnabled", NotificationManagerCompat.from(reactApplicationContext).areNotificationsEnabled())
        promise.resolve(result)
    }

    @ReactMethod
    @RequiresApi(api = Build.VERSION_CODES.O)
    fun getNotificationChannelStatus(channelId: String?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val manager = reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = manager.getNotificationChannel(channelId)
        if (channel == null) {
            promise.resolve("unknown")
        } else {
            if (channel.importance != NotificationManager.IMPORTANCE_NONE) {
                promise.resolve("enabled")
            } else {
                promise.resolve("disabled")
            }
        }
    }

    /**
     * Returns the channel ID.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getChannelId(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(UAirship.shared().channel.id)
    }

    /**
     * Returns the registration token.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getRegistrationToken(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(UAirship.shared().pushManager.pushToken)
    }

    /**
     * Sets the named user.
     *
     * @param namedUser The named user ID.
     */
    @ReactMethod
    fun setNamedUser(namedUser: String?) {
        var mutableNamedUser = namedUser

        if (!Utils.ensureAirshipReady()) {
            return
        }

        mutableNamedUser?.let { value ->
            mutableNamedUser = value.trim { it <= ' ' }
        }

        if (UAStringUtil.isEmpty(mutableNamedUser)) {
            UAirship.shared().contact.reset()
        } else {
            UAirship.shared().contact.identify(mutableNamedUser!!)
        }
    }

    /**
     * Gets the named user.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getNamedUser(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(UAirship.shared().contact.namedUserId)
    }

    /**
     * Adds a channel tag.
     *
     * @param tag The tag to add.
     */
    @ReactMethod
    fun addTag(tag: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        tag?.let {
            UAirship.shared().channel.editTags().addTag(it).apply()
        }
    }

    /**
     * Removes a channel tag.
     *
     * @param tag The tag to remove.
     */
    @ReactMethod
    fun removeTag(tag: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        tag?.let {
            UAirship.shared().channel.editTags().removeTag(it).apply()
        }
    }

    /**
     * Gets the current channel tags.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getTags(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(toWritableArray(UAirship.shared().channel.tags))
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
    fun editChannelTagGroups(operations: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        applyTagGroupOperations(UAirship.shared().channel.editTagGroups(), operations)
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
    fun editContactTagGroups(operations: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        applyTagGroupOperations(UAirship.shared().contact.editTagGroups(), operations)
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
    fun editChannelAttributes(operations: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        applyAttributeOperations(UAirship.shared().channel.editAttributes(), operations)
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
    fun editContactAttributes(operations: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        applyAttributeOperations(UAirship.shared().contact.editAttributes(), operations)
    }

    /**
     * Edit a subscription list.
     *
     * @param subscriptionListUpdates The subscription lists.
     */
    @ReactMethod
    @Deprecated("Use {@link #editChannelSubscriptionLists(ReadableArray)} instead.")
    fun editSubscriptionLists(subscriptionListUpdates: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        editChannelSubscriptionLists(subscriptionListUpdates)
    }

    /**
     * Edit subscription lists associated with the current Channel.
     *
     *
     * List updates should each be a map with the following:
     * - type: Either subscribe or unsubscribe.
     * - listId: ID of the subscription list to subscribe to or unsubscribe from.
     *
     * @param subscriptionListUpdates The subscription lists.
     */
    @ReactMethod
    fun editChannelSubscriptionLists(subscriptionListUpdates: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        val editor = UAirship.shared().channel.editSubscriptionLists()
        for (i in 0 until subscriptionListUpdates.size()) {
            val subscriptionListUpdate = subscriptionListUpdates.getMap(i)
            val listId = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_LISTID)
            val type = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_TYPE)
            if (listId == null || type == null) {
                continue
            }
            if ("subscribe" == type) {
                editor.subscribe(listId)
            } else if ("unsubscribe" == type) {
                editor.unsubscribe(listId)
            }
        }
        editor.apply()
    }

    /**
     * Edit subscription lists associated with the current Channel.
     *
     *
     * List updates should each be a map with the following:
     * - type: Either subscribe or unsubscribe.
     * - listId: ID of the subscription list to subscribe to or unsubscribe from.
     * - scope: Subscription scope (one of: app, web, sms, email).
     *
     * @param scopedSubscriptionListUpdates The subscription list updates.
     */
    @ReactMethod
    fun editContactSubscriptionLists(scopedSubscriptionListUpdates: ReadableArray) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        val editor = UAirship.shared().contact.editSubscriptionLists()
        for (i in 0 until scopedSubscriptionListUpdates.size()) {
            val subscriptionListUpdate = scopedSubscriptionListUpdates.getMap(i)
            val listId = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_LISTID)
            val type = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_TYPE)
            val scopeString = subscriptionListUpdate.getString(SUBSCRIBE_LIST_OPERATION_SCOPE)
            if (listId == null || type == null || scopeString == null) {
                continue
            }
            val scope: Scope = try {
                Scope.valueOf(scopeString.uppercase(Locale.ROOT))
            } catch (e: IllegalArgumentException) {
                continue
            }
            if ("subscribe" == type) {
                editor.subscribe(listId, scope)
            } else if ("unsubscribe" == type) {
                editor.unsubscribe(listId, scope)
            }
        }
        editor.apply()
    }

    /**
     * Associated an identifier to the channel.
     *
     * @param key   The identifier's key.
     * @param value The identifier's value. If the value is null it will be removed from the current
     * set of associated identifiers.
     */
    @ReactMethod
    fun associateIdentifier(key: String, value: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        val editor = UAirship.shared().analytics.editAssociatedIdentifiers()
        if (value == null) {
            editor.removeIdentifier(key)
        } else {
            editor.addIdentifier(key, value)
        }
        editor.apply()
    }

    /**
     * Initiates screen tracking for a specific app screen, must be called once per tracked screen.
     *
     * @param {String} screen The screen's string identifier.
     */
    @ReactMethod
    fun trackScreen(screen: String?) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        UAirship.shared().analytics.trackScreen(screen)
    }

    /**
     * Called when the app is listening for an airship event.
     *
     * @param listener The listener type.
     */
    @ReactMethod
    fun onAirshipListenerAdded(listener: String) {
        EventEmitter.shared().onAirshipListenerAdded(listener)
    }

    /**
     * Removes and returns foreground events for the given type.
     *
     * @param type    The type.
     * @param promise The promise.
     */
    @ReactMethod
    fun takePendingForegroundEvents(type: String, promise: Promise) {
        val events = EventEmitter.shared().takePendingForegroundEvents(type)
        val array = Arguments.createArray()
        for (event in events) {
            array.pushMap(event.body)
        }
        promise.resolve(array)
    }

    /**
     * Removes and returns background events for the given type.
     *
     * @param type    The type.
     * @param promise The promise.
     */
    @ReactMethod
    fun takePendingBackgroundEvents(type: String, promise: Promise) {
        val events = EventEmitter.shared().takePendingBackgroundEvents(type)
        val array = Arguments.createArray()
        for (event in events) {
            array.pushMap(event.body)
        }
        promise.resolve(array)
    }

    internal enum class SubscriptionListType {
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
    fun getSubscriptionLists(types: ReadableArray?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        PluginLogger.debug("getSubscriptionLists($types)")
        val parsedTypes: MutableSet<SubscriptionListType> = HashSet()
        types?.let {
            for (i in 0 until it.size()) {
                try {
                    val type = SubscriptionListType.valueOf(it.getString(i).uppercase(Locale.ROOT))
                    parsedTypes.add(type)
                } catch (e: Exception) {
                    promise.reject(e)
                    return
                }
            }
        }

        if (parsedTypes.isEmpty()) {
            promise.reject(Exception("Failed to fetch subscription lists, no types."))
            return
        }

        BG_EXECUTOR.execute {
            val resultMap = Arguments.createMap()
            try {
                val ua = UAirship.shared()
                for (type in parsedTypes) {
                    when (type) {
                        SubscriptionListType.CHANNEL -> {
                            val channelSubs = ua.channel.getSubscriptionLists(true).get()
                            if (channelSubs == null) {
                                promise.reject(Exception("Failed to fetch channel subscription lists."))
                                return@execute
                            }
                            resultMap.putArray(
                                "channel",
                                toWritableArray(channelSubs)
                            )
                        }
                        SubscriptionListType.CONTACT -> {
                            val contactSubs = ua.contact.getSubscriptionLists(true).get()
                            if (contactSubs == null) {
                                promise.reject(Exception("Failed to fetch contact subscription lists."))
                                return@execute
                            }
                            val contactSubsMap = Arguments.createMap()
                            for ((key, value) in contactSubs) {
                                val scopesArray = Arguments.createArray()
                                for (s in value) {
                                    scopesArray.pushString(s.toString())
                                }
                                contactSubsMap.putArray(key!!, scopesArray)
                            }
                            resultMap.putMap("contact", contactSubsMap)
                        }
                    }
                }
                promise.resolve(resultMap)
            } catch (e: Exception) {
                promise.reject(e)
            }
        }
    }

    /**
     * Runs an action.
     *
     * @param name    The action's name.
     * @param value   The action's value.
     * @param promise A JS promise to deliver the action result.
     */
    @ReactMethod
    fun runAction(name: String, value: Dynamic?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        ActionRunRequest.createRequest(name)
            .setValue(Utils.convertDynamic(value))
            .run(ActionCompletionCallback { actionArguments, actionResult ->
                when (actionResult.status) {
                    ActionResult.STATUS_COMPLETED -> {
                        promise.resolve(Utils.convertJsonValue(actionResult.value.toJsonValue()))
                        return@ActionCompletionCallback
                    }
                    ActionResult.STATUS_REJECTED_ARGUMENTS -> {
                        promise.reject("STATUS_REJECTED_ARGUMENTS", "Action rejected arguments.")
                        return@ActionCompletionCallback
                    }
                    ActionResult.STATUS_ACTION_NOT_FOUND -> {
                        promise.reject("STATUS_ACTION_NOT_FOUND", "Action " + name + "not found.")
                        return@ActionCompletionCallback
                    }
                    ActionResult.STATUS_EXECUTION_ERROR -> {
                        promise.reject("STATUS_EXECUTION_ERROR", actionResult.exception)
                        return@ActionCompletionCallback
                    }
                    else -> {
                        promise.reject("STATUS_EXECUTION_ERROR", actionResult.exception)
                        return@ActionCompletionCallback
                    }
                }
            })
    }

    /**
     * Badging is not supported on Android. Returns 0 if a badge count is requested on Android.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getBadgeNumber(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(0)
    }

    /**
     * Displays the default message center.
     */
    @ReactMethod
    fun displayMessageCenter() {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        MessageCenter.shared().showMessageCenter()
    }

    /**
     * Dismisses the default message center.
     */
    @ReactMethod
    fun dismissMessageCenter() {
        if (!Utils.ensureAirshipReady()) {
            return
        }

        currentActivity?.let {
            val intent = Intent(it, CustomMessageCenterActivity::class.java)
                .setAction(CLOSE_MESSAGE_CENTER)
            it.startActivity(intent)
        }
    }

    /**
     * Display an inbox message in the default message center.
     *
     * @param messageId The id of the message to be displayed.
     * @param promise   The JS promise.
     */
    @ReactMethod
    fun displayMessage(messageId: String?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        MessageCenter.shared().showMessageCenter(messageId)
        promise.resolve(true)
    }

    /**
     * Dismisses the currently displayed inbox message.
     */
    @ReactMethod
    fun dismissMessage() {
        if (!Utils.ensureAirshipReady()) {
            return
        }

        currentActivity?.let {
            val intent = Intent(it, CustomMessageActivity::class.java)
                .setAction(CLOSE_MESSAGE_CENTER)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            it.startActivity(intent)
        }
    }

    /**
     * Retrieves the current inbox messages.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getInboxMessages(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val messagesArray = Arguments.createArray()
        for (message in MessageCenter.shared().inbox.messages) {
            val messageMap: WritableMap = WritableNativeMap()
            messageMap.putString("title", message.title)
            messageMap.putString("id", message.messageId)
            messageMap.putDouble("sentDate", message.sentDate.time.toDouble())
            messageMap.putString("listIconUrl", message.listIconUrl)
            messageMap.putBoolean("isRead", message.isRead)
            messageMap.putBoolean("isDeleted", message.isDeleted)
            val extrasMap: WritableMap = WritableNativeMap()
            val extras = message.extras
            for (key in extras.keySet()) {
                val value = extras[key].toString()
                extrasMap.putString(key, value)
            }
            messageMap.putMap("extras", extrasMap)
            messagesArray.pushMap(messageMap)
        }
        promise.resolve(messagesArray)
    }

    /**
     * Deletes an inbox message.
     *
     * @param messageId The id of the message to be deleted.
     * @param promise   The JS promise.
     */
    @ReactMethod
    fun deleteInboxMessage(messageId: String?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val message = MessageCenter.shared().inbox.getMessage(messageId)
        if (message == null) {
            promise.reject("STATUS_MESSAGE_NOT_FOUND", "Message not found")
        } else {
            message.delete()
            promise.resolve(true)
        }
    }

    /**
     * Marks an inbox message as read.
     *
     * @param messageId The id of the message to be marked as read.
     * @param promise   The JS promise.
     */
    @ReactMethod
    fun markInboxMessageRead(messageId: String?, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val message = MessageCenter.shared().inbox.getMessage(messageId)
        if (message == null) {
            promise.reject("STATUS_MESSAGE_NOT_FOUND", "Message not found.")
        } else {
            message.markRead()
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun clearNotifications() {
        NotificationManagerCompat.from(UAirship.getApplicationContext()).cancelAll()
    }

    @ReactMethod
    fun clearNotification(identifier: String) {
        if (UAStringUtil.isEmpty(identifier)) {
            return
        }
        val parts = identifier.split(":".toRegex(), 2).toTypedArray()
        if (parts.isEmpty()) {
            Log.e(name, "Invalid identifier: $identifier")
            return
        }
        var tag: String? = null
        val id: Int = try {
            parts[0].toInt()
        } catch (e: NumberFormatException) {
            Log.e(name, "Invalid identifier: $identifier")
            return
        }
        if (parts.size == 2) {
            tag = parts[1]
        }
        NotificationManagerCompat.from(UAirship.getApplicationContext()).cancel(tag, id)
    }

    /**
     * Retrieves the current inbox messages.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getActiveNotifications(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val notifications = Arguments.createArray()

            val notificationManager = UAirship.getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val statusBarNotifications = notificationManager.activeNotifications

            for (statusBarNotification in statusBarNotifications) {
                val id = statusBarNotification.id
                val tag = statusBarNotification.tag

                var pushMessage: PushMessage
                val extras = statusBarNotification.notification.extras
                val bundle = extras?.getBundle("push_message")

                pushMessage = bundle?.let { PushMessage(it) } ?: PushMessage(Bundle())

                notifications.pushMap(Utils.pushPayload(pushMessage, id, tag))
            }
            promise.resolve(notifications)
        } else {
            promise.reject(
                "UNSUPPORTED",
                "Getting active notifications is only supported on Marshmallow and newer devices."
            )
        }
    }

    /**
     * Forces the inbox to refresh. This is normally not needed as the inbox will automatically refresh on foreground or when a push arrives thats associated with a message.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun refreshInbox(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        MessageCenter.shared().inbox.fetchMessages { success ->
            if (success) {
                promise.resolve(true)
            } else {
                promise.reject("STATUS_DID_NOT_REFRESH", "Inbox failed to refresh")
            }
        }
    }

    /**
     * Gets the count of Unread messages in the inbox.
     *
     * @param promise The JS promise.
     */
    @ReactMethod
    fun getUnreadMessagesCount(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        promise.resolve(MessageCenter.shared().inbox.unreadCount)
    }

    /**
     * Sets the default behavior when the message center is launched from a push notification. If set to false the message center must be manually launched.
     *
     * @param enabled `true` to automatically launch the default message center, `false` to disable.
     */
    @ReactMethod
    fun setAutoLaunchDefaultMessageCenter(enabled: Boolean) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        preferences.setAutoLaunchMessageCenter(enabled)
    }

    /**
     * Overriding the locale.
     *
     * @param localeIdentifier The locale identifier.
     */
    @ReactMethod
    fun setCurrentLocale(localeIdentifier: String) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        UAirship.shared().setLocaleOverride(Locale(localeIdentifier))
    }

    /**
     * Getting the locale currently used by Airship.
     */
    @ReactMethod
    fun getCurrentLocale(promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }
        val airshipLocale = UAirship.shared().locale
        promise.resolve(airshipLocale.language)
    }

    /**
     * Resets the current locale.
     */
    @ReactMethod
    fun clearLocale() {
        UAirship.shared().setLocaleOverride(null)
    }

    /**
     * Helper to determine user notifications authorization status
     */
    fun checkOptIn() {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        val optIn = UAirship.shared().pushManager.isOptIn
        if (preferences.optInStatus != optIn) {
            preferences.optInStatus = optIn
            val optInEvent: Event = NotificationOptInEvent(optIn)
            EventEmitter.shared().sendEvent(optInEvent)
        }
    }

    /**
     * Helper method to parse a String features array into [PrivacyManager.Feature].
     *
     * @param features The String features to parse.
     * @return The resulting feature flag.
     */
    @PrivacyManager.Feature
    @Throws(IllegalArgumentException::class)
    private fun parseFeatures(features: ReadableArray): Int {
        var result = PrivacyManager.FEATURE_NONE

        for (i in 0 until features.size()) {
            result = result or Utils.parseFeature(features.getString(i))
        }
        return result
    }

    companion object {
        private const val TAG_OPERATION_GROUP_NAME = "group"
        private const val TAG_OPERATION_TYPE = "operationType"
        private const val TAG_OPERATION_TAGS = "tags"
        private const val TAG_OPERATION_ADD = "add"
        private const val TAG_OPERATION_REMOVE = "remove"
        private const val TAG_OPERATION_SET = "set"

        private const val ATTRIBUTE_OPERATION_KEY = "key"
        private const val ATTRIBUTE_OPERATION_VALUE = "value"
        private const val ATTRIBUTE_OPERATION_TYPE = "action"
        private const val ATTRIBUTE_OPERATION_SET = "set"
        private const val ATTRIBUTE_OPERATION_REMOVE = "remove"
        private const val ATTRIBUTE_OPERATION_VALUETYPE = "type"

        private const val SUBSCRIBE_LIST_OPERATION_LISTID = "listId"
        private const val SUBSCRIBE_LIST_OPERATION_TYPE = "type"
        private const val SUBSCRIBE_LIST_OPERATION_SCOPE = "scope"

        const val NOTIFICATION_ICON_KEY = "icon"
        const val NOTIFICATION_LARGE_ICON_KEY = "largeIcon"
        const val ACCENT_COLOR_KEY = "accentColor"
        const val DEFAULT_CHANNEL_ID_KEY = "defaultChannelId"

        const val CLOSE_MESSAGE_CENTER = "CLOSE"

        private const val INVALID_FEATURE_ERROR_CODE = "INVALID_FEATURE"
        private const val INVALID_FEATURE_ERROR_MESSAGE = "Invalid feature, cancelling the action."

        private val BG_EXECUTOR: Executor = Executors.newCachedThreadPool()

        /**
         * Helper method to apply tag group changes.
         *
         * @param editor     The tag group editor.
         * @param operations A list of tag group operations.
         */
        private fun applyTagGroupOperations(editor: TagGroupsEditor, operations: ReadableArray) {
            for (i in 0 until operations.size()) {
                val operation = operations.getMap(i)

                val group = operation.getString(TAG_OPERATION_GROUP_NAME)
                val tags = operation.getArray(TAG_OPERATION_TAGS)
                val operationType = operation.getString(TAG_OPERATION_TYPE)

                if (group == null || tags == null || operationType == null) {
                    continue
                }

                val tagSet = HashSet<String>()
                for (j in 0 until tags.size()) {
                    tagSet.add(tags.getString(j))
                }

                when (operationType) {
                    TAG_OPERATION_ADD -> {
                        editor.addTags(group, tagSet)
                    }
                    TAG_OPERATION_REMOVE -> {
                        editor.removeTags(group, tagSet)
                    }
                    TAG_OPERATION_SET -> {
                        editor.setTags(group, tagSet)
                    }
                }
            }
            editor.apply()
        }

        /**
         * Helper method to apply attribute changes.
         *
         * @param editor     The attribute editor.
         * @param operations A list of attribute operations.
         */
        private fun applyAttributeOperations(editor: AttributeEditor, operations: ReadableArray) {
            for (i in 0 until operations.size()) {
                val operation = operations.getMap(i)

                val action = operation.getString(ATTRIBUTE_OPERATION_TYPE)
                val key = operation.getString(ATTRIBUTE_OPERATION_KEY)

                if (action == null || key == null) {
                    continue
                }

                if (ATTRIBUTE_OPERATION_SET == action) {
                    val valueType = operation.getString(ATTRIBUTE_OPERATION_VALUETYPE)
                    if ("string" == valueType) {
                        val value = operation.getString(ATTRIBUTE_OPERATION_VALUE) ?: continue
                        editor.setAttribute(key, value)
                    } else if ("number" == valueType) {
                        val value = operation.getDouble(ATTRIBUTE_OPERATION_VALUE)
                        editor.setAttribute(key, value)
                    } else if ("date" == valueType) {
                        val value = operation.getDouble(ATTRIBUTE_OPERATION_VALUE)
                        // JavaScript's date type doesn't pass through the JS to native bridge. Dates are instead serialized as milliseconds since epoch.
                        editor.setAttribute(key, Date(value.toLong()))
                    }
                } else if (ATTRIBUTE_OPERATION_REMOVE == action) {
                    editor.removeAttribute(key)
                }
            }
            editor.apply()
        }

        private fun toWritableArray(strings: Collection<String>): WritableArray {
            val result = Arguments.createArray()
            for (value in strings) {
                result.pushString(value)
            }
            return result
        }
    }

    @ReactMethod
    fun displayPreferenceCenter(preferenceCenterId: String) {
        if (!Utils.ensureAirshipReady()) {
            return
        }
        PreferenceCenter.shared().open(preferenceCenterId)
    }

    @ReactMethod
    fun getPreferenceCenterConfig(preferenceCenterId: String, promise: Promise) {
        if (!Utils.ensureAirshipReady(promise)) {
            return
        }

        PreferenceCenter.shared().getJsonConfig(preferenceCenterId).addResultCallback { result: JsonValue? ->
            if (result == null) {
                promise.reject(Exception("Failed to get preference center configuration."))
                return@addResultCallback
            }
            promise.resolve(Utils.convertJsonValue(result))
        }
    }

    @ReactMethod
    fun setUseCustomPreferenceCenterUi(useCustomUI: Boolean, preferenceID: String) {
        preferences.setAutoLaunchPreferenceCenter(preferenceID, !useCustomUI)
    }

}
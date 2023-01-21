package com.urbanairship.reactnative

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.urbanairship.PendingResult
import com.urbanairship.actions.ActionResult
import com.urbanairship.android.framework.proxy.EventType
import com.urbanairship.android.framework.proxy.events.EventEmitter
import com.urbanairship.android.framework.proxy.proxies.AirshipProxy
import com.urbanairship.json.JsonSerializable
import com.urbanairship.json.JsonValue
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.launch

class AirshipModule internal constructor(val context: ReactApplicationContext) :
    AirshipSpec(context) {
    override fun getName() = NAME

    private val proxy = AirshipProxy.shared(context)

    override fun initialize() {
        super.initialize()

        MainScope().launch {
            EventEmitter.shared().pendingEventListener.collect {
                if (it.isForeground()) {
                    notifyPending()
                } else {
                    AirshipHeadlessEventService.startService(context)
                }
            }
        }

        context.addLifecycleEventListener(object : LifecycleEventListener {
            override fun onHostResume() {
                val backgroundTypes = EventType.values().filter { !it.isForeground() }
                if (EventEmitter.shared().hasEvents(backgroundTypes)) {
                    AirshipHeadlessEventService.startService(context)
                }
            }

            override fun onHostPause() {}
            override fun onHostDestroy() {}
        })
    }

    @ReactMethod
    override fun takeOff(config: ReadableMap?, promise: Promise) {
        promise.resolveResult {
            proxy.takeOff(Utils.convertMap(requireNotNull(config)).toJsonValue())
        }
    }

    @ReactMethod
    override fun isFlying(promise: Promise) {
        promise.resolveResult {
            this.proxy.isFlying()
        }
    }

    @ReactMethod
    override fun airshipListenerAdded(eventName: String?) {
        if (eventName == null) {
            return
        }

        val eventTypes = Utils.parseEventTypes(eventName)
        if (eventTypes.any { it.isForeground() }) {
            notifyPending()
        }

        if (eventTypes.any { !it.isForeground() }) {
            AirshipHeadlessEventService.startService(context)
        }
    }

    @ReactMethod
    override fun takePendingEvents(eventName: String?, isHeadlessJS: Boolean, promise: Promise) {
        promise.resolveResult {
            val eventTypes = Utils.parseEventTypes(requireNotNull(eventName))
                .filter {
                    if (isHeadlessJS) {
                        !it.isForeground()
                    } else {
                        it.isForeground()
                    }
                }
            JsonValue.wrapOpt(EventEmitter.shared().takePending(eventTypes).map { it.body })
        }
    }

    @ReactMethod
    override fun addListener(eventType: String?) {
        // no-op
    }

    @ReactMethod
    override fun removeListeners(count: Double) {
        // no-op
    }

    @ReactMethod
    override fun channelAddTag(tag: String?, promise: Promise) {
        promise.resolveResult {
            proxy.channel.addTag(requireNotNull(tag))
        }
    }

    @ReactMethod
    override fun channelRemoveTag(tag: String?, promise: Promise) {
        promise.resolveResult {
            proxy.channel.removeTag(requireNotNull(tag))
        }
    }

    @ReactMethod
    override fun channelGetTags(promise: Promise) {
        promise.resolveResult {
            JsonValue.wrapOpt(proxy.channel.getTags())
        }
    }

    @ReactMethod
    override fun channelGetChannelId(promise: Promise) {
        promise.resolveResult {
            proxy.channel.getChannelId()
        }
    }

    @ReactMethod
    override fun channelGetSubscriptionLists(promise: Promise) {
        promise.resolveDeferred { callback ->
            proxy.channel.getSubscriptionLists().addResultCallback {
                callback(JsonValue.wrapOpt(it), null)
            }
        }
    }

    @ReactMethod
    override fun channelEditTagGroups(operations: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.channel.editTagGroups(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun channelEditAttributes(operations: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.channel.editAttributes(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun channelEditSubscriptionLists(operations: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.channel.editSubscriptionLists(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun pushSetUserNotificationsEnabled(enabled: Boolean, promise: Promise) {
        promise.resolveResult {
            proxy.push.setUserNotificationsEnabled(enabled)
        }
    }

    @ReactMethod
    override fun pushIsUserNotificationsEnabled(promise: Promise) {
        promise.resolveResult {
            proxy.push.isUserNotificationsEnabled()
        }
    }

    @ReactMethod
    override fun pushEnableUserNotifications(promise: Promise) {
        promise.resolvePending {
            proxy.push.enableUserPushNotifications()
        }
    }

    @ReactMethod
    override fun pushGetNotificationStatus(promise: Promise) {
        promise.resolveResult {
            proxy.push.getNotificationStatus()
        }
    }

    @ReactMethod
    override fun pushGetRegistrationToken(promise: Promise) {
        promise.resolveResult {
            proxy.push.getRegistrationToken()
        }
    }

    @ReactMethod
    override fun pushGetActiveNotifications(promise: Promise) {
        promise.resolveResult {
            proxy.push.getActiveNotifications()
        }
    }

    @ReactMethod
    override fun pushClearNotifications() {
        proxy.push.clearNotifications()
    }

    @ReactMethod
    override fun pushClearNotification(identifier: String?) {
        if (identifier != null) {
            proxy.push.clearNotification(identifier)
        }
    }

    @ReactMethod
    override fun pushIosSetForegroundPresentationOptions(
        options: ReadableArray?,
        promise: Promise
    ) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetNotificationOptions(options: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetAutobadgeEnabled(enabled: Boolean, promise: Promise) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosIsAutobadgeEnabled(promise: Promise) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetBadgeNumber(badgeNumber: Double, promise: Promise) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosGetBadgeNumber(promise: Promise) {
        promise.resolveResult {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushAndroidIsNotificationChannelEnabled(channel: String?, promise: Promise) {
        promise.resolveResult {
            proxy.push.isNotificationChannelEnabled(requireNotNull(channel))
        }
    }

    @ReactMethod
    override fun pushAndroidSetNotificationConfig(config: ReadableMap?) {
        proxy.push.setNotificationConfig(Utils.convertMap(config).toJsonValue())
    }

    @ReactMethod
    override fun contactIdentify(namedUser: String?, promise: Promise) {
        promise.resolveResult {
            proxy.contact.identify(namedUser) // TODO
        }
    }

    @ReactMethod
    override fun contactReset(promise: Promise) {
        promise.resolveResult {
            proxy.contact.reset()
        }
    }

    @ReactMethod
    override fun contactGetNamedUserId(promise: Promise) {
        promise.resolveResult {
            proxy.contact.getNamedUserId()
        }
    }

    @ReactMethod
    override fun contactGetSubscriptionLists(promise: Promise) {
        promise.resolveDeferred { callback ->
            proxy.contact.getSubscriptionLists().addResultCallback {
                callback(JsonValue.wrapOpt(it), null)
            }
        }
    }

    @ReactMethod
    override fun contactEditTagGroups(operations: ReadableArray?, promise: Promise) {
        promise.resolve {
            proxy.contact.editTagGroups(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun contactEditAttributes(operations: ReadableArray?, promise: Promise) {
        promise.resolve {
            proxy.contact.editAttributes(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun contactEditContactSubscriptionLists(
        operations: ReadableArray?,
        promise: Promise
    ) {
        promise.resolve {
            proxy.contact.editSubscriptionLists(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun analyticsTrackScreen(screen: String?, promise: Promise) {
        promise.resolveResult {
            proxy.analytics.trackScreen(screen)
        }
    }

    @ReactMethod
    override fun analyticsAssociateIdentifier(
        key: String?,
        identifier: String?,
        promise: Promise
    ) {
        promise.resolveResult {
            proxy.analytics.associateIdentifier(requireNotNull(key), identifier)
        }
    }

    @ReactMethod
    override fun actionRun(name: String?, value: ReadableMap?, promise: Promise) {
        promise.resolveDeferred { callback ->
            proxy.actions.runAction(requireNotNull(name), Utils.convertMap(value).toJsonValue())
                .addResultCallback { actionResult ->
                    if (actionResult != null && actionResult.status == ActionResult.STATUS_COMPLETED) {
                        callback(actionResult.value, null)
                    } else {
                        callback(null, Exception("Action failed ${actionResult?.status}"))
                    }
                }
        }
    }

    @ReactMethod
    override fun privacyManagerSetEnabledFeatures(features: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.privacyManager.setEnabledFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerGetEnabledFeatures(promise: Promise) {
        promise.resolveResult {
            JsonValue.wrapOpt(proxy.privacyManager.getFeatureNames())
        }
    }

    @ReactMethod
    override fun privacyManagerEnableFeature(features: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.privacyManager.enableFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerDisableFeature(features: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.privacyManager.disableFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerIsFeatureEnabled(features: ReadableArray?, promise: Promise) {
        promise.resolveResult {
            proxy.privacyManager.isFeatureEnabled(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun inAppSetDisplayInterval(milliseconds: Double, promise: Promise) {
        promise.resolveResult {
            this.proxy.inApp.setDisplayInterval(milliseconds.toLong())
        }
    }

    @ReactMethod
    override fun inAppGetDisplayInterval(promise: Promise) {
        promise.resolveResult {
            this.proxy.inApp.getDisplayInterval()
        }
    }

    @ReactMethod
    override fun inAppSetPaused(paused: Boolean, promise: Promise) {
        promise.resolveResult {
            proxy.inApp.setPaused(paused)
        }
    }

    @ReactMethod
    override fun inAppIsPaused(promise: Promise) {
        promise.resolveResult {
            proxy.inApp.isPaused()
        }
    }

    @ReactMethod
    override fun messageCenterGetUnreadCount(promise: Promise) {
        promise.resolveResult {
            proxy.messageCenter.getUnreadMessagesCount()
        }
    }

    @ReactMethod
    override fun messageCenterDismiss(promise: Promise) {
        promise.resolveResult {
            proxy.messageCenter.dismiss()
        }
    }

    @ReactMethod
    override fun messageCenterDisplay(messageId: String?, promise: Promise) {
        promise.resolveResult {
            proxy.messageCenter.display(messageId)
        }
    }

    @ReactMethod
    override fun messageCenterGetMessages(promise: Promise) {
        promise.resolveResult {
            JsonValue.wrapOpt(proxy.messageCenter.getMessages())
        }
    }

    @ReactMethod
    override fun messageCenterDeleteMessage(messageId: String?, promise: Promise) {
        promise.resolveResult {
            proxy.messageCenter.deleteMessage(requireNotNull(messageId))
        }
    }

    @ReactMethod
    override fun messageCenterMarkMessageRead(messageId: String?, promise: Promise) {
        promise.resolveResult {
            proxy.messageCenter.markMessageRead(requireNotNull(messageId))
        }
    }

    @ReactMethod
    override fun messageCenterRefresh(promise: Promise) {
        promise.resolveDeferred { callback ->
            proxy.messageCenter.refreshInbox().addResultCallback {
                if (it == true) {
                    callback(null, null)
                } else {
                    callback(null, Exception("Failed to refresh"))
                }
            }
        }
    }

    @ReactMethod
    override fun messageCenterSetAutoLaunchDefaultMessageCenter(enabled: Boolean) {
        proxy.messageCenter.setAutoLaunchDefaultMessageCenter(enabled)
    }

    @ReactMethod
    override fun preferenceCenterDisplay(preferenceCenterId: String?, promise: Promise) {
        promise.resolveResult {
            proxy.preferenceCenter.displayPreferenceCenter(requireNotNull(preferenceCenterId))
        }
    }

    @ReactMethod
    override fun preferenceCenterGetConfig(preferenceCenterId: String?, promise: Promise) {
        promise.resolvePending {
            proxy.preferenceCenter.getPreferenceCenterConfig(requireNotNull(preferenceCenterId))
        }
    }

    @ReactMethod
    override fun preferenceCenterAutoLaunchDefaultPreferenceCenter(
        preferenceCenterId: String?,
        autoLaunch: Boolean
    ) {
        if (preferenceCenterId != null) {
            proxy.preferenceCenter.setAutoLaunchPreferenceCenter(preferenceCenterId, autoLaunch)
        }
    }

    @ReactMethod
    override fun localeSetLocaleOverride(localeIdentifier: String?, promise: Promise) {
        promise.resolveResult {
//            proxy.locale.setCurrentLocale(localeIdentifier)
        }
    }

    @ReactMethod
    override fun localeGetLocale(promise: Promise) {
        promise.resolveResult {
            proxy.locale.getCurrentLocale()
        }
    }

    @ReactMethod
    override fun localeClearLocaleOverride(promise: Promise) {
        promise.resolveResult {
            proxy.locale.clearLocale()
        }
    }

    private fun notifyPending() {
        if (context.hasActiveReactInstance()) {
            val appEventEmitter = context.getJSModule(RCTNativeAppEventEmitter::class.java)
            appEventEmitter.emit("com.airship.pending_events", null)
        }
    }

    companion object {
        const val NAME = "RTNAirship"
    }

}

internal fun JsonSerializable.toReactType(): Any? {
    return Utils.convertJsonValue(toJsonValue())
}

internal fun Promise.resolveResult(function: () -> Any?) {
    resolveDeferred { callback -> callback(function(), null) }
}

internal fun <T> Promise.resolveDeferred(function: ((T?, Exception?) -> Unit) -> Unit) {
    try {
        function { result, error ->
            if (error != null) {
                this.reject("AIRSHIP_ERROR", error)
            }
            try {
                when (result) {
                    is Unit -> {
                        this.resolve(null)
                    }
                    is JsonSerializable -> {
                        this.resolve(result.toReactType())
                    }
                    else -> {
                        this.resolve(result)
                    }
                }
            } catch (e: Exception) {
                this.reject("AIRSHIP_ERROR", e)
            }
        }
    } catch (e: Exception) {
        this.reject("AIRSHIP_ERROR", e)
    }
}

internal fun <T> Promise.resolvePending(function: () -> PendingResult<T>) {
    resolveDeferred { callback ->
        function().addResultCallback {
            callback(it, null)
        }
    }
}


internal fun EventType.isForeground(): Boolean {
    return when (this) {
        EventType.PUSH_TOKEN_RECEIVED -> false
        EventType.BACKGROUND_NOTIFICATION_RESPONSE_RECEIVED -> false
        EventType.PUSH_RECEIVED -> false
        else -> true
    }
}




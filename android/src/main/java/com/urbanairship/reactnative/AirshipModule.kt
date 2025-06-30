package com.urbanairship.reactnative

import android.annotation.SuppressLint
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.RCTNativeAppEventEmitter
import com.urbanairship.actions.ActionResult
import com.urbanairship.android.framework.proxy.EventType
import com.urbanairship.android.framework.proxy.ProxyLogger
import com.urbanairship.android.framework.proxy.events.EventEmitter
import com.urbanairship.android.framework.proxy.proxies.AirshipProxy
import com.urbanairship.android.framework.proxy.proxies.EnableUserNotificationsArgs
import com.urbanairship.android.framework.proxy.proxies.FeatureFlagProxy
import com.urbanairship.android.framework.proxy.proxies.LiveUpdateRequest
import com.urbanairship.android.framework.proxy.proxies.SuspendingPredicate
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonSerializable
import com.urbanairship.json.JsonValue
import com.urbanairship.reactnative.ManifestUtils.isHeadlessJSTaskEnabledOnStart
import kotlin.time.Duration.Companion.milliseconds
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.filter
import java.util.UUID

class AirshipModule internal constructor(val context: ReactApplicationContext) : AirshipSpec(context) {
    override fun getName() = NAME

    private val proxy = AirshipProxy.shared(context)

    private var isOverrideForegroundDisplayEnabled: Boolean = false
    private val foregroundDisplayRequestMap = mutableMapOf<String, CompletableDeferred<Boolean>>()

    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main) + SupervisorJob()

    private val foregroundDisplayPredicate = object : SuspendingPredicate<Map<String, Any>> {
        override suspend fun apply(value: Map<String, Any>): Boolean {
            val deferred = CompletableDeferred<Boolean>()
            synchronized(foregroundDisplayRequestMap) {
                if (!isOverrideForegroundDisplayEnabled || !context.hasActiveReactInstance()) {
                    return true
                }

                val requestId = UUID.randomUUID().toString()
                foregroundDisplayRequestMap[requestId] = deferred

                notifyForegroundDisplayRequest(
                        JsonMap.newBuilder()
                                .putOpt("pushPayload", value)
                                .put("requestId", requestId)
                                .build()
                )
            }

            return deferred.await()
        }
    }

    @SuppressLint("RestrictedApi")
    override fun initialize() {
        super.initialize()

        if (!context.isHeadlessJSTaskEnabledOnStart()) {
          scope.launch {
            EventEmitter.shared().pendingEventListener
              .filter { !it.type.isForeground() }
              .collect {
                AirshipHeadlessEventService.startService(context)
              }
          }
        }

        scope.launch {
            // Background events will create a headless JS task in ReactAutopilot since
            // initialized wont be called until we have a JS task.
            EventEmitter.shared().pendingEventListener
                .filter { it.type.isForeground() }
                .collect {
                    notifyPending()
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

        proxy.push.foregroundNotificationDisplayPredicate = this.foregroundDisplayPredicate
        ProxyLogger.debug("AirshipModule initialized")
    }

    override fun invalidate() {
        super.invalidate()
        scope.cancel()
    }

    @ReactMethod
    override fun takeOff(config: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.takeOff(Utils.convertMap(requireNotNull(config)).toJsonValue())
        }
    }

    @ReactMethod
    override fun isFlying(promise: Promise) {
        promise.resolve(scope) {
            this.proxy.isFlying()
        }
    }

    @ReactMethod
    override fun airshipListenerAdded(eventName: String?) {
        if (eventName == null) {
            return
        }

        val eventTypes = Utils.parseEventTypes(eventName)
        if (eventTypes.isEmpty()) {
            return
        }

        if (eventTypes.any { it.isForeground() }) {
            notifyPending()
        }

        if (eventTypes.any { !it.isForeground() }) {
            AirshipHeadlessEventService.startService(context)
        }
    }

    @SuppressLint("RestrictedApi")
    @ReactMethod
    override fun takePendingEvents(eventName: String?, isHeadlessJS: Boolean, promise: Promise) {
        promise.resolve(scope) {
            val eventTypes = Utils.parseEventTypes(requireNotNull(eventName))
                    .filter {
                        if (isHeadlessJS) {
                            !it.isForeground()
                        } else {
                            it.isForeground()
                        }
                    }

            val result = JsonValue.wrapOpt(EventEmitter.shared().takePending(eventTypes).map { it.body })
            ProxyLogger.verbose("Taking events: $eventName, isHeadlessJS: $isHeadlessJS, filteredTypes:$eventTypes, result: $result")
            result
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
    override fun channelEnableChannelCreation(promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.enableChannelCreation()
        }
    }

    @ReactMethod
    override fun channelAddTag(tag: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.addTag(requireNotNull(tag))
        }
    }

    @ReactMethod
    override fun channelRemoveTag(tag: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.removeTag(requireNotNull(tag))
        }
    }

    @ReactMethod
    override fun channelEditTags(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.editTags(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun channelGetTags(promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.getTags()
        }
    }

    @ReactMethod
    override fun channelGetChannelId(promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.getChannelId()
        }
    }

    @ReactMethod
    override fun channelWaitForChannelId(promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.waitForChannelId()
        }
    }

    @ReactMethod
    override fun channelGetSubscriptionLists(promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.getSubscriptionLists()
        }
    }

    @ReactMethod
    override fun channelEditTagGroups(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.editTagGroups(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun channelEditAttributes(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.editAttributes(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun channelEditSubscriptionLists(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.channel.editSubscriptionLists(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun pushSetUserNotificationsEnabled(enabled: Boolean, promise: Promise) {
        promise.resolve(scope) {
            proxy.push.setUserNotificationsEnabled(enabled)
        }
    }

    @ReactMethod
    override fun pushIsUserNotificationsEnabled(promise: Promise) {
        promise.resolve(scope) {
            proxy.push.isUserNotificationsEnabled()
        }
    }

    @ReactMethod
    override fun pushEnableUserNotifications(options: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            val args = options?.let {
                EnableUserNotificationsArgs.fromJson(Utils.convertMap(it).toJsonValue())
            }
            proxy.push.enableUserPushNotifications(args = args)
        }
    }

    @ReactMethod
    override fun pushGetNotificationStatus(promise: Promise) {
        promise.resolve(scope) {
            proxy.push.getNotificationStatus()
        }
    }

    @ReactMethod
    override fun pushGetRegistrationToken(promise: Promise) {
        promise.resolve(scope) {
            proxy.push.getRegistrationToken()
        }
    }

    @ReactMethod
    override fun pushGetActiveNotifications(promise: Promise) {
        promise.resolve(scope) {
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
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetNotificationOptions(options: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetAutobadgeEnabled(enabled: Boolean, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosIsAutobadgeEnabled(promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosSetBadgeNumber(badgeNumber: Double, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosGetBadgeNumber(promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun pushIosIsOverridePresentationOptionsEnabled(enabled: Boolean) {
        // iOS only
    }

    @ReactMethod
    override fun pushIosOverridePresentationOptions(requestId: String?, options: ReadableArray?) {
        // iOS only
    }

    @ReactMethod
    override fun pushIosGetAuthorizedNotificationSettings(promise: Promise) {
        // iOS only
    }

    @ReactMethod
    override fun pushIosGetAuthorizedNotificationStatus(promise: Promise) {
        // iOS only
    }

    @ReactMethod
    override fun pushAndroidIsNotificationChannelEnabled(channel: String?, promise: Promise) {
        promise.resolve(scope) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                proxy.push.isNotificationChannelEnabled(requireNotNull(channel))
            } else {
                true
            }
        }
    }

    @ReactMethod
    override fun pushAndroidIsOverrideForegroundDisplayEnabled(enabled: Boolean) {
        synchronized(this.foregroundDisplayRequestMap) {
            this.isOverrideForegroundDisplayEnabled = enabled

            if (!enabled) {
                foregroundDisplayRequestMap.values.forEach {
                    it.complete(true)
                }
                foregroundDisplayRequestMap.clear()
            }
        }
    }

    @ReactMethod
    override fun pushAndroidOverrideForegroundDisplay(requestId: String?, shouldDisplay: Boolean) {
        if (requestId == null) {
            return
        }

        synchronized(this.foregroundDisplayRequestMap) {
            this.foregroundDisplayRequestMap.remove(requestId)?.complete(shouldDisplay)
        }
    }

    @ReactMethod
    override fun pushAndroidSetNotificationConfig(config: ReadableMap?) {
        proxy.push.setNotificationConfig(Utils.convertMap(config).toJsonValue())
    }

    @ReactMethod
    override fun contactIdentify(namedUser: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.identify(namedUser)
        }
    }

    @ReactMethod
    override fun contactReset(promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.reset()
        }
    }

    @ReactMethod
    override fun contactNotifyRemoteLogin(promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.notifyRemoteLogin()
        }
    }

    @ReactMethod
    override fun contactGetNamedUserId(promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.getNamedUserId()
        }
    }

    @ReactMethod
    override fun contactGetSubscriptionLists(promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.getSubscriptionLists()
        }
    }

    @ReactMethod
    override fun contactEditTagGroups(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.editTagGroups(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun contactEditAttributes(operations: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.contact.editAttributes(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun contactEditSubscriptionLists(
            operations: ReadableArray?,
            promise: Promise
    ) {
        promise.resolve(scope) {
            proxy.contact.editSubscriptionLists(Utils.convertArray(operations).toJsonValue())
        }
    }

    @ReactMethod
    override fun analyticsTrackScreen(screen: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.analytics.trackScreen(screen)
        }
    }

    @ReactMethod
    override fun analyticsAssociateIdentifier(
            key: String?,
            identifier: String?,
            promise: Promise
    ) {
        promise.resolve(scope) {
            proxy.analytics.associateIdentifier(requireNotNull(key), identifier)
        }
    }

    @ReactMethod
    override fun addCustomEvent(event: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.analytics.addEvent(Utils.convertMap(event).toJsonValue())
        }
    }

    @ReactMethod
    override fun analyticsGetSessionId(
        promise: Promise
    ) {
        promise.resolve(scope) {
            proxy.analytics.getSessionId()
        }
    }

    @ReactMethod
    override fun actionRun(action: ReadableMap, promise: Promise) {
        promise.resolve(scope) {
            val result = proxy.actions.runAction(requireNotNull(action.getString("name")), Utils.convertDynamic(action.getDynamic("value")))
            if (result.status == ActionResult.STATUS_COMPLETED) {
                result.value
            } else {
                throw Exception("Action failed ${result.status}")
            }
        }
    }

    @ReactMethod
    override fun privacyManagerSetEnabledFeatures(features: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.privacyManager.setEnabledFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerGetEnabledFeatures(promise: Promise) {
        promise.resolve(scope) {
            proxy.privacyManager.getFeatureNames()
        }
    }

    @ReactMethod
    override fun privacyManagerEnableFeature(features: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.privacyManager.enableFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerDisableFeature(features: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.privacyManager.disableFeatures(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun privacyManagerIsFeatureEnabled(features: ReadableArray?, promise: Promise) {
        promise.resolve(scope) {
            proxy.privacyManager.isFeatureEnabled(
                Utils.convertArray(requireNotNull(features))
            )
        }
    }

    @ReactMethod
    override fun inAppSetDisplayInterval(milliseconds: Double, promise: Promise) {
        promise.resolve(scope) {
            this.proxy.inApp.setDisplayInterval(milliseconds.toLong())
        }
    }

    @ReactMethod
    override fun inAppGetDisplayInterval(promise: Promise) {
        promise.resolve(scope) {
            this.proxy.inApp.getDisplayInterval()
        }
    }

    @ReactMethod
    override fun inAppSetPaused(paused: Boolean, promise: Promise) {
        promise.resolve(scope) {
            proxy.inApp.setPaused(paused)
        }
    }

    @ReactMethod
    override fun inAppIsPaused(promise: Promise) {
        promise.resolve(scope) {
            proxy.inApp.isPaused()
        }
    }

    @ReactMethod
    override fun inAppResendPendingEmbeddedEvent() {
        proxy.inApp.resendLastEmbeddedEvent()
    }

    @ReactMethod
    override fun messageCenterGetUnreadCount(promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.getUnreadMessagesCount()
        }
    }

    @ReactMethod
    override fun messageCenterDismiss(promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.dismiss()
        }
    }

    @ReactMethod
    override fun messageCenterDisplay(messageId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.display(messageId)
        }
    }

    @ReactMethod
    override fun messageCenterGetMessages(promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.getMessages()
        }
    }

    @ReactMethod
    override fun messageCenterDeleteMessage(messageId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.deleteMessage(requireNotNull(messageId))
        }
    }

    @ReactMethod
    override fun messageCenterMarkMessageRead(messageId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.markMessageRead(requireNotNull(messageId))
        }
    }

    @ReactMethod
    override fun messageCenterRefresh(promise: Promise) {
        promise.resolve(scope) {
            if (!proxy.messageCenter.refreshInbox()) {
                throw Exception("Failed to refresh")
            }
        }
    }

    @ReactMethod
    override fun messageCenterSetAutoLaunchDefaultMessageCenter(enabled: Boolean) {
        proxy.messageCenter.setAutoLaunchDefaultMessageCenter(enabled)
    }

    @ReactMethod
    override fun messageCenterShowMessageCenter(messageId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.showMessageCenter(messageId)
        }
    }

    @ReactMethod
    override fun messageCenterShowMessageView(messageId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.messageCenter.showMessageView(requireNotNull(messageId))
        }
    }

    @ReactMethod
    override fun preferenceCenterDisplay(preferenceCenterId: String?, promise: Promise) {
        promise.resolve(scope) {
            proxy.preferenceCenter.displayPreferenceCenter(requireNotNull(preferenceCenterId))
        }
    }

    @ReactMethod
    override fun preferenceCenterGetConfig(preferenceCenterId: String?, promise: Promise) {
        promise.resolve(scope) {
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
        promise.resolve(scope) {
            if (localeIdentifier.isNullOrEmpty()) {
                proxy.locale.clearLocale()
            } else {
                proxy.locale.setCurrentLocale(localeIdentifier)
            }
        }
    }

    @ReactMethod
    override fun localeGetLocale(promise: Promise) {
        promise.resolve(scope) {
            proxy.locale.getCurrentLocale()
        }
    }

    @ReactMethod
    override fun localeClearLocaleOverride(promise: Promise) {
        promise.resolve(scope) {
            proxy.locale.clearLocale()
        }
    }

    @ReactMethod
    override fun featureFlagManagerFlag(flagName: String, useResultCache: Boolean, promise: Promise) {
        promise.resolve(scope) {
            proxy.featureFlagManager.flag(flagName, useResultCache)
        }
    }

    @ReactMethod
    override fun featureFlagManagerTrackInteraction(flag: ReadableMap, promise: Promise) {
        promise.resolve(scope) {
            val parsedFlag = FeatureFlagProxy(Utils.convertMap(flag).toJsonValue())
            proxy.featureFlagManager.trackInteraction(parsedFlag)
        }
    }

    @ReactMethod
    override fun featureFlagManagerResultCacheGetFlag(flagName: String, promise: Promise) {
        promise.resolve(scope) {
            proxy.featureFlagManager.resultCache.flag(flagName)
        }
    }

    @ReactMethod
    override fun featureFlagManagerResultCacheSetFlag(flag: ReadableMap, ttl: Double, promise: Promise) {
        promise.resolve(scope) {
            val parsedFlag = FeatureFlagProxy(Utils.convertMap(flag).toJsonValue())
            proxy.featureFlagManager.resultCache.cache(parsedFlag, ttl.milliseconds)
        }
    }

    @ReactMethod
    override fun featureFlagManagerResultCacheRemoveFlag(flagName: String, promise: Promise) {
        promise.resolve(scope) {
            proxy.featureFlagManager.resultCache.removeCachedFlag(flagName)
        }
    }

    @ReactMethod
    override fun liveActivityListAll(promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun liveActivityList(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun liveActivityStart(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun liveActivityUpdate(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun liveActivityEnd(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            throw IllegalStateException("Not supported on Android")
        }
    }

    @ReactMethod
    override fun liveUpdateListAll(promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.listAll()
        }
    }

    @ReactMethod
    override fun liveUpdateList(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.list(
                LiveUpdateRequest.List.fromJson(Utils.convertMap(requireNotNull(request)).toJsonValue())
            )
        }
    }

    @ReactMethod
    override fun liveUpdateStart(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.start(
                LiveUpdateRequest.Start.fromJson(Utils.convertMap(requireNotNull(request)).toJsonValue())
            )
        }
    }

    @ReactMethod
    override fun liveUpdateUpdate(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.update(
                LiveUpdateRequest.Update.fromJson(Utils.convertMap(requireNotNull(request)).toJsonValue())
            )
        }
    }

    @ReactMethod
    override fun liveUpdateEnd(request: ReadableMap?, promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.end(
                LiveUpdateRequest.End.fromJson(Utils.convertMap(requireNotNull(request)).toJsonValue())
            )
        }
    }

    @ReactMethod
    override fun liveUpdateClearAll(promise: Promise) {
        promise.resolve(scope) {
            proxy.liveUpdateManager.clearAll()
        }
    }

    private fun notifyPending() {
        if (context.hasActiveReactInstance()) {
            val appEventEmitter = context.getJSModule(RCTNativeAppEventEmitter::class.java)
            appEventEmitter.emit("com.airship.pending_events", null)
        }
    }

    private fun notifyForegroundDisplayRequest(body: JsonMap) {
        if (context.hasActiveReactInstance()) {
            val appEventEmitter = context.getJSModule(RCTNativeAppEventEmitter::class.java)
            appEventEmitter.emit("com.airship.android.override_foreground_display", body.toReactType())
        }
    }

    companion object {
        const val NAME = "RTNAirship"
    }

}

internal fun JsonSerializable.toReactType(): Any? {
    return Utils.convertJsonValue(toJsonValue())
}


internal fun Promise.resolve(scope: CoroutineScope, function: suspend () -> Any?) {
    scope.launch {
        try {
            when (val result = function()) {
                is Unit -> {
                    this@resolve.resolve(null)
                }
                is JsonSerializable -> {
                    this@resolve.resolve(result.toReactType())
                }
                is Number -> {
                    this@resolve.resolve(result.toDouble())
                }
                else -> {
                    this@resolve.resolve(JsonValue.wrapOpt(result).toReactType())
                }
            }
        } catch (e: Exception) {
            this@resolve.reject("AIRSHIP_ERROR", e)
        }
    }
}


internal fun EventType.isForeground(): Boolean {
    return when (this) {
        EventType.PUSH_TOKEN_RECEIVED -> false
        EventType.BACKGROUND_NOTIFICATION_RESPONSE_RECEIVED -> false
        EventType.BACKGROUND_PUSH_RECEIVED -> false
        EventType.FOREGROUND_PUSH_RECEIVED -> false // Treat all push received as background on React
        else -> true
    }
}




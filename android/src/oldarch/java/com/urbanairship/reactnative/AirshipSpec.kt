package com.urbanairship.reactnative

import com.facebook.react.bridge.*

abstract class AirshipSpec internal constructor(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun takeOff(config: ReadableMap?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun isFlying(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun airshipListenerAdded(eventName: String?)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun takePendingEvents(
        eventName: String?,
        isHeadlessJS: Boolean,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun addListener(eventType: String?)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun removeListeners(count: Double)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelEnableChannelCreation(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelAddTag(tag: String?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelRemoveTag(tag: String?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelGetTags(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelGetChannelId(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelGetSubscriptionLists(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelEditTagGroups(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelEditTags(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelEditAttributes(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun channelEditSubscriptionLists(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushSetUserNotificationsEnabled(
        enabled: Boolean,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIsUserNotificationsEnabled(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushEnableUserNotifications(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushGetNotificationStatus(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushGetRegistrationToken(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushGetActiveNotifications(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushClearNotifications()

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushClearNotification(identifier: String?)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosSetForegroundPresentationOptions(
        options: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosSetNotificationOptions(
        options: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosSetAutobadgeEnabled(
        enabled: Boolean,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosIsAutobadgeEnabled(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosSetBadgeNumber(
        badgeNumber: Double,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosGetBadgeNumber(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosIsOverridePresentationOptionsEnabled(enabled: Boolean)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosOverridePresentationOptions(requestId: String?, options: ReadableArray?)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushAndroidIsNotificationChannelEnabled(
        channel: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushAndroidSetNotificationConfig(config: ReadableMap?)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun  pushAndroidIsOverrideForegroundDisplayEnabled(enabled: Boolean)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushAndroidOverrideForegroundDisplay(requestId: String?, shouldDisplay: Boolean)


    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactIdentify(namedUser: String?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactReset(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactNotifyRemoteLogin(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactGetNamedUserId(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactGetSubscriptionLists(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactEditTagGroups(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactEditAttributes(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun contactEditSubscriptionLists(
        operations: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun analyticsTrackScreen(screen: String?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun analyticsAssociateIdentifier(
        key: String?,
        identifier: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun actionRun(
        name: String?,
        value: Dynamic?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun privacyManagerSetEnabledFeatures(
        features: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun privacyManagerGetEnabledFeatures(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun privacyManagerEnableFeature(
        features: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun privacyManagerDisableFeature(
        features: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun privacyManagerIsFeatureEnabled(
        features: ReadableArray?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun inAppSetDisplayInterval(
        milliseconds: Double,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun inAppGetDisplayInterval(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun inAppSetPaused(paused: Boolean, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun inAppIsPaused(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterGetUnreadCount(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterDismiss(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterDisplay(
        messageId: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterGetMessages(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterDeleteMessage(
        messageId: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterMarkMessageRead(
        messageId: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterRefresh(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun messageCenterSetAutoLaunchDefaultMessageCenter(enabled: Boolean)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun preferenceCenterDisplay(
        preferenceCenterId: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun preferenceCenterGetConfig(
        preferenceCenterId: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun preferenceCenterAutoLaunchDefaultPreferenceCenter(
        preferenceCenterId: String?,
        autoLaunch: Boolean
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun localeSetLocaleOverride(
        localeIdentifier: String?,
        promise: Promise
    )

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun localeGetLocale(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun localeClearLocaleOverride(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosGetAuthorizedNotificationSettings(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun pushIosGetAuthorizedNotificationStatus(promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun featureFlagManagerFlag(flagName: String?, promise: Promise)

    @ReactMethod
    @com.facebook.proguard.annotations.DoNotStrip
    abstract fun featureFlagManagerTrackInteraction(flag: ReadableMap?, promise: Promise)
}



/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import AirshipFrameworkProxy
import React

@objc
public class AirshipReactNative: NSObject {

    @objc
    public static var proxy: AirshipProxy {
        AirshipProxy.shared
    }

    public static let version: String = "15.1.0"

    private let eventNotifier = EventNotifier()

    @objc
    public static let shared: AirshipReactNative = AirshipReactNative()

    @objc
    public func setNotifier(_ notifier: (() -> Void)?) {
        Task {
            await eventNotifier.setNotifier(notifier)
            if await AirshipProxyEventEmitter.shared.hasAnyEvents() {
                await eventNotifier.notifyPendingEvents()
            }
        }
    }

    @objc
    public func onLoad(
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) {
        AirshipProxy.shared.delegate = self
        try? AirshipProxy.shared.attemptTakeOff(launchOptions: launchOptions)

        Task {
            let stream = await AirshipProxyEventEmitter.shared.pendingEventTypeAdded
            for await _ in stream {
                await self.eventNotifier.notifyPendingEvents()
            }
        }
    }

    @objc
    public func onListenerAdded(eventName: String) {
        guard let type = try? AirshipProxyEventType.fromReactName(eventName) else {
            return
        }

        Task {
            if (await AirshipProxyEventEmitter.shared.hasEvent(type: type)) {
                await self.eventNotifier.notifyPendingEvents()
            }
        }
    }

    @objc
    public func takePendingEvents(eventName: String) async -> [Any] {
        guard let type = try? AirshipProxyEventType.fromReactName(eventName) else {
            return []
        }

        return await AirshipProxyEventEmitter.shared.takePendingEvents(
            type: type
        ).map { $0.body }
    }


    @objc
    public func attemptTakeOff(
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    )  {
        try? AirshipProxy.shared.attemptTakeOff(launchOptions: launchOptions)
    }
}

// Airship
public extension AirshipReactNative {
    @objc
    func takeOff(
        json: Any,
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.takeOff(
                json: json,
                launchOptions: launchOptions
            )
        )
    }

    @objc
    func isFlying() -> Bool {
        return Airship.isFlying
    }

}

// Channel
@objc
public extension AirshipReactNative {
    
    @objc
    func channelAddTag(_ tag: String) throws {
        return try AirshipProxy.shared.channel.addTags([tag])
    }

    @objc
    func channelRemoveTag(_ tag: String) throws {
        return try AirshipProxy.shared.channel.removeTags([tag])
    }

    @objc
    func channelEnableChannelCreation() throws -> Void {
        try AirshipProxy.shared.channel.enableChannelCreation()
    }

    @objc
    func channelGetTags() throws -> [String] {
        return try AirshipProxy.shared.channel.getTags()
    }

    @objc
    func channelGetSubscriptionLists() async throws -> [String] {
        return try await AirshipProxy.shared.channel.getSubscriptionLists()
    }

    @objc
    func channelGetChannelIdOrEmpty() throws -> String {
        return try AirshipProxy.shared.channel.getChannelId() ?? ""
    }

    @objc
    func channelEditTagGroups(json: Any) throws {
        try AirshipProxy.shared.channel.editTagGroups(json: json)
    }

    @objc
    func channelEditAttributes(json: Any) throws {
        try AirshipProxy.shared.channel.editAttributes(json: json)
    }

    @objc
    func channelEditSubscriptionLists(json: Any) throws {
        try AirshipProxy.shared.channel.editSubscriptionLists(json: json)
    }
}

// Push
@objc
public extension AirshipReactNative {
    @objc
    func pushSetUserNotificationsEnabled(
        _ enabled: Bool
    ) throws -> Void {
        try AirshipProxy.shared.push.setUserNotificationsEnabled(enabled)
    }

    @objc
    func pushIsUserNotificationsEnabled() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.push.isUserNotificationsEnabled()
        )
    }

    @objc
    func pushEnableUserNotifications() async throws -> Bool {
        return try await AirshipProxy.shared.push.enableUserPushNotifications()
    }

    @objc
    func pushGetRegistrationTokenOrEmpty() throws -> String {
        return try AirshipProxy.shared.push.getRegistrationToken() ?? ""
    }

    @objc
    func pushSetNotificationOptions(
        names:[String]
    ) throws {
        try AirshipProxy.shared.push.setNotificationOptions(names: names)
    }

    @objc
    func pushSetForegroundPresentationOptions(
        names:[String]
    ) throws {
        try AirshipProxy.shared.push.setForegroundPresentationOptions(
            names: names
        )
    }

    @objc
    func pushGetNotificationStatus() throws -> [String: Any] {
        return try AirshipProxy.shared.push.getNotificationStatus()
    }

    @objc
    func pushSetAutobadgeEnabled(_ enabled: Bool) throws {
        try AirshipProxy.shared.push.setAutobadgeEnabled(enabled)
    }

    @objc
    func pushIsAutobadgeEnabled() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.push.isAutobadgeEnabled()
        )
    }

    @objc
    func pushSetBadgeNumber(_ badgeNumber: Double) throws {
        try AirshipProxy.shared.push.setBadgeNumber(Int(badgeNumber))
    }

    @objc
    func pushGetBadgeNumber() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.push.getBadgeNumber()
        )
    }

    @objc
    func pushClearNotifications() {
        AirshipProxy.shared.push.clearNotifications()
    }

    @objc
    func pushClearNotification(_ identifier: String) {
        AirshipProxy.shared.push.clearNotification(identifier)
    }

    @objc
    func pushGetActiveNotifications() async -> [[String: Any]] {
        return await AirshipProxy.shared.push.getActiveNotifications()
    }
}

// Actions
@objc
public extension AirshipReactNative {
    func actionsRun(actionName: String, actionValue: Any?) async throws-> Any? {
        return try await AirshipProxy.shared.action.runAction(
            actionName,
            actionValue: actionValue
        )
    }
}

// Analytics
@objc
public extension AirshipReactNative {

    func analyticsTrackScreen(_ screen: String?) throws {
        try AirshipProxy.shared.analytics.trackScreen(screen)
    }

    func analyticsAssociateIdentifier(_ identifier: String?, key: String) throws {
        try AirshipProxy.shared.analytics.associateIdentifier(
            identifier: identifier,
            key: key
        )
    }
}

// Contact
@objc
public extension AirshipReactNative {

    @objc
    func contactIdentify(_ namedUser: String?) throws {
        try AirshipProxy.shared.contact.identify(namedUser ?? "")
    }

    @objc
    func contactReset() throws {
        try AirshipProxy.shared.contact.reset()
    }

    @objc
    func contactGetNamedUserIdOrEmtpy() throws -> String {
        return try AirshipProxy.shared.contact.getNamedUser() ?? ""
    }

    @objc
    func contactGetSubscriptionLists() async throws -> [String: [String]] {
        return try await AirshipProxy.shared.contact.getSubscriptionLists()
    }

    @objc
    func contactEditTagGroups(json: Any) throws {
        try AirshipProxy.shared.contact.editTagGroups(json: json)
    }

    @objc
    func contactEditAttributes(json: Any) throws {
        try AirshipProxy.shared.contact.editAttributes(json: json)
    }

    @objc
    func contactEditSubscriptionLists(json: Any) throws {
        try AirshipProxy.shared.contact.editSubscriptionLists(json: json)
    }
}

// InApp
@objc
public extension AirshipReactNative {

    func inAppIsPaused() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.inApp.isPaused()
        )
    }

    func inAppSetPaused(_ paused: Bool) throws {
        try AirshipProxy.shared.inApp.setPaused(paused)
    }

    func inAppSetDisplayInterval(milliseconds: Double) throws {
        try AirshipProxy.shared.inApp.setDisplayInterval(Int(milliseconds))
    }

    func inAppGetDisplayInterval() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.inApp.getDisplayInterval()
        )
    }
}

// Locale
@objc
public extension AirshipReactNative {
    @objc
    func localeSetLocaleOverride(localeIdentifier: String?) throws {
        try AirshipProxy.shared.locale.setCurrentLocale(localeIdentifier)
    }

    @objc
    func localeClearLocaleOverride() throws {
        try AirshipProxy.shared.locale.clearLocale()
    }

    @objc
    func localeGetLocale() throws -> String {
        return try AirshipProxy.shared.locale.getCurrentLocale()
    }
}

// Message Center
@objc
public extension AirshipReactNative {
    @objc
    func messageCenterGetUnreadCount() async throws -> Double {
        return try await Double(AirshipProxy.shared.messageCenter.getUnreadCount())
    }

    @objc
    func messageCenterGetMessages() throws -> [Any] {
        return try AirshipProxy.shared.messageCenter.getMessagesJSON()
    }

    @objc
    func messageCenterMarkMessageRead(messageId: String) async throws  {
        try await AirshipProxy.shared.messageCenter.markMessageRead(
            messageID: messageId
        )
    }

    @objc
    func messageCenterDeleteMessage(messageId: String) async throws  {
        try await AirshipProxy.shared.messageCenter.deleteMessage(
            messageID: messageId
        )
    }

    @objc
    func messageCenterDismiss() throws  {
        return try AirshipProxy.shared.messageCenter.dismiss()
    }

    @objc
    func messageCenterDisplay(messageId: String?) throws  {
        try AirshipProxy.shared.messageCenter.display(messageID: messageId)
    }

    @objc
    func messageCenterRefresh() async throws  {
        try await AirshipProxy.shared.messageCenter.refresh()
    }

    @objc
    func messageCenterSetAutoLaunchDefaultMessageCenter(autoLaunch: Bool) {
        AirshipProxy.shared.messageCenter.setAutoLaunchDefaultMessageCenter(autoLaunch)
    }
}

// Preference Center
@objc
public extension AirshipReactNative {
    @objc
    func preferenceCenterDisplay(preferenceCenterId: String) throws  {
        try AirshipProxy.shared.preferenceCenter.displayPreferenceCenter(
            preferenceCenterID: preferenceCenterId
        )
    }

    @objc
    func preferenceCenterGetConfig(preferenceCenterId: String) async throws -> Any {
        return try await AirshipProxy.shared.preferenceCenter.getPreferenceCenterConfig(
            preferenceCenterID: preferenceCenterId
        )
    }

    @objc
    func preferenceCenterAutoLaunchDefaultPreferenceCenter(
        preferenceCenterId: String,
        autoLaunch: Bool
    ) {
        AirshipProxy.shared.preferenceCenter.setAutoLaunchPreferenceCenter(
            autoLaunch,
            preferenceCenterID: preferenceCenterId
        )
    }
}

// Privacy Manager
@objc
public extension AirshipReactNative {
    @objc
    func privacyManagerSetEnabledFeatures(features: [String]) throws  {
        try AirshipProxy.shared.privacyManager.setEnabled(featureNames: features)
    }

    @objc
    func privacyManagerGetEnabledFeatures() throws -> [String] {
        return try AirshipProxy.shared.privacyManager.getEnabledNames()
    }

    @objc
    func privacyManagerEnableFeature(features: [String]) throws  {
        try AirshipProxy.shared.privacyManager.enable(featureNames: features)
    }

    @objc
    func privacyManagerDisableFeature(features: [String]) throws  {
        try AirshipProxy.shared.privacyManager.disable(featureNames: features)
    }

    @objc
    func privacyManagerIsFeatureEnabled(features: [String]) throws -> NSNumber  {
        return try NSNumber(
            value: AirshipProxy.shared.privacyManager.isEnabled(featuresNames: features)
        )
    }
}


extension AirshipReactNative: AirshipProxyDelegate {
    public func migrateData(store: ProxyStore) {
        ProxyDataMigrator().migrateData(store: store)
    }

    public func loadDefaultConfig() -> Config {
        let config = Config.default()
        config.requireInitialRemoteConfigEnabled = true
        return config
    }

    public func onAirshipReady() {
        Airship.analytics.registerSDKExtension(
            .reactNative,
            version: AirshipReactNative.version
        )
    }
}


private actor EventNotifier {
    private var notifier: (() -> Void)?
    func setNotifier(_ notifier: (() -> Void)?) {
        self.notifier = notifier
    }

    func notifyPendingEvents() {
        self.notifier?()
    }
}


extension AirshipProxyEventType {
    private static let nameMap: [String: AirshipProxyEventType] = [
        "com.airship.deep_link": .deepLinkReceived,
        "com.airship.channel_created": .channelCreated,
        "com.airship.push_token_received": .pushTokenReceived,
        "com.airship.message_center_updated": .messageCenterUpdated,
        "com.airship.display_message_center": .displayMessageCenter,
        "com.airship.display_preference_center": .displayPreferenceCenter,
        "com.airship.notification_response": .notificationResponseReceived,
        "com.airship.push_received": .pushReceived,
        "com.airship.notification_opt_in_status": .notificationOptInStatusChanged
    ]


    public static func fromReactName(_ name: String) throws -> AirshipProxyEventType {
        guard let type = AirshipProxyEventType.nameMap[name] else {
            throw AirshipErrors.error("Invalid type: \(self)")
        }

        return type
    }
}

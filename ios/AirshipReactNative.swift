/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import AirshipFrameworkProxy
import React

@objc
public class AirshipReactNative: NSObject {
    
    @objc
    public static let pendingEventsEventName = "com.airship.pending_events"

    @objc
    public static let overridePresentationOptionsEventName = "com.airship.ios.override_presentation_options"

    
    var lock = AirshipLock()
    var pendingPresentationRequests: [String: PresentationOptionsOverridesRequest] = [:]
    
    @objc
    public var overridePresentationOptionsEnabled: Bool = false {
        didSet {
            if (!overridePresentationOptionsEnabled) {
                lock.sync {
                    self.pendingPresentationRequests.values.forEach { request in
                        request.result(options: nil)
                    }
                    self.pendingPresentationRequests.removeAll()
                }
            }
        }
    }

    public static var proxy: AirshipProxy {
        AirshipProxy.shared
    }

    public static let version: String = "18.0.2"

    private let eventNotifier = EventNotifier()

    @objc
    public static let shared: AirshipReactNative = AirshipReactNative()

    @objc
    public func setNotifier(_ notifier: ((String, [String: Any]) -> Void)?) {
        Task {
            if let notifier = notifier {
                await eventNotifier.setNotifier({
                    notifier(AirshipReactNative.pendingEventsEventName, [:])
                })
                
                if await AirshipProxyEventEmitter.shared.hasAnyEvents() {
                    await eventNotifier.notifyPendingEvents()
                }
                
                
                AirshipProxy.shared.push.presentationOptionOverrides = { request in
                    guard self.overridePresentationOptionsEnabled else {
                        request.result(options: nil)
                        return
                    }
                    
                    let requestID = UUID().uuidString
                    self.lock.sync {
                        self.pendingPresentationRequests[requestID] = request
                    }
                    notifier(
                        AirshipReactNative.overridePresentationOptionsEventName,
                        [
                            "pushPayload": request.pushPayload,
                            "requestId": requestID
                        ]
                    )
                }
            } else {
                await eventNotifier.setNotifier(nil)
                AirshipProxy.shared.push.presentationOptionOverrides = nil
                
                lock.sync {
                    self.pendingPresentationRequests.values.forEach { request in
                        request.result(options: nil)
                    }
                    self.pendingPresentationRequests.removeAll()
                }
            }
        }
    }
    
    @objc
    public func presentationOptionOverridesResult(requestID: String, presentationOptions: [String]?) {
        lock.sync {
            pendingPresentationRequests[requestID]?.result(optionNames: presentationOptions)
            pendingPresentationRequests[requestID] = nil
        }
    }
    

    @objc
    @MainActor
    public func onLoad(
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) {
        AirshipProxy.shared.delegate = self
        try? AirshipProxy.shared.attemptTakeOff(launchOptions: launchOptions)

        Task {
            let stream = await AirshipProxyEventEmitter.shared.pendingEventAdded
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
    @MainActor
    public func attemptTakeOff(
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    )  {
        try? AirshipProxy.shared.attemptTakeOff(launchOptions: launchOptions)
    }
}

// Airship
public extension AirshipReactNative {
    @objc
    @MainActor
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
    func channelEditTags(json: Any) throws {
        try AirshipProxy.shared.channel.editTags(json: json)
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
    func pushGetNotificationStatus() async throws -> [String: Any] {
        return try await AirshipProxy.shared.push.getNotificationStatus()
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
    @MainActor
    func pushSetBadgeNumber(_ badgeNumber: Double) async throws {
        try await AirshipProxy.shared.push.setBadgeNumber(Int(badgeNumber))
    }

    @objc
    @MainActor
    func pushGetBadgeNumber() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.push.getBadgeNumber()
        )
    }

    @objc
    func pushGetAuthorizedNotificationStatus() throws -> String {
        return try AirshipProxy.shared.push.getAuthroizedNotificationStatus()
    }

    @objc
    func pushGetAuthorizedNotificationSettings() throws -> [String] {
        return try AirshipProxy.shared.push.getAuthorizedNotificationSettings()
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
    func actionsRun(action: [String: Any]) async throws-> Any? {
        guard let name = action["name"] as? String else {
            throw AirshipErrors.error("missing name")
        }

        return try await AirshipProxy.shared.action.runAction(
            name,
            value: action["value"] is NSNull ? nil : try AirshipJSON.wrap(action["value"])
        )
    }
}

// Analytics
@objc
public extension AirshipReactNative {

    @MainActor
    func analyticsTrackScreen(_ screen: String?) throws {
        try AirshipProxy.shared.analytics.trackScreen(screen)
    }

    func analyticsAssociateIdentifier(_ identifier: String?, key: String) throws {
        try AirshipProxy.shared.analytics.associateIdentifier(
            identifier: identifier,
            key: key
        )
    }

    func addCustomEvent(_ json: Any) throws {
        try AirshipProxy.shared.analytics.addEvent(json)
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
    func contactNotifyRemoteLogin() throws {
        try AirshipProxy.shared.contact.notifyRemoteLogin()
    }

    @objc
    func contactGetNamedUserIdOrEmtpy() async throws -> String {
        return try await AirshipProxy.shared.contact.getNamedUser() ?? ""
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

    @MainActor
    func inAppIsPaused() throws -> NSNumber {
        return try NSNumber(
            value: AirshipProxy.shared.inApp.isPaused()
        )
    }

    @MainActor
    func inAppSetPaused(_ paused: Bool) throws {
        try AirshipProxy.shared.inApp.setPaused(paused)
    }

    @MainActor
    func inAppSetDisplayInterval(milliseconds: Double) throws {
        try AirshipProxy.shared.inApp.setDisplayInterval(Int(milliseconds))
    }

    @MainActor
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
    func messageCenterGetMessages() async throws -> Any {
        let messages = try await AirshipProxy.shared.messageCenter.getMessages()
        return try AirshipJSON.wrap(messages).unWrap() as Any
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

    @MainActor @objc
    func messageCenterDismiss() throws  {
        return try AirshipProxy.shared.messageCenter.dismiss()
    }

    @MainActor @objc
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



// Feature Flag Manager
@objc
public extension AirshipReactNative {
    @objc
    func featureFlagManagerFlag(flagName: String) async throws -> Any  {
        let result = try await AirshipProxy.shared.featureFlagManager.flag(name: flagName)
        return try AirshipJSON.wrap(result).unWrap() as Any
    }

    @objc
    func featureFlagManagerTrackInteracted(flag: Any) throws {
        let flag: FeatureFlagProxy = try AirshipJSON.wrap(flag).decode()
        try AirshipProxy.shared.featureFlagManager.trackInteraction(flag: flag)
    }
}

extension AirshipReactNative: AirshipProxyDelegate {
    public func migrateData(store: ProxyStore) {
        ProxyDataMigrator().migrateData(store: store)
    }

    public func loadDefaultConfig() -> AirshipConfig {
        let config = AirshipConfig.default()
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
        "com.airship.notification_status_changed": .notificationStatusChanged,
        "com.airship.authorized_notification_settings_changed": .authorizedNotificationSettingsChanged
    ]

    public static func fromReactName(_ name: String) throws -> AirshipProxyEventType {
        guard let type = AirshipProxyEventType.nameMap[name] else {
            throw AirshipErrors.error("Invalid type: \(self)")
        }

        return type
    }
}

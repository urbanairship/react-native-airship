/* Copyright Urban Airship and Contributors */

import Foundation
import AirshipKit
import UserNotifications

@objc(UrbanAirshipReactModule)
class UrbanAirshipReactModule: NSObject, RCTBridgeModule {
    enum ErrorCode: String {
        case takeOffNotCalled = "TAKE_OFF_NOT_CALLED"
        case airshipError = "AIRSHIP_ERROR"
        case messageCenterMessageNotFound = "STATUS_MESSAGE_NOT_FOUND"
        case messageCenterRefreshFailed = "STATUS_INBOX_REFRESH_FAILED"
    }

    static func moduleName() -> String! {
        return "UrbanAirshipReactModule"
    }
    
    @objc var methodQueue: DispatchQueue? {
        return DispatchQueue.main
    }
    
    @objc var bridge: RCTBridge? {
        didSet {

            Task { [weak self] in
                for await _ in PendingEvents.shared.pendingEventUpdates {
                    guard let strongSelf = self else {
                        break
                    }
                    strongSelf.notifyPendingEvent()
                }
            }

            AirshipAutopilot.attemptTakeOff(
                launchOptions: self.bridge?.appLaunchOptions
            )
        }
    }

    private func notifyPendingEvent() {
        self.bridge?.enqueueJSCall(
            "RCTDeviceEventEmitter",
            method: "emit",
            args: ["com.urbanairship.onPendingEvent"],
            completion: {}
        )
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // Module methods
    @objc
    func addListener(_ eventName:String) {

    }
    
    @objc
    func removeListeners(_ count:Int) {

    }
    
    @objc
    func onAirshipListenerAdded(_ eventName: String) {
        Task {
            if await PendingEvents.shared.hasEvent(forName:eventName) {
                notifyPendingEvent()
            }
        }
    }
    
    @objc
    func takeOff(
        _ config: [AnyHashable : Any],
        resolver resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {

        do {
            let pluginConfig = try JSONDecoder().decode(
                PluginConfig.self,
                from: try JSONUtils.data(config)
            )
            PluginStore.shared.config = pluginConfig

            AirshipAutopilot.attemptTakeOff(
                launchOptions: self.bridge?.appLaunchOptions
            )

            resolve(Airship.isFlying)
        } catch {
            rejectPromise(reject, error: error)
        }

    }
    
    @objc
    func isFlying(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        resolve(Airship.isFlying)
    }
    
    @objc
    func takePendingEvents(
        _ type: String,
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        Task {
            let events = await PendingEvents.shared.takeEvents(forName: type)
            resolve(events)
        }
    }

    @objc
    func setUserNotificationsEnabled(_ enabled: Bool) -> Void {
        guard ensureAirshipReady() else { return }
        Airship.push.userPushNotificationsEnabled = enabled
    }
    
    @objc
    func enableChannelCreation() -> Void {
        guard ensureAirshipReady() else { return }
        Airship.channel.enableChannelCreation()
    }
    
    @objc
    func setEnabledFeatures(
        _ features: [Any],
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady(reject) else { return }

        do {
            let features = try Features.parse(features)
            Airship.shared.privacyManager.enabledFeatures = features
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func getEnabledFeatures(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }

        resolve(
            Airship.shared.privacyManager.enabledFeatures.names
        )
    }
    
    @objc
    func enableFeature(
        _ features:[Any],
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady(reject) else { return }

        do {
            Airship.shared.privacyManager.enableFeatures(
                try Features.parse(features)
            )
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func disableFeature(
        _ features:[Any],
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady(reject) else { return }
        
        do {
            Airship.shared.privacyManager.disableFeatures(
                try Features.parse(features)
            )
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func isFeatureEnabled(
        _ features:[Any],
        resolver resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {

        guard ensureAirshipReady(reject) else { return }
        
        do {
            resolve(
                Airship.shared.privacyManager.isEnabled(
                    try Features.parse(features)
                )
            )
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func isUserNotificationsEnabled(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        resolve(Airship.push.userPushNotificationsEnabled)
    }

    @objc
    func enableUserPushNotifications(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        Airship.push.enableUserPushNotifications({ success in
            resolve(NSNumber(value: success))
        })
    }
    
    @objc
    func setNamedUser(_ namedUser: String) {
        guard ensureAirshipReady() else { return }
        let namedUser = namedUser.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        if (namedUser.count > 0) {
            Airship.contact.identify(namedUser)
        } else {
            Airship.contact.reset()
        }
    }
    
    @objc
    func getNamedUser(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        resolve(Airship.contact.namedUserID)
    }
    
    @objc
    func addTag(_ tag: String) {
        guard ensureAirshipReady() else { return }

        if (!tag.isEmpty) {
            Airship.channel.editTags { editor in
                editor.add(tag)
            }
        }
    }
    
    @objc
    func removeTag(_ tag: String) {
        guard ensureAirshipReady() else { return }
        
        if (!tag.isEmpty) {
            Airship.channel.editTags { editor in
                editor.remove(tag)
            }
        }
    }
    
    @objc
    func getTags(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        resolve(Airship.channel.tags)
    }
    
    @objc
    func getSubscriptionLists(
        _ subscriptionTypes:[AnyHashable],
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }

        //let hashableArray = subscriptionTypes as? [AnyHashable]
        let typedSet = Set(subscriptionTypes)
        if (typedSet.count == 0) {
            let error = AirshipErrors.error("Failed to fetch subscription lists, no types.")
            reject(error.localizedDescription, error.localizedDescription, error)
        }
        
        let group = DispatchGroup()
        var result: [AnyHashable : Any] = [:]
        var resultError: Error?

        group.enter()

        if typedSet.contains("channel") {
            group.enter()

            Airship.channel.fetchSubscriptionLists() { lists, error in
                result["channel"] = lists!
                if resultError == nil {
                    resultError = error
                }
                objc_sync_exit(result)
                group.leave()
            }
        }
        
        if typedSet.contains("contact") {
            group.enter()
            
            Airship.contact.fetchSubscriptionLists { lists, error in

                objc_sync_enter(result)
                var converted: [AnyHashable : Any] = [:]
                for identifier in lists?.keys ?? Dictionary<String, ChannelScopes>().keys {
                    let scopes = lists?[identifier]
                    var scopesArray: [AnyHashable] = []
                    if let values = scopes?.values {
                        for scope in values {
                            scopesArray.append(scope.stringValue)
                        }
                    }
                    converted[identifier] = scopesArray
                }

                result["contact"] = converted

                if (resultError == nil) {
                    resultError = error
                }
                objc_sync_exit(result)
                group.leave()
            }
        }

        group.leave()
        
        group.notify(queue: DispatchQueue.main, execute: {
            if (resultError != nil) {
                reject(resultError?.localizedDescription, resultError?.localizedDescription, resultError);
            } else {
                resolve(result);
            }
        })
    }
    
    @objc
    func setAnalyticsEnabled(_ enabled:Bool) {
        guard ensureAirshipReady() else { return }
        if (enabled) {
            Airship.shared.privacyManager.enableFeatures(Features.analytics)
        } else {
            Airship.shared.privacyManager.disableFeatures(Features.analytics)
        }
    }
    
    @objc
    func trackScreen(_ screen:String) {
        guard ensureAirshipReady() else { return }
        Airship.analytics.trackScreen(screen)
    }
    
    @objc
    func getChannelId(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        resolve(Airship.channel.identifier)
    }
    
    @objc
    func getRegistrationToken(
        _ resolve: RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        resolve(Airship.push.deviceToken)
    }
    
    @objc
    func associateIdentifier(_ key:String, identifier:String) {
        guard ensureAirshipReady() else { return }
        
        let identifiers = Airship.analytics.currentAssociatedDeviceIdentifiers()
        identifiers.set(identifier: identifier, key: key)
        Airship.analytics.associateDeviceIdentifiers(identifiers)
    }

    @objc
    func runAction(
        _ name: String,
        actionValue value: Any,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) -> Void {

        guard ensureAirshipReady(reject) else { return }

        ActionRunner.run(
            name,
            value: value,
            situation: Situation.manualInvocation
        ) { actionResult in
            switch (actionResult.status) {
            case .completed:
                if let value = actionResult.value {
                    let resultString = try? JSONUtils.string(
                        value,
                        options: .fragmentsAllowed
                    )

                    resolve(resultString)
                } else {
                    resolve(nil)
                }
            case .actionNotFound:
                reject("STATUS_ACTION_NOT_FOUND", "Action \(name) not found.", nil)
            case .argumentsRejected:
                reject("STATUS_REJECTED_ARGUMENTS", "Action rejected arguments.", nil)
            case .error: fallthrough
            @unknown default:
                reject("STATUS_EXECUTION_ERROR", nil, actionResult.error)
            }
        }
    }
    
    @objc
    func editContactTagGroups(_ operations:[[String: Any]]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [TagGroupOperation].self,
                from: data
            )
            Airship.contact.editTagGroups { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply contact tag group operations \(operations): \(error)")
        }
    }
    
    @objc
    func editChannelTagGroups(_ operations:[Dictionary<String, Any>]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [TagGroupOperation].self,
                from: data
            )
            Airship.channel.editTagGroups { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply channel tag group operations \(operations): \(error)")
        }
    }
    
    @objc
    func editContactAttributes(_ operations:[[String: Any]]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [AttributeOperation].self,
                from: data
            )
            Airship.contact.editAttributes { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply contact attribue operations \(operations): \(error)")
        }
    }
    
    @objc
    func editChannelAttributes(_ operations:[[String: Any]]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [AttributeOperation].self,
                from: data
            )
            Airship.channel.editAttributes { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply channel attribue operations \(operations): \(error)")
        }
    }
    
    @objc
    func editContactSubscriptionLists(_ operations:[[String: Any]]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [SubscriptionListOperation].self,
                from: data
            )
            Airship.contact.editSubscriptionLists { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply contact subscription list operations \(operations): \(error)")
        }
    }
    
    @objc
    func editChannelSubscriptionLists(_ operations:[[String: Any]]) {
        guard ensureAirshipReady() else { return }

        do {
            let data = try JSONUtils.data(operations)
            let operations = try JSONDecoder().decode(
                [SubscriptionListOperation].self,
                from: data
            )
            Airship.channel.editSubscriptionLists { editor in
                operations.forEach { operation in
                    operation.apply(editor: editor)
                }
            }
        } catch {
            AirshipLogger.error("Failed to apply channel subscription list operations \(operations): \(error)")
        }
    }
    
    @objc
    func setNotificationOptions(
        _ options:[Any],
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady() else { return }

        do {
            let options = try UANotificationOptions.parse(options)
            Airship.push.notificationOptions = options
            resolve(true)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func setForegroundPresentationOptions(
        _ options:[Any],
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady() else { return }

        do {
            let options = try UNNotificationPresentationOptions.parse(options)
            Airship.push.defaultPresentationOptions = options
            PluginStore.shared.foregroundPresentationOptions = options
            resolve(true)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func getNotificationStatus(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        let push = Airship.push
        let isSystemEnabled = push.authorizedNotificationSettings != []

        do {
            let result: [String: Any] = [
                "airshipOptIn": NSNumber(value: push.isPushNotificationsOptedIn),
                "airshipEnabled": NSNumber(value: push.userPushNotificationsEnabled),
                "systemEnabled": NSNumber(value: isSystemEnabled),
                "ios": [
                    "authorizedSettings": push.authorizedNotificationSettings.names,
                    "authorizedStatus": try push.authorizationStatus.name
                ]
            ]
            resolve(result)
        } catch {
            rejectPromise(reject, error: error)
        }
    }
    
    @objc
    func setAutobadgeEnabled(_ enabled:Bool) {
        guard ensureAirshipReady() else { return }
        
        Airship.push.autobadgeEnabled = enabled
    }
    
    @objc
    func isAutobadgeEnabled(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        resolve(Airship.push.autobadgeEnabled)
    }
    
    @objc
    func setBadgeNumber(_ badgeNumber:Int) {
        guard ensureAirshipReady() else { return }
        
        Airship.push.badgeNumber = badgeNumber
    }
    
    @objc
    func getBadgeNumber(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        resolve(Airship.push.badgeNumber)
    }
    
    @objc
    func displayMessageCenter() {
        guard ensureAirshipReady() else { return }
        
        MessageCenter.shared.display()
    }
    
    @objc
    func dismissMessageCenter() {
        guard ensureAirshipReady() else { return }
        
        MessageCenter.shared.dismiss()
    }
    
    @objc
    func displayMessage(
        _ messageId:String,
        resolver resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        MessageCenter.shared.displayMessage(forID: messageId)
        resolve(true)
    }
    
    @objc
    func dismissMessage(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady() else { return }
        
        MessageCenter.shared.dismiss(true)
        resolve(true)
    }
    
    @objc
    func getInboxMessages(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        var messages: [[AnyHashable : Any]] = []
        
        for message in MessageCenter.shared.messageList.messages {
            let sentDate = NSNumber(value: message.messageSent.timeIntervalSince1970 * 1000)
         
            var messageInfo : [AnyHashable : Any] = [:]
            messageInfo["title"] = message.title
            messageInfo["id"] = message.messageID
            messageInfo["sentDate"] = sentDate
            messageInfo["isRead"] = message.unread ? false : true
            messageInfo["extras"] = message.extra
            messageInfo["isDeleted"] = message.deleted ? true : false
            
            if let icons = message.rawMessageObject["icons"] as? [String : Any] {
                messageInfo["listIconUrl"] = icons["listIcon"]
            }
            
            messages.append(messageInfo)
        }
        
        resolve(messages)
    }
    
    @objc
    func getUnreadMessageCount(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        resolve(
            MessageCenter.shared.messageList.unreadCount
        )
    }
    
    @objc
    func deleteInboxMessage(
        _ messageId:String,
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady() else { return }
        
        guard
            let message = MessageCenter.shared.messageList.message(
                forID: messageId
            )
        else {
            rejectPromise(
                reject,
                error: AirshipErrors.error("Message \(messageId) not found"),
                code: .messageCenterMessageNotFound
            )
            return
        }

        MessageCenter.shared.messageList.markMessagesDeleted([message]) {
            resolve(true)
        }
    }
    
    @objc
    func markInboxMessageRead(
        _ messageId:String,
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock)
    -> Void {
        guard ensureAirshipReady() else { return }

        guard
            let message = MessageCenter.shared.messageList.message(
                forID: messageId
            )
        else {
            rejectPromise(
                reject,
                error: AirshipErrors.error("Message \(messageId) not found"),
                code: .messageCenterMessageNotFound
            )
            return
        }

        MessageCenter.shared.messageList.markMessagesRead([message]) {
            resolve(true)
        }
    }
    
    @objc
    func refreshInbox(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady() else { return }
        
        MessageCenter.shared.messageList.retrieveMessageList {
            resolve(true)
        } withFailureBlock: {
            self.rejectPromise(
                reject,
                error: AirshipErrors.error("Faild to refresh inbox"),
                code: .messageCenterRefreshFailed
            )
        }
    }
    
    @objc
    func setAutoLaunchDefaultMessageCenter(_ enabled:Bool) {
        guard ensureAirshipReady() else { return }
        PluginStore.shared.autoDisplayMessageCenter = enabled
    }
    
    @objc
    func setCurrentLocale(_ localeIdentifier:String) {
        guard ensureAirshipReady() else { return }
        Airship.shared.localeManager.currentLocale = Locale(
            identifier: localeIdentifier
        )
    }
    
    @objc
    func getCurrentLocale(
        _ resolve:RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        guard ensureAirshipReady(reject) else { return }
        let airshipLocale = Airship.shared.localeManager.currentLocale
        resolve(airshipLocale.identifier)
    }
    
    @objc
    func clearLocale() {
        guard ensureAirshipReady() else { return }
        Airship.shared.localeManager.clearLocale()
    }
    
    @objc
    func clearNotifications() {
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }
    
    @objc
    func clearNotification(_ identifier: String) {
        UNUserNotificationCenter.current().removeDeliveredNotifications(
            withIdentifiers: [identifier]
        )
    }
    
    @objc
    func getActiveNotifications(
        _ resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject:RCTPromiseRejectBlock
    ) -> Void {
        UNUserNotificationCenter.current().getDeliveredNotifications { notifications in
            let result = notifications.map { notification in
                PushUtils.contentPayload(
                    notification.request.content.userInfo,
                    notificationID: notification.request.identifier
                )
            }
            resolve(result)
        }
    }

    @objc
    func displayPreferenceCenter(_ preferenceCenterId: String) {
        guard ensureAirshipReady() else { return }

        PreferenceCenter.shared.open(preferenceCenterId)
    }

    @objc
    func setUseCustomPreferenceCenterUi(
        _ useCustomUi: Bool,
        forPreferenceId preferenceId: String
    ) {
        PluginStore.shared.setAutoLaunchPreferenceCenter(
            preferenceId,
            autoLaunch: !useCustomUi
        )
    }

    @objc
    func getPreferenceCenterConfig(
        _ preferenceCenterId: String,
        resolver resolve:@escaping RCTPromiseResolveBlock,
        rejecter reject: RCTPromiseRejectBlock
    ) {
        guard ensureAirshipReady(reject) else { return }

        PreferenceCenter.shared.jsonConfig(preferenceCenterID: preferenceCenterId) { config in
            resolve(config)
        }
    }

    private func ensureAirshipReady() -> Bool {
        return Airship.isFlying
    }

    private func ensureAirshipReady(_ reject: RCTPromiseRejectBlock) -> Bool {
        guard Airship.isFlying else {
            rejectPromise(
                reject,
                error: AirshipErrors.error(
                    "Airship not ready, takeOff not called"
                ),
                code: .takeOffNotCalled
            )
            return false
        }
        return true
    }

    private func rejectPromise(
        _ reject: RCTPromiseRejectBlock,
        error: Error?,
        code: ErrorCode = .airshipError
    ) {
        reject(code.rawValue, error?.localizedDescription, error)
    }
}

struct AttributeOperation: Decodable {
    enum Action: String, Decodable {
        case setAttribute = "set"
        case removeAttribute = "remove"
    }

    enum ValueType: String, Decodable {
        case string
        case number
        case date
    }

    let action: Action
    let attribute: String
    let value: AirshipJSON?
    let valueType: ValueType?

    private enum CodingKeys: String, CodingKey {
        case action = "action"
        case attribute = "key"
        case value = "value"
        case valueType = "type"
    }

    func apply(editor: AttributesEditor) {
        guard attribute.isEmpty else {
            AirshipLogger.error("Invalid attribute operation: \(self)")
            return
        }

        switch(action) {
        case .removeAttribute:
            editor.remove(attribute)
        case .setAttribute:
            switch(valueType) {
            case .number:
                if let value = value?.unWrap() as? Double {
                    editor.set(double: value, attribute: attribute)
                } else {
                    AirshipLogger.error("Failed to parse double: \(self)")
                }
            case .string:
                if let value = value?.unWrap() as? String {
                    editor.set(string: value, attribute: attribute)
                } else {
                    AirshipLogger.error("Failed to parse string: \(self)")
                }
            case .date:
                if let value = value?.unWrap() as? Double {
                    editor.set(
                        date: Date(timeIntervalSince1970: value),
                        attribute: attribute
                    )
                } else {
                    AirshipLogger.error("Failed to parse date: \(self)")
                }
            case .none:
                AirshipLogger.error("Missing attribute value: \(self)")
            }
        }
    }
}

struct TagGroupOperation: Decodable {
    enum Action: String, Codable {
        case setTags = "set"
        case removeTags = "remove"
        case addTags = "add"
    }

    let action: Action
    let tags: [String]
    let group: String

    private enum CodingKeys: String, CodingKey {
        case group = "group"
        case action = "operationType"
        case tags = "tags"
    }

    func apply(editor: TagGroupsEditor) {
        guard group.isEmpty else {
            AirshipLogger.error("Invalid tag group operation: \(self)")
            return
        }

        switch(action) {
        case .removeTags:
            editor.remove(tags, group: group)
        case .setTags:
            editor.set(tags, group: group)
        case .addTags:
            editor.add(tags, group: group)
        }
    }
}

struct SubscriptionListOperation: Decodable {
    enum Action: String, Codable {
        case subscribe
        case unsubscribe
    }

    let action: Action
    let listID: String
    let scope: String?

    private enum CodingKeys: String, CodingKey {
        case action = "type"
        case listID = "listId"
        case scope = "scope"
    }

    func apply(editor: SubscriptionListEditor) {
        guard listID.isEmpty else {
            AirshipLogger.error("Invalid subscription list operation: \(self)")
            return
        }

        switch(action) {
        case .subscribe:
            editor.subscribe(listID)
        case .unsubscribe:
            editor.unsubscribe(listID)
        }
    }

    func apply(editor: ScopedSubscriptionListEditor) {
        guard listID.isEmpty,
              let scopeString = scope,
              let scope = try? ChannelScope.fromString(scopeString)
        else {
            AirshipLogger.error("Invalid subscription list operation: \(self)")
            return
        }

        switch(action) {
        case .subscribe:
            editor.subscribe(listID, scope: scope)
        case .unsubscribe:
            editor.unsubscribe(listID, scope: scope)
        }
    }
}

fileprivate extension RCTBridge {
    var appLaunchOptions: [UIApplication.LaunchOptionsKey: Any]? {
        return self.launchOptions as? [UIApplication.LaunchOptionsKey: Any]
    }
}

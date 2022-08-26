/* Copyright Urban Airship and Contributors */

import Foundation
import AirshipKit
import UserNotifications

@objc(UrbanAirshipReactModule)
class UrbanAirshipReactModule: NSObject, RCTBridgeModule {
    
    let UARCTErrorDomain = "com.urbanairship.react"
    let UARCTStatusUnavailable = "UNAVAILABLE"
    let UARCTStatusInvalidFeature = "INVALID_FEATURE"
    let UARCTErrorDescriptionInvalidFeature = "Invalid feature, cancelling the action."
    let UARCTStatusMessageNotFound = "STATUS_MESSAGE_NOT_FOUND"
    let UARCTStatusInboxRefreshFailed = "STATUS_INBOX_REFRESH_FAILED"
    let UARCTErrorDescriptionMessageNotFound = "Message not found for provided id."
    let UARCTErrorDescriptionInboxRefreshFailed = "Failed to refresh inbox."
    let UARCTErrorCodeMessageNotFound = 0
    let UARCTErrorCodeInboxRefreshFailed = 1
    let UARCTErrorCodeInvalidFeature = 2

    var airshipListener: UARCTAirshipListener?
    
    static func moduleName() -> String! {
        return "UrbanAirshipReactModule"
    }
    
    @objc var methodQueue: DispatchQueue? {
        return DispatchQueue.main
    }
    
    @objc var bridge: RCTBridge? {
        didSet {
            UARCTEventEmitter.shared().bridge = bridge
            attemptTakeOff()
        }
    }
//
// Module setup
//
  
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    
    func attemptTakeOff() {
        UARCTAutopilot.takeOff(launchOptions: self.bridge?.launchOptions) {
            self.airshipListener = UARCTAirshipListener.shared()
            Airship.shared.deepLinkDelegate = self.airshipListener
            Airship.push.registrationDelegate = self.airshipListener
            Airship.push.pushNotificationDelegate = self.airshipListener
            MessageCenter.shared.displayDelegate = self.airshipListener
            
            if (UARCTStorage.isForegroundPresentationOptionsSet) {
                Airship.push.defaultPresentationOptions = UARCTStorage.foregroundPresentationOptions
            }
        }
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
        UARCTEventEmitter.shared().onAirshipListenerAdded(forType: eventName)
    }
    
    @objc
    func takeOff(_ config:[AnyHashable : Any], resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        UARCTStorage.airshipConfig = config
        self.attemptTakeOff()
        resolve(Airship.isFlying)
    }
    
    @objc
    func isFlying(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        resolve(Airship.isFlying)
    }
    
    @objc
    func takePendingEvents(_ type: String, resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        resolve(UARCTEventEmitter.shared().takePendingEvents(withType: type))
    }

    @objc
    func setUserNotificationsEnabled(_ enabled: Bool) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.push.userPushNotificationsEnabled = enabled
    }
    
    @objc
    func enableChannelCreation() -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        Airship.channel.enableChannelCreation()
    }
    
    @objc
    func setEnabledFeatures(_ features:[Any], resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (UARCTUtils.isValidFeatureArray(features)) {
            Airship.shared.privacyManager.enabledFeatures = UARCTUtils.stringArray(toFeatures: features)
            resolve(true)
        } else {
            let code = UARCTStatusInvalidFeature
            let errorMessage = UARCTErrorDescriptionInvalidFeature
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeInvalidFeature, userInfo: [NSLocalizedDescriptionKey : errorMessage])
            reject(code, errorMessage, error);
        }
    }
    
    @objc
    func getEnabledFeatures(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(UARCTUtils.feature(toStringArray: Airship.shared.privacyManager.enabledFeatures))
    }
    
    @objc
    func enableFeature(_ features:[Any], resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (UARCTUtils.isValidFeatureArray(features)) {
            Airship.shared.privacyManager.enableFeatures(UARCTUtils.stringArray(toFeatures: features))
            resolve(true)
        } else {
            let code = UARCTStatusInvalidFeature
            let errorMessage = UARCTErrorDescriptionInvalidFeature
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeInvalidFeature, userInfo: [NSLocalizedDescriptionKey : errorMessage])
            reject(code, errorMessage, error);
        }
    }
    
    @objc
    func disableFeature(_ features:[Any], resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (UARCTUtils.isValidFeatureArray(features)) {
            Airship.shared.privacyManager.disableFeatures(UARCTUtils.stringArray(toFeatures: features))
            resolve(true)
        } else {
            let code = UARCTStatusInvalidFeature
            let errorMessage = UARCTErrorDescriptionInvalidFeature
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeInvalidFeature, userInfo: [NSLocalizedDescriptionKey : errorMessage])
            reject(code, errorMessage, error);
        }
    }
    
    @objc
    func isFeatureEnabled(_ features:[Any], resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (UARCTUtils.isValidFeatureArray(features)) {
            resolve(Airship.shared.privacyManager.isEnabled(UARCTUtils.stringArray(toFeatures: features)))
        } else {
            let code = UARCTStatusInvalidFeature
            let errorMessage = UARCTErrorDescriptionInvalidFeature
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeInvalidFeature, userInfo: [NSLocalizedDescriptionKey : errorMessage])
            reject(code, errorMessage, error);
        }
    }
    
    @objc
    func isUserNotificationsEnabled(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(Airship.push.userPushNotificationsEnabled)
    }
    
    @objc
    func isUserNotificationsOptedIn(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        var optedIn = true
        
        if (Airship.push.deviceToken == nil) {
            AirshipLogger.trace("Opted out: missing device token")
            optedIn = false
        }

        if (!Airship.push.userPushNotificationsEnabled) {
            AirshipLogger.trace("Opted out: user push notifications disabled")
            optedIn = false
        }

        if (Airship.push.authorizedNotificationSettings == [] ) {
            AirshipLogger.trace("Opted out: no authorized notification settings")
            optedIn = false
        }

        if (!Airship.shared.privacyManager.isEnabled(Features.push)) {
            AirshipLogger.trace("Opted out: push is disabled")
            optedIn = false
        }
        resolve(optedIn)
    }
    
    @objc
    func isSystemNotificationsEnabledForApp(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        let optedIn = Airship.push.authorizedNotificationSettings.rawValue != 0
        resolve(optedIn)
    }
    
    @objc
    func enableUserPushNotifications(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.push.enableUserPushNotifications({ success in
            resolve(NSNumber(value: success))
        })
    }
    
    @objc
    func setNamedUser(_ namedUser: String) {
        guard ensureAirshipReady()
        else {
            return
        }
        let namedUser = namedUser.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
        if (namedUser.count > 0) {
            Airship.contact.identify(namedUser)
        } else {
            Airship.contact.reset()
        }
    }
    
    @objc
    func getNamedUser(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(Airship.contact.namedUserID)
    }
    
    @objc
    func addTag(_ tag: String) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (!tag.isEmpty) {
            Airship.channel.editTags { editor in
                editor.add(tag)
            }
        }
    }
    
    @objc
    func removeTag(_ tag: String) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        if (!tag.isEmpty) {
            Airship.channel.editTags { editor in
                editor.remove(tag)
            }
        }
    }
    
    @objc
    func getTags(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(Airship.channel.tags)
    }
    
    @objc
    func getSubscriptionLists(_ subscriptionTypes:[AnyHashable], resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
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
                            scopesArray.append(self.getScopeString(scope: scope))
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
            if (resultError == nil) {
                reject(resultError?.localizedDescription, resultError?.localizedDescription, resultError);
            } else {
                resolve(result);
            }
        })
    }
    
    @objc
    func setAnalyticsEnabled(_ enabled:Bool) {
        guard ensureAirshipReady()
        else {
            return
        }
        if (enabled) {
            Airship.shared.privacyManager.enableFeatures(Features.analytics)
        } else {
            Airship.shared.privacyManager.disableFeatures(Features.analytics)
        }
    }
    
    @objc
    func isAnalyticsEnabled(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        resolve(Airship.shared.privacyManager.isEnabled(Features.analytics))
    }
    
    @objc
    func trackScreen(_ screen:String) {
        guard ensureAirshipReady()
        else {
            return
        }
        Airship.analytics.trackScreen(screen)
    }
    
    @objc
    func getChannelId(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        resolve(Airship.channel.identifier)
    }
    
    @objc
    func getRegistrationToken(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        resolve(Airship.push.deviceToken)
    }
    
    @objc
    func associateIdentifier(key:String, identifier:String) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        var identifiers = Airship.analytics.currentAssociatedDeviceIdentifiers()
        identifiers.set(identifier: identifier, key: key)
        Airship.analytics.associateDeviceIdentifiers(identifiers)
    }

    @objc
    func runAction(_ name:String, actionValue value:Any, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        ActionRunner.run(name, value: value, situation: Situation.manualInvocation) { actionResult in
            
            var resultString: String?
            var code: String?
            var errorMessage: String?
            var error: NSError?
            
            switch (actionResult.status) {
                case ActionStatus.completed:
                    if (actionResult.value != nil) {
                        do {
                            //if the action completed with a result value, serialize into JSON
                            //accepting fragments so we can write lower level JSON values
                            try resultString = JSONUtils.string(actionResult.value!, options: JSONSerialization.WritingOptions.fragmentsAllowed)
                        } catch let thrownError as NSError {
                            do {
                                // If there was an error serializing, fall back to a string description.
                                error = thrownError
                                AirshipLogger.debug("Unable to serialize result value \(String(describing: actionResult.value)), falling back to string description")
                                try resultString = JSONUtils.string(actionResult.value.debugDescription, options: JSONSerialization.WritingOptions.fragmentsAllowed)
                            } catch let thrownError as NSError {
                                error = thrownError
                                errorMessage = "Still unable to serialize result value \(String(describing: actionResult.value)), rejecting."
                                code = "STATUS_EXECUTION_ERROR"
                            }
                        }
                    }
                    //in the case where there is no result value, pass null
                resultString = resultString ?? "null"
                case ActionStatus.actionNotFound:
                    errorMessage = "No action found with name \(name), skipping action"
                    code = "STATUS_ACTION_NOT_FOUND"
                case ActionStatus.error:
                    errorMessage = actionResult.error?.localizedDescription
                    code = "STATUS_EXECUTION_ERROR"
                case ActionStatus.argumentsRejected:
                    errorMessage = "Action \(name) rejected arguments."
                    code = "STATUS_REJECTED_ARGUMENTS"
            }
            
            if (actionResult.status == ActionStatus.completed) {
                var result: [AnyHashable : Any] = [:]
                result["value"] = actionResult.value
                resolve(actionResult)
            }
            
            if (errorMessage != nil) {
                reject(code, errorMessage, nil);
            }
        }
    }
    
    @objc
    func editContactTagGroups(_ operations:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.contact.editTagGroups { editor in
            self.applyTagGroupOperations(operations: operations, editor: editor)
        }
    }
    
    @objc
    func editChannelTagGroups(_ operations:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.channel.editTagGroups() { editor in
            self.applyTagGroupOperations(operations: operations, editor: editor)
        }
    }
    
    @objc
    func editContactAttributes(_ operations:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.contact.editAttributes() { editor in
            self.applyAttributeOperations(operations: operations, editor: editor)
        }
    }
    
    @objc
    func editChannelAttributes(_ operations:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.channel.editAttributes() { editor in
            self.applyAttributeOperations(operations: operations, editor: editor)
        }
    }
    
    @objc
    func editContactSubscriptionLists(_ subscriptionListUpdates:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.contact.editSubscriptionLists() { editor in
            for subscriptionListUpdate in subscriptionListUpdates {
                let listId = subscriptionListUpdate["listId"] as? String
                let type = subscriptionListUpdate["type"] as? String
                let scopeString = subscriptionListUpdate["scope"] as? String
                var scope: ChannelScope?
                
                if (scopeString == "sms") {
                    scope = ChannelScope.sms
                } else if (scopeString == "email") {
                    scope = ChannelScope.email
                } else if (scopeString == "app") {
                    scope = ChannelScope.app
                } else if (scopeString == "web") {
                    scope = ChannelScope.web
                } else {
                    return
                }
                
                if (listId != nil && type != nil && scope != nil) {
                    if (type == "subscribe") {
                        editor.subscribe(listId!, scope: scope!)
                    } else if (type == "unsubscribe") {
                        editor.unsubscribe(listId!, scope: scope!)
                    }
                }
            }
            editor.apply()
        }
    }
    
    @objc
    func editChannelSubscriptionLists(_ subscriptionListUpdates:[Dictionary<String, Any>]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.channel.editSubscriptionLists() { editor in
            for subscriptionListUpdate in subscriptionListUpdates {
                let listId = subscriptionListUpdate["listId"] as? String
                let type = subscriptionListUpdate["type"] as? String
                if (listId != nil && type != nil) {
                    if (type == "subscribe") {
                        editor.subscribe(listId!)
                    } else if (type == "unsubscribe") {
                        editor.unsubscribe(listId!)
                    }
                }
            }
            editor.apply()
        }
    }
    
    @objc
    func setNotificationOptions(_ options:[Any]) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        let notificationOptions = UARCTUtils.options(fromOptionsArray: options)
        AirshipLogger.debug("Notification options set: \(notificationOptions) from dictionary: \(options)")
        Airship.push.notificationOptions = notificationOptions
        Airship.push.updateRegistration()
    }
    
    @objc
    func setForegroundPresentationOptions(_ options:[Any]) {
        guard let options = options as? [String],
              ensureAirshipReady()
        else {
            return
        }
        
        var presentationOptions: UNNotificationPresentationOptions = []
        
        if (options.contains("alert")) {
            AirshipLogger.warn("Alert will be deprecated in iOS 14")
        }
        
        if (options.contains("badge")) {
            presentationOptions = [presentationOptions, UNNotificationPresentationOptions.badge]
        }
        
        if (options.contains("sound")) {
            presentationOptions = [presentationOptions, UNNotificationPresentationOptions.sound]
        }
        AirshipLogger.debug("Foreground presentation options set: \(presentationOptions.rawValue) from dictionary: \(options)")
        
        Airship.push.defaultPresentationOptions = presentationOptions
        UARCTStorage.foregroundPresentationOptions = presentationOptions
    }
    
    @objc
    func getNotificationStatus(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        let push = Airship.push
        let isSystemEnabled = push.authorizedNotificationSettings != []
        let result = [
            "airshipOptIn": NSNumber(value: push.isPushNotificationsOptedIn),
            "airshipEnabled": NSNumber(value: push.userPushNotificationsEnabled),
            "systemEnabled": NSNumber(value: isSystemEnabled),
            "ios": [
            "authorizedSettings": UARCTUtils.authorizedSettingsArray(push.authorizedNotificationSettings),
            "authorizedStatus": UARCTUtils.authorizedStatusString(push.authorizationStatus)
            ]
        ] as [String : Any]
        
        resolve(result)
    }
    
    @objc
    func setAutobadgeEnabled(_ enabled:Bool) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.push.autobadgeEnabled = enabled
    }
    
    @objc
    func isAutobadgeEnabled(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(Airship.push.autobadgeEnabled)
    }
    
    @objc
    func setBadgeNumber(_ badgeNumber:Int) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.push.badgeNumber = badgeNumber
    }
    
    @objc
    func getBadgeNumber(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(Airship.push.badgeNumber)
    }
    
    @objc
    func displayMessageCenter() {
        guard ensureAirshipReady()
        else {
            return
        }
        
        MessageCenter.shared.display()
    }
    
    @objc
    func dismissMessageCenter() {
        guard ensureAirshipReady()
        else {
            return
        }
        
        MessageCenter.shared.dismiss()
    }
    
    @objc
    func displayMessage(_ messageId:String, resolver resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        MessageCenter.shared.displayMessage(forID: messageId)
        resolve(true)
    }
    
    @objc
    func dismissMessage(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        MessageCenter.shared.dismiss(true)
        resolve(true)
    }
    
    @objc
    func getInboxMessages(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
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
    func getUnreadMessageCount(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        resolve(MessageCenter.shared.messageList.unreadCount)
    }
    
    @objc
    func deleteInboxMessage(_ messageId:String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        let message = MessageCenter.shared.messageList.message(forID: messageId)
        
        if (message == nil) {
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeMessageNotFound, userInfo: [NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound])
            reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error)
        } else {
            MessageCenter.shared.messageList.markMessagesDeleted([message!]) {
                resolve(true)
            }
        }
    }
    
    @objc
    func markInboxMessageRead(_ messageId:String, resolver resolve:@escaping RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        let message = MessageCenter.shared.messageList.message(forID: messageId)
        
        if (message == nil) {
            let error = NSError(domain: UARCTErrorDomain, code: UARCTErrorCodeMessageNotFound, userInfo: [NSLocalizedDescriptionKey:UARCTErrorDescriptionMessageNotFound])
            reject(UARCTStatusMessageNotFound, UARCTErrorDescriptionMessageNotFound, error)
        } else {
            MessageCenter.shared.messageList.markMessagesRead([message!]) {
                resolve(true)
            }
        }
    }
    
    @objc
    func refreshInbox(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:@escaping RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        
        MessageCenter.shared.messageList.retrieveMessageList {
            resolve(true)
        } withFailureBlock: {
            let error = NSError(domain: self.UARCTErrorDomain, code: self.UARCTErrorCodeInboxRefreshFailed, userInfo: [NSLocalizedDescriptionKey:self.UARCTErrorDescriptionInboxRefreshFailed])
            reject(self.UARCTStatusInboxRefreshFailed, self.UARCTErrorDescriptionInboxRefreshFailed, error)
        }
    }
    
    @objc
    func setAutoLaunchDefaultMessageCenter(_ enabled:Bool) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        UARCTStorage.autoLaunchMessageCenter = enabled
    }
    
    @objc
    func setCurrentLocale(_ localeIdentifier:String) {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.shared.localeManager.currentLocale = Locale(identifier: localeIdentifier)
    }
    
    @objc
    func getCurrentLocale(_ resolve:RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        guard ensureAirshipReady()
        else {
            return
        }
        let airshipLocale = Airship.shared.localeManager.currentLocale
        resolve(airshipLocale.identifier)
    }
    
    @objc
    func clearLocale() {
        guard ensureAirshipReady()
        else {
            return
        }
        
        Airship.shared.localeManager.clearLocale()
    }
    
    @objc
    func clearNotifications() {
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }
    
    @objc
    func clearNotification(_ identifier:String) {
        UNUserNotificationCenter.current().removeDeliveredNotifications(withIdentifiers: [identifier])
    }
    
    @objc
    func getActiveNotifications(_ resolve:@escaping RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) -> Void {
        UNUserNotificationCenter.current().getDeliveredNotifications { notifications in
            var result: [[AnyHashable : Any]] = []
            for notification in notifications {
                
                result.append(UARCTUtils.eventBody(forNotificationContent: notification.request.content.userInfo, notificationIdentifier: notification.request.identifier))
            }
            
            resolve(result)
        }
    }
    
    
///
/// Helper methods
///
    
    
    func ensureAirshipReady() -> Bool {
        return self.ensureAirshipReady(nil)
    }

    @objc
    func ensureAirshipReady(_ reject:RCTPromiseRejectBlock?) -> Bool {
        if Airship.isFlying {
            return true
        }
        
        if reject != nil {
            reject!("TAKE_OFF_NOT_CALLED", "Airship not ready, takeOff not called", nil)
        }
        
        return false
    }
    
    @objc
    func getScopeString(scope:ChannelScope) -> String {
        switch (scope) {
            case ChannelScope.sms:
                return "sms"
            case ChannelScope.email:
                return "email"
            case ChannelScope.app:
                return "app"
            case ChannelScope.web:
                return "web"
        }
    }
    
    @objc
    func applyTagGroupOperations(operations:[Dictionary<String, Any>], editor:TagGroupsEditor) -> Void {
        for operation in operations {
            let tags = operation["tags"] as? [String] ?? []
            let group =  operation["group"] as? String ?? ""
            let operationType =  operation["operationType"] as? String
                
            if (operationType == "add") {
                editor.add(tags, group: group)
            } else if (operationType == "remove") {
                editor.remove(tags, group: group)
            } else if (operationType == "set") {
                editor.set(tags, group: group)
            }
        }
    }
    
    @objc
    func applyAttributeOperations(operations:[Dictionary<String, Any>], editor:AttributesEditor) -> Void {
        for operation in operations {
            let action = operation["action"] as? String ?? ""
            let name = operation["key"] as? String ?? ""
            let value = operation["value"]
            
            if (action == "set") {
                let valueType = operation["type"] as? String
                if (valueType == "string") {
                    guard let value = value as? String
                    else {
                        return
                    }
                    editor.set(string: value, attribute: name)
                } else if (valueType == "number") {
                    guard let value = value as? NSNumber
                    else {
                        return
                    }
                    editor.set(number: value, attribute: name)
                } else if (valueType == "date") {
                    guard let value = value as? Double
                    else {
                        return
                    }
                    editor.set(date: Date(timeIntervalSince1970: TimeInterval(value)), attribute: name)
                } else {
                    AirshipLogger.warn("Unknown channel attribute type: \(valueType)")
                }
            } else if (action == "remove") {
                editor.remove(name)
            }
        }
    }
}


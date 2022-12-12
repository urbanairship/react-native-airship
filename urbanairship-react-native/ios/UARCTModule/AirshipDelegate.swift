import Foundation

class AirshipDelegate: NSObject,
                       PushNotificationDelegate,
                       MessageCenterDisplayDelegate,
                       PreferenceCenterOpenDelegate,
                       RegistrationDelegate,
                       DeepLinkDelegate
{

    func displayMessageCenter(
        forMessageID messageID: String,
        animated: Bool
    ) {
        guard !PluginStore.shared.autoDisplayMessageCenter else {
            MessageCenter.shared.defaultUI.displayMessageCenter(
                forMessageID: messageID,
                animated: animated
            )
            return
        }

        Task {
            await PendingEvents.shared.addEvent(
                DisplayMessageCenterEvent(messageID: messageID)
            )
        }
    }

    func displayMessageCenter(animated: Bool) {
        guard !PluginStore.shared.autoDisplayMessageCenter else {
            MessageCenter.shared.defaultUI.displayMessageCenter(
                animated: animated
            )
            return
        }

        Task {
            await PendingEvents.shared.addEvent(
                DisplayMessageCenterEvent()
            )
        }
    }

    func dismissMessageCenter(animated: Bool) {
        MessageCenter.shared.defaultUI.dismissMessageCenter(
            animated: animated
        )
    }

    func openPreferenceCenter(_ preferenceCenterID: String) -> Bool {
        return true
    }

    func receivedDeepLink(
        _ deepLink: URL,
        completionHandler: @escaping () -> Void
    ) {
        Task {
            await PendingEvents.shared.addEvent(
                DeepLinkEvent(deepLink)
            )
        }
    }

    func messageCenterInboxUpdated() {
        Task {
            let messageList = MessageCenter.shared.messageList
            await PendingEvents.shared.addEvent(
                MessageCenterUpdatedEvent(
                    messageCount: messageList.messageCount(),
                    unreadCount: messageList.unreadCount
                )
            )
        }

    }

    func channelCreated() {
        guard let channelID = Airship.channel.identifier else {
            return
        }

        Task {
            await PendingEvents.shared.addEvent(
                ChannelCreatedEvent(channelID)
            )
        }
    }

    func receivedNotificationResponse(
        _ notificationResponse: UNNotificationResponse,
        completionHandler: @escaping () -> Void
    ) {
        Task {
            await PendingEvents.shared.addEvent(
                NotificationResponseEvent(
                    response: notificationResponse
                )
            )
            completionHandler()
        }
    }

    func receivedBackgroundNotification(
        _ userInfo: [AnyHashable : Any],
        completionHandler: @escaping (UIBackgroundFetchResult
    ) -> Void) {
        Task {
            await PendingEvents.shared.addEvent(
                PushReceivedEvent(
                    userInfo: userInfo
                )
            )
            completionHandler(.noData)
        }
    }

    func receivedForegroundNotification(
        _ userInfo: [AnyHashable : Any],
        completionHandler: @escaping () -> Void
    ) {
        Task {
            await PendingEvents.shared.addEvent(
                PushReceivedEvent(
                    userInfo: userInfo
                )
            )
            completionHandler()
        }
    }

    func apnsRegistrationSucceeded(withDeviceToken deviceToken: Data) {
        let token = Utils.deviceTokenStringFromDeviceToken(deviceToken)
        Task {
            await PendingEvents.shared.addEvent(
                PushTokenReceived(
                    pushToken: token
                )
            )
        }
    }
}

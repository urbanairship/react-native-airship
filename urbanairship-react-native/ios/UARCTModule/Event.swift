import Foundation

protocol Event {
    var name: String { get }
    var body: [String: Any] { get }
}

struct DeepLinkEvent: Event {
    let name = "com.airship.deep_link"
    let body: [String: Any]

    init(_ deepLink: URL) {
        self.body = ["deepLink": deepLink.absoluteString]
    }
}

struct ChannelCreatedEvent: Event {
    let name = "com.airship.channel_created"
    let body: [String: Any]

    init(_ channelID: String) {
        self.body = ["channelId": channelID]
    }
}

struct PushTokenReceivedEvent: Event {
    let name = "com.airship.push_token_received"
    let body: [String: Any]

    init(_ channelID: String) {
        self.body = ["channelId": channelID]
    }
}

struct MessageCenterUpdatedEvent: Event {
    let name = "com.airship.message_center_updated"
    let body: [String: Any]

    init(messageCount: UInt, unreadCount: Int) {
        self.body = [
            "messageCount": messageCount,
            "unreadCount": unreadCount
        ]
    }
}

struct DisplayMessageCenterEvent: Event {
    let name = "com.airship.display_message_center"
    let body: [String: Any]

    init(messageID: String? = nil) {
        if let messageID = messageID {
            self.body = [
                "messageID": messageID
            ]
        } else {
            self.body = [:]
        }

    }
}

struct NotificationResponseEvent: Event {
    let name: String = "com.airship.notification_response"
    var body: [String : Any]

    init(response: UNNotificationResponse) {
        self.body = PushUtils.responsePayload(response)
    }
}

struct PushReceivedEvent: Event {
    let name: String = "com.airship.push_received"
    var body: [String : Any]

    init(userInfo: [AnyHashable : Any]) {
        self.body = PushUtils.contentPayload(userInfo)
    }
}

struct PushTokenReceived: Event {
    let name: String = "com.airship.push_token_received"
    var body: [String : Any]

    init(pushToken: String) {
        self.body = ["pushToken": pushToken]
    }
}


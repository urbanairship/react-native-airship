import Foundation
import AirshipKit

extension UAAuthorizationStatus {
    var name: String {
        get throws {
            switch (self) {
            case .authorized:
                return "authorized"
            case .denied:
                return "denied"
            case .provisional:
                return "provisional"
            case .ephemeral:
                return "ephemeral"
            case .notDetermined:
                return "not_determined"
            @unknown default:
                throw AirshipErrors.error(
                    "Unknown authorizationStatus \(self)"
                )
            }
        }
    }
}

extension UAAuthorizedNotificationSettings {
    private static let nameMap: [String: UAAuthorizedNotificationSettings] = [
        "alert": UAAuthorizedNotificationSettings.alert,
        "badge": UAAuthorizedNotificationSettings.badge,
        "sound": UAAuthorizedNotificationSettings.sound,
        "announcement": UAAuthorizedNotificationSettings.announcement,
        "car_play": UAAuthorizedNotificationSettings.carPlay,
        "critical_alert": UAAuthorizedNotificationSettings.criticalAlert,
        "notification_center": UAAuthorizedNotificationSettings.notificationCenter,
        "scheduled_delivery": UAAuthorizedNotificationSettings.scheduledDelivery,
        "time_sensitive": UAAuthorizedNotificationSettings.timeSensitive,
        "lock_screen": UAAuthorizedNotificationSettings.lockScreen
    ]

    var names: [String] {
        var names: [String] = []
        UAAuthorizedNotificationSettings.nameMap.forEach { key, value in
            if (self.contains(value)) {
                names.append(key)
            }
        }

        return names
    }
}

extension Features: Codable {
    static let nameMap: [String: Features] = [
        "push": .push,
        "chat": .chat,
        "contacts": .contacts,
        "location": .location,
        "message_center": .messageCenter,
        "analytics": .analytics,
        "tags_and_attributes": .tagsAndAttributes,
        "in_app_automation": .inAppAutomation,
        "all": .all,
        "none": []
    ]

    static let legacyNameMap: [String: Features] = [
        "FEATURE_PUSH": .push,
        "FEATURE_CHAT": .chat,
        "FEATURE_CONTACTS": .contacts,
        "FEATURE_LOCATION": .location,
        "FEATURE_MESSAGE_CENTER": .messageCenter,
        "FEATURE_ANALYTICS": .analytics,
        "FEATURE_TAGS_AND_ATTRIBUTES": .tagsAndAttributes,
        "FEATURE_IN_APP_AUTOMATION": .inAppAutomation,
        "FEATURE_ALL": .all,
        "FEATURE_NONE": []
    ]

    var names: [String] {
        var names: [String] = []
        Features.nameMap.forEach { key, value in
            if (value != [] || value != .all) {
                if (self.contains(value)) {
                    names.append(key)
                }
            }
        }

        return names
    }

    static func parse(_ names: [Any]) throws -> Features {
        guard let names = names as? [String] else {
            throw AirshipErrors.error("Invalid feature \(names)")
        }

        var features: Features = []

        try names.forEach { name in
            guard
                let feature = (Features.nameMap[name.lowercased()] ?? Features.legacyNameMap[name])
            else {
                throw AirshipErrors.error("Invalid feature \(name)")
            }
            features.update(with: feature)
        }

        return features
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if let names: [String] = try? container.decode([String].self) {
            self = try Features.parse(names)
        }

        self = Features(
            rawValue: try container.decode(UInt.self)
        )
    }
}

extension UANotificationOptions {

    static let nameMap: [String: UANotificationOptions] = [
        "alert": .alert,
        "badge": .badge,
        "sound": .sound,
        "car_play": .carPlay,
        "critical_alert": .criticalAlert,
        "provides_app_notification_settings": .providesAppNotificationSettings,
        "provisional": .provisional
    ]

    static func parse(_ names: [Any]) throws -> UANotificationOptions {
        guard let names = names as? [String] else {
            throw AirshipErrors.error("Invalid options \(names)")
        }

        var options: UANotificationOptions = []

        try names.forEach { name in
            guard let option = UANotificationOptions.nameMap[name.lowercased()] else {
                throw AirshipErrors.error("Invalid option \(name)")
            }
            options.update(with: option)
        }

        return options
    }

    var names: [String] {
        var names: [String] = []
        UANotificationOptions.nameMap.forEach { key, value in
            if (self.contains(value)) {
                names.append(key)
            }
        }
        return names
    }
}

extension UNNotificationPresentationOptions {
    static let nameMap: [String: UNNotificationPresentationOptions] = {
        var map: [String: UNNotificationPresentationOptions] = [
            "badge": .badge,
            "sound": .sound,
        ]

        if #available(iOS 14.0, *) {
            map["list"] = .list
            map["banner"] = .banner
            map["alert"] = [.banner, .list]
        } else {
            map["list"] = .alert
            map["banner"] = .alert
            map["alert"] = .alert
        }

        return map
    }()

    static func parse(_ names: [Any]) throws -> UNNotificationPresentationOptions {
        guard let names = names as? [String] else {
            throw AirshipErrors.error("Invalid options \(names)")
        }

        var options: UNNotificationPresentationOptions = []

        try names.forEach { name in
            guard let option = UNNotificationPresentationOptions.nameMap[name.lowercased()] else {
                throw AirshipErrors.error("Invalid option \(name)")
            }
            options.update(with: option)
        }

        return options
    }

    var names: [String] {
        var names: [String] = []
        UNNotificationPresentationOptions.nameMap.forEach { key, value in
            if (self.contains(value)) {
                names.append(key)
            }
        }
        return names
    }
}

/* Copyright Airship and Contributors */

import Foundation
import AirshipFrameworkProxy
import UserNotifications
import AirshipKit

struct ProxyDataMigrator {

    private let featureNameMap: [String: String] = [
        "FEATURE_PUSH": "push",
        "FEATURE_CHAT": "chat",
        "FEATURE_CONTACTS": "contacts",
        "FEATURE_LOCATION": "location",
        "FEATURE_MESSAGE_CENTER": "message_center",
        "FEATURE_ANALYTICS": "analytics",
        "FEATURE_TAGS_AND_ATTRIBUTES": "tags_and_attributes",
        "FEATURE_IN_APP_AUTOMATION": "in_app_automation",
        "FEATURE_ALL": "all",
        "FEATURE_NONE": "none"
    ]


    private let defaults = UserDefaults.standard
    private let presentationOptionsStorageKey = "com.urbanairship.presentation_options"
    private let autoLaunchMessageCenterKey = "com.urbanairship.auto_launch_message_center"
    private let configKey = "com.urbanairship.react.airship_config"


    @MainActor
    func migrateData(store: ProxyStore) {
        // Presentation options
        let optionsInt = defaults.object(
            forKey: presentationOptionsStorageKey
        )
        if let optionsInt = optionsInt as? Int {
            let options = UNNotificationPresentationOptions(
                rawValue: UInt(optionsInt)
            )
            store.foregroundPresentationOptions = options
            defaults.removeObject(
                forKey: presentationOptionsStorageKey
            )
        }

        // Auto launch message center
        let autoLaunchMessageCenter = defaults.object(
            forKey: autoLaunchMessageCenterKey
        )

        if let autoLaunchMessageCenter = autoLaunchMessageCenter as? Bool {
            store.autoDisplayMessageCenter = autoLaunchMessageCenter
            defaults.removeObject(
                forKey: autoLaunchMessageCenterKey
            )
        }

        // Preference center
        defaults.dictionaryRepresentation().keys.forEach { key in
            if key.hasPrefix("com.urbanairship.react.preference_"),
               key.hasSuffix("_autolaunch")
            {
                var preferenceCenterID = String(
                    key.dropFirst("com.urbanairship.react.preference_".count)
                )

                preferenceCenterID = String(
                    preferenceCenterID.dropLast("_autolaunch".count)
                )

                store.setAutoLaunchPreferenceCenter(
                    preferenceCenterID,
                    autoLaunch: defaults.bool(forKey: key)
                )

                defaults.removeObject(
                    forKey: key
                )
            }
        }

        // Config
        let config = defaults.object(forKey: configKey)
        if var config = config as? [String: Any] {

            // Proxy config is based off react-natives original config,
            // the only difference is the feature names.
            if let features = config["enabledFeatures"] as? [String] {
                config["enabledFeatures"] = features.compactMap { name in
                    featureNameMap[name]
                }
            }

            do {
                let data = try JSONSerialization.data(
                    withJSONObject: config
                )
                let config = try JSONDecoder().decode(
                    ProxyConfig.self,
                    from: data
                )
                store.config = config

                defaults.removeObject(
                    forKey: configKey
                )
            } catch {
                AirshipLogger.error("Failed to migrate config: \(error)")
            }
        }
    }

}

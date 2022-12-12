//
//  PluginStore.swift
//  urbanairship-react-native
//
//  Created by Ryan Lepinski on 10/14/22.
//

import Foundation

class PluginStore {
    private static let defaults = UserDefaults(
        suiteName: "react-native-airship"
    )!

    // TODO migrate data from old user defaults
    /*
     static NSString *const UARCTPresentationOptionsStorageKey = @"com.urbanairship.presentation_options";
     static NSString *const UARCTAutoLaunchMessageCenterKey = @"com.urbanairship.auto_launch_message_center";
     static NSString *const UARCTAirshipChatModuleCustomUIKey = @"com.urbanairship.react.chat.custom_ui";
     static NSString *const UARCTPreferenceCenterKeyFormat = @"com.urbanairship.react.preference_%@_autolaunch";
     static NSString *const UARCTAirshipConfigKey = @"com.urbanairship.react.airship_config";
     */
    init() {

    }

    static let shared = PluginStore()
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()


    private let configKey = "config"
    private let foregroundPresentationOptionsKey = "foregroundPresentationOptions"
    private let autoDisplayMessageCenterKey = "autoDisplayMessageCenter"

    var config: PluginConfig? {
        get {
            return readCodable(configKey)
        }
        set {
            writeCodable(newValue, forKey: configKey)
        }
    }

    var foregroundPresentationOptions: UNNotificationPresentationOptions {
        get {
            let value: UInt? = readValue(
                foregroundPresentationOptionsKey
            )

            guard let value = value else {
                return []
            }

            return UNNotificationPresentationOptions(rawValue: value)
        }

        set {
            writeValue(
                newValue.rawValue,
                forKey: foregroundPresentationOptionsKey
            )
        }
    }

    var autoDisplayMessageCenter: Bool {
        get {
            return readValue(autoDisplayMessageCenterKey) ?? true
        }

        set {
            writeValue(
                newValue,
                forKey: autoDisplayMessageCenterKey
            )
        }
    }

    private func preferenceCenterKey(
        _ preferenceCenterID: String
    ) -> String {
        return "com.urbanairship.react.preference_\(preferenceCenterID)_autolaunch"
    }


    func setAutoLaunchPreferenceCenter(
        _ preferenceCenterID: String,
        autoLaunch: Bool
    ) {
        writeValue(
            autoLaunch,
            forKey: preferenceCenterKey(preferenceCenterID)
        )
    }

    func shouldAutoLaunchPreferenceCenter(
        _ preferenceCenterID: String,
        autoLaunch: Bool
    ) -> Bool {
        let autoLaunch: Bool? = readValue(
            preferenceCenterKey(preferenceCenterID)
        )
        return autoLaunch ?? true
    }

    private func readCodable<T: Codable>(_ key: String) -> T? {
        guard let data: Data = readValue(key) else {
            return nil
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            AirshipLogger.error("Failed to decode value for key \(key): \(error)")
            return nil
        }
    }

    private func readValue<T>(_ key: String) -> T? {
        let result = PluginStore.defaults.object(forKey: key)
        return result as? T
    }

    private func writeCodable<T: Codable>(
        _ codable: T?,
        forKey key: String
    ) {
        guard let codable = codable else {
            writeValue(nil, forKey: key)
            return
        }

        do {
            let data = try encoder.encode(codable)
            writeValue(data, forKey: key)
        } catch {
            AirshipLogger.error("Failed to write codable for key \(key): \(error)")
        }
    }

    private func writeValue(_ value: Any?, forKey key: String) {
        if let value = value {
            PluginStore.defaults.set(value, forKey: key)
        } else {
            PluginStore.defaults.removeObject(forKey: key)
        }
    }

}

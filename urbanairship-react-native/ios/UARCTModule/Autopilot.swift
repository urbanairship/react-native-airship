/* Copyright Airship and Contributors */

import Foundation
import AirshipKit

@objc(AirshipAutopilot)
public class AirshipAutopilot: NSObject {

    private static let version = "15.0.0"

    private static let airshipDelegate = AirshipDelegate()

    @objc(attemptTakeOffWithLaunchOptions:)
    public static func attemptTakeOff(
        launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) {
        AirshipLogger.debug("attemptTakeOff: \(String(describing: launchOptions))")

        guard !Airship.isFlying else {
            return;
        }

        var airshipConfig: Config? = nil

        if let config = PluginStore.shared.config {
            airshipConfig = config.airshipConfig
            guard airshipConfig?.validate() == true else {
                AirshipLogger.error("Invalid config: \(String(describing: airshipConfig))")
                return
            }
        } else {
            airshipConfig = Config.default()
            guard airshipConfig?.validate() == true else {
                // Do not log, this is a normal case if they are calling takeOff direclty
                return
            }
        }

        guard let airshipConfig = airshipConfig else {
            return
        }

        AirshipLogger.debug("Taking off! \(airshipConfig)")
        Airship.takeOff(airshipConfig, launchOptions: launchOptions)


        Airship.shared.deepLinkDelegate = self.airshipDelegate
        Airship.push.registrationDelegate = self.airshipDelegate
        Airship.push.pushNotificationDelegate = self.airshipDelegate
        PreferenceCenter.shared.openDelegate = self.airshipDelegate
        MessageCenter.shared.displayDelegate = self.airshipDelegate

        NotificationCenter.default.addObserver(
            forName: NSNotification.Name.UAInboxMessageListUpdated,
            object: nil,
            queue: .main
        ) { _ in
            self.airshipDelegate.messageCenterInboxUpdated()
        }

        NotificationCenter.default.addObserver(
            forName: Channel.channelCreatedEvent,
            object: nil,
            queue: .main
        ) { _ in
            self.airshipDelegate.channelCreated()
        }

        Airship.analytics.registerSDKExtension(
            .reactNative,
            version: self.version
        )

        Airship.push.defaultPresentationOptions = PluginStore.shared.foregroundPresentationOptions

        if let categories = loadCategories() {
            Airship.push.customCategories = categories
        }
    }

    static func loadCategories() -> Set<UNNotificationCategory>? {
        let categoriesPath = Bundle.main.path(
            forResource: "UACustomNotificationCategories",
            ofType: "plist"
        )

        guard let categoriesPath = categoriesPath else {
            return nil
        }

        return NotificationCategories.createCategories(
            fromFile: categoriesPath
        )
    }
}

/* Copyright Airship and Contributors */

import AirshipFrameworkProxy
import AirshipKit

@objc(AirshipPluginLoader)
@MainActor
public class AirshipPluginLoader: NSObject, AirshipPluginLoaderProtocol {
    @objc
    public static var disabled: Bool = false

    public static func onLoad() {
        if (!disabled) {
            AirshipLogger.trace("AirshipPluginLoader onLoad.")
            AirshipReactNative.shared.onLoad()
        } else {
            AirshipLogger.trace("AirshipPluginLoader onLoad skipped (disabled).")
        }
    }
}

/* Copyright Airship and Contributors */

import AirshipFrameworkProxy

@objc(AirshipPluginLoader)
@MainActor
public class AirshipPluginLoader: NSObject, AirshipPluginLoaderProtocol {
    @objc
    public static var disabled: Bool = false

    public static func onLoad() {
        if (!disabled) {
            AirshipReactNative.shared.onLoad()
        }
    }
}

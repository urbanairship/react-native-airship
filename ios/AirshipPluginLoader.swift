import AirshipFrameworkProxy

@objc(AirshipPluginLoader)
public class AirshipPluginLoader: NSObject, AirshipPluginLoaderProtocol {
    @objc
    public static var disabled: Bool = false

    public static func onApplicationDidFinishLaunching(
        launchOptions: [UIApplication.LaunchOptionsKey : Any]?
    ) {
        if (!disabled) {
            AirshipReactNative.shared.onLoad(launchOptions: launchOptions)
        }
    }
}

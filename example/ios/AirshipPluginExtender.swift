import Foundation
import AirshipKit
import AirshipFrameworkProxy
import ActivityKit

@objc(AirshipPluginExtender)
public class AirshipPluginExtender: NSObject, AirshipPluginExtenderProtocol {
  public static func onAirshipReady() {

    if #available(iOS 16.1, *) {
      // Will throw if called more than once
      try? LiveActivityManager.shared.setup { configurator in

        // Call per widget
        await configurator.register(forType: Activity<ExampleWidgetsAttributes>.self) { attributes in
          // Track this property as the Airship name for updates
          attributes.name
        }
      }
    }
  }
}

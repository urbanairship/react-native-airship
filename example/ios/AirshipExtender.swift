import Foundation
import AirshipKit
import AirshipFrameworkProxy
import ActivityKit

@objc
public class AirshipExtender: NSObject {

  fileprivate static let shared: AirshipExtender = AirshipExtender()


  @objc
  @MainActor
  public class func setup() {
    if #available(iOS 16.1, *) {
      // Can only call this once. It only throws on second call
      try? LiveActivityManager.shared.setup { configurator in

        // Call per widget
        await configurator.register(forType: Activity<ExampleWidgetsAttributes>.self, typeReferenceID: "Example") { attributes in
          // Track this property as the Airship name for updates
          attributes.name
        }

      }
    }
  }
}

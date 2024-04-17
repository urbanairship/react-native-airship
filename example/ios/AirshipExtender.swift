import Foundation
import AirshipKit


@objc
public class AirshipExtender: NSObject {

  fileprivate static let shared: AirshipExtender = AirshipExtender()


  @objc
  @MainActor
  public class func setup() {
    if (Airship.isFlying) {
      self.shared.airshipReady()
    } else {
      NotificationCenter.default.addObserver(forName: AirshipNotifications.AirshipReady.name, object: nil, queue: nil) { _ in
        Task { @MainActor in
          self.shared.airshipReady()
        }
      }
    }
  }

  @MainActor
  private func airshipReady() {
    // Make restore call here
  }
}

/* Copyright Airship and Contributors */

import Foundation
@_spi(AirshipInternal) import AirshipCore
import AirshipAutomation
import AirshipScenes
import AirshipFrameworkProxy
import SwiftUI
#if canImport(ReactNativeAirshipBridge)
import ReactNativeAirshipBridge
#endif

@objc(RNAirshipEmbeddedViewWrapper)
public final class AirshipEmbeddedViewWrapper: UIView, RNAirshipEmbeddedViewBridge {
    private let viewModel = ReactAirshipEmbeddedView.ViewModel()
    @objc
    public let viewController: UIViewController
    public var isAdded: Bool = false

    @objc(setConfig:)
    public func setConfig(_ json: String?) {
        guard let json, let data = json.data(using: .utf8),
              let config = try? JSONDecoder().decode(EmbeddedViewConfig.self, from: data) else {
            return
        }

        self.viewModel.embeddedID = config.embeddedId
        if config.selection?.type == "instance_id", let instanceId = config.selection?.instanceId, !instanceId.isEmpty {
            self.viewModel.selection = .instance([instanceId])
        } else {
            self.viewModel.selection = .priority
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc
    public override init(frame: CGRect) {
        self.viewController = UIHostingController(
            rootView: ReactAirshipEmbeddedView(viewModel: self.viewModel)
        )

        self.viewController.view.backgroundColor = UIColor.clear

        super.init(frame: frame)
        self.translatesAutoresizingMaskIntoConstraints = false
        self.addSubview(self.viewController.view)
        self.viewController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        self.viewModel.size = frame.size
    }

    public override func didMoveToWindow() {
        super.didMoveToWindow()

        if self.window == nil {
            if self.isAdded {
                self.viewController.willMove(toParent: nil)
                self.viewController.removeFromParent()
                self.isAdded = false
            }
            return
        }

        guard !self.isAdded, let parentVC = self.parentViewController() else { return }
        self.viewController.willMove(toParent: parentVC)
        parentVC.addChild(self.viewController)
        self.viewController.didMove(toParent: parentVC)
        self.viewController.view.isUserInteractionEnabled = true
        isAdded = true
    }

    public override func layoutSubviews() {
        super.layoutSubviews()
        self.viewModel.size = bounds.size
    }
}

private struct EmbeddedViewConfig: Decodable {
    let embeddedId: String
    let selection: Selection?

    struct Selection: Decodable {
        let type: String
        let instanceId: String?
    }
}

extension UIView {
    func parentViewController() -> UIViewController? {
        var responder: UIResponder? = self
        while let r = responder {
            if let vc = r as? UIViewController {
                return vc
            }
            responder = r.next
        }
        return nil
    }
}

import SwiftUI

struct ReactAirshipEmbeddedView: View {
  @ObservedObject var viewModel: ViewModel
    var body: some View {

        if let embeddedID = viewModel.embeddedID {
            AirshipEmbeddedView(embeddedID: embeddedID,
                embeddedSize: .init(
                    parentWidth: viewModel.parentWidth,
                    parentHeight: viewModel.parentHeight
                ),
                selection: viewModel.selection
            )
        }
    }

    @MainActor
    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?
        @Published var selection: AirshipEmbeddedSelection = .priority

        /// The host's bound on each axis, or nil while layout has not supplied one.
        ///
        /// Nil is the SDK's own signal for "no parent stated": it resolves a percent
        /// placement against the SwiftUI proposal instead, which is the real box. A
        /// stand-in value overrides that and sizes content against space the app
        /// never gave the view. In React Native an unsized view is 0, not unknown.
        var parentWidth: CGFloat? { Self.bound(self.size?.width) }
        var parentHeight: CGFloat? { Self.bound(self.size?.height) }

        private static func bound(_ length: CGFloat?) -> CGFloat? {
            guard let length, length > 0 else { return nil }
            return length
        }
    }

}




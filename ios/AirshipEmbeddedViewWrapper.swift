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

    /// Last height handed to the component view, in points. Negative means none yet.
    private var reportedHeight: CGFloat = -1

    /// Called with the content height in points whenever it changes.
    @objc
    public var onSizeChange: ((CGFloat) -> Void)?

    @objc(setSizeToContent:)
    public func setSizeToContent(_ value: Bool) {
        guard self.viewModel.sizeToContent != value else { return }
        // The next report measures against a different proposal, so not a duplicate.
        self.reportedHeight = -1
        self.viewModel.sizeToContent = value
    }

    private func reportContentHeight(_ height: CGFloat) {
        // A height at or below the floor means the content could not resolve one, not
        // that it is empty; hold the last real value rather than collapsing the view.
        guard height > Self.minContentHeight,
              abs(height - self.reportedHeight) > Self.heightEpsilon else {
            return
        }
        self.reportedHeight = height
        self.onSizeChange?(height)
    }

    /// Reports that there is no content, clearing any height already handed over.
    ///
    /// Zero bypasses the measurement floor: it is an availability signal, not a
    /// measurement, and the floor exists only to absorb transient layout zeros.
    private func reportContentGone() {
        guard self.reportedHeight != 0 else { return }
        self.reportedHeight = 0
        self.onSizeChange?(0)
    }

    private static let minContentHeight: CGFloat = 1.0
    private static let heightEpsilon: CGFloat = 0.5

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
        self.viewModel.onHeightChange = { [weak self] height in
            self?.reportContentHeight(height)
        }
        self.viewModel.onContentUnavailable = { [weak self] in
            self?.reportContentGone()
        }
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
            AirshipEmbeddedView(
                embeddedID: embeddedID,
                embeddedSize: .init(
                    parentWidth: viewModel.parentWidth,
                    parentHeight: viewModel.parentHeight
                ),
                selection: viewModel.selection
            ) { [viewModel] in
                // A measured zero is ambiguous during layout, so unavailability is signalled here.
                // Zero sized on purpose: a greedy placeholder would feed back the height it cleared.
                Color.clear
                    .frame(width: 0, height: 0)
                    .onAppear { viewModel.onContentUnavailable?() }
            }
            // Reported on every layout pass rather than through a preference, which
            // misses the placeholder-to-content transition. The wrapper dedupes.
            .background(
                GeometryReader { [viewModel] proxy -> Color in
                    let height = proxy.size.height
                    DispatchQueue.main.async {
                        viewModel.onHeightChange?(height)
                    }
                    return Color.clear
                }
            )
            // While self sizing the host is taller than the visible box, so pin the
            // content to the top instead of letting SwiftUI centre it out of view.
            .frame(
                maxWidth: .infinity,
                maxHeight: .infinity,
                alignment: viewModel.sizeToContent ? .top : .center
            )
        }
    }

    @MainActor
    class ViewModel: ObservableObject {
      @Published var embeddedID: String?
        @Published var size: CGSize?
        @Published var selection: AirshipEmbeddedSelection = .priority
        @Published var sizeToContent: Bool = false

        var onHeightChange: ((CGFloat) -> Void)?

        /// Called when the content goes away, so a stale height cannot size what
        /// arrives next.
        var onContentUnavailable: (() -> Void)?

        /// The host's bound on each axis, or nil while layout has not supplied one.
        ///
        /// Nil is the SDK's own signal for "no parent stated": it resolves a percent
        /// placement against the SwiftUI proposal instead, which is the real box. A
        /// stand-in value overrides that and sizes content against space the app
        /// never gave the view. In React Native an unsized view is 0, not unknown.
        var parentWidth: CGFloat? { Self.bound(self.size?.width) }

        /// While self sizing the window height stands in: measurement must not depend
        /// on the box the host just set, or the two feed each other.
        var parentHeight: CGFloat? {
            if sizeToContent {
                return Self.windowHeight()
            }
            return Self.bound(self.size?.height)
        }

        private static func bound(_ length: CGFloat?) -> CGFloat? {
            guard let length, length > 0 else { return nil }
            return length
        }

        @MainActor
        static func windowHeight() -> CGFloat? {
            UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }?
                .screen.bounds.height
        }
    }

}




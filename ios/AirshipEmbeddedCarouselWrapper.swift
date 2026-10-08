/* Copyright Airship and Contributors */

import Foundation
import Combine
@_spi(AirshipInternal) import AirshipCore
import AirshipAutomation
import AirshipScenes
import AirshipFrameworkProxy
import SwiftUI
#if canImport(ReactNativeAirshipBridge)
import ReactNativeAirshipBridge
#endif

@objc(RNAirshipEmbeddedCarouselWrapper)
public final class AirshipEmbeddedCarouselWrapper: UIView, RNAirshipEmbeddedCarouselBridge {
    // Shares embedded ID, selection and sizing rules with the embedded view.
    private let viewModel = ReactAirshipEmbeddedView.ViewModel()
    private let carouselState = AirshipEmbeddedCarouselState()
    private var cancellable: AnyCancellable?
    private var pendingPage: Int?
    private var lastRequestedPage: Int?

    @objc
    public let viewController: UIViewController
    public var isAdded: Bool = false

    @objc
    public weak var delegate: (any RNAirshipEmbeddedCarouselWrapperDelegate)?

    @objc(setConfig:)
    public func setConfig(_ json: String?) {
        guard let json, let data = json.data(using: .utf8),
              let config = try? JSONDecoder().decode(EmbeddedCarouselConfig.self, from: data) else {
            return
        }

        self.viewModel.embeddedID = config.embeddedId
        if config.selection?.type == "instance_id", let instanceId = config.selection?.instanceId, !instanceId.isEmpty {
            self.viewModel.selection = .instance([instanceId])
        } else {
            self.viewModel.selection = .priority
        }
    }

    @objc(setPage:)
    public func setPage(_ page: Int) {
        guard page != lastRequestedPage else { return }
        lastRequestedPage = page
        guard page >= 0 else {
            pendingPage = nil
            return
        }
        pendingPage = page
        applyPendingPage()
    }

    private func applyPendingPage() {
        guard let page = pendingPage, carouselState.pageCount > 0 else { return }
        pendingPage = nil
        let target = min(page, carouselState.pageCount - 1)
        if carouselState.currentPage != target {
            carouselState.currentPage = target
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc
    public override init(frame: CGRect) {
        self.viewController = UIHostingController(
            rootView: ReactAirshipEmbeddedCarousel(
                viewModel: self.viewModel,
                carouselState: self.carouselState
            )
        )

        self.viewController.view.backgroundColor = UIColor.clear

        super.init(frame: frame)
        self.translatesAutoresizingMaskIntoConstraints = false
        self.addSubview(self.viewController.view)
        self.viewController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        self.viewModel.size = frame.size

        self.cancellable = Publishers.CombineLatest(
            self.carouselState.$currentPage,
            self.carouselState.$pageCount
        )
        .receive(on: DispatchQueue.main)
        .sink { [weak self] currentPage, pageCount in
            self?.stateChanged(currentPage: currentPage, pageCount: pageCount)
        }
    }

    private func stateChanged(currentPage: Int?, pageCount: Int) {
        applyPendingPage()
        // Read back the live values; the published values may be stale by the
        // time this runs on the main queue.
        let count = carouselState.pageCount
        let page = count > 0 ? (carouselState.currentPage ?? 0) : 0
        delegate?.onCarouselStateChanged(
            currentPage: page,
            pageCount: count,
            isAvailable: count > 0
        )
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

private struct EmbeddedCarouselConfig: Decodable {
    let embeddedId: String
    let selection: Selection?

    struct Selection: Decodable {
        let type: String
        let instanceId: String?
    }
}

private struct ReactAirshipEmbeddedCarousel: View {
    @ObservedObject var viewModel: ReactAirshipEmbeddedView.ViewModel
    let carouselState: AirshipEmbeddedCarouselState

    var body: some View {
        if let embeddedID = viewModel.embeddedID {
            AirshipEmbeddedCarousel(
                state: carouselState,
                embeddedID: embeddedID,
                embeddedSize: .init(
                    parentWidth: viewModel.width,
                    parentHeight: viewModel.height
                ),
                selection: viewModel.selection
            )
        }
    }
}

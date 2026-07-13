/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import SwiftUI

@objc(RNAirshipMessageWebViewWrapperDelegate)
public protocol MessageWebViewWrapperDelegate: AnyObject {
    func onMessageBodyLoadFailed(messageID: String)
    func onMessageGone(messageID: String)
    func onMessageLoadFailed(messageID: String)
    func onLoadStarted(messageID: String)
    func onLoadFinished(messageID: String)
    func onClose(messageID: String)
}

@MainActor
private class MessageState: ObservableObject {
    @Published var viewModel: MessageCenterMessageViewModel?
    @Published var phase: MessageCenterMessageContentPhase = .loading
    var onClose: (@MainActor @Sendable () -> Void)?
    var onPhaseChange: (@MainActor (MessageCenterMessageContentPhase) -> Void)?
}

private struct MessageContainerView: View {
    @ObservedObject var state: MessageState

    var body: some View {
        if let viewModel = state.viewModel {
            MessageCenterMessageContentView(
                viewModel: viewModel,
                phase: $state.phase,
                dismissAction: state.onClose
            )
            .id(viewModel.messageID)
            .onChange(of: state.phase) { phase in
                state.onPhaseChange?(phase)
            }
        }
    }
}

@objc(RNAirshipMessageWebViewWrapper)
@MainActor
public final class MessageWebViewWrapper: UIView {

    @objc public weak var delegate: MessageWebViewWrapperDelegate?

    private let state: MessageState
    private let hostingController: UIHostingController<MessageContainerView>
    private var currentMessageID: String?
    private var isAdded = false

    @objc
    public override init(frame: CGRect) {
        let state = MessageState()
        self.state = state
        hostingController = UIHostingController(rootView: MessageContainerView(state: state))
        hostingController.view.backgroundColor = .clear

        super.init(frame: frame)

        addSubview(hostingController.view)
        hostingController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]

        state.onPhaseChange = { [weak self] phase in
            guard let self, let messageID = self.currentMessageID else { return }
            switch phase {
            case .loading:
                break
            case .loaded:
                self.delegate?.onLoadFinished(messageID: messageID)
            case .error(let error):
                switch error {
                case .messageGone:
                    self.delegate?.onMessageGone(messageID: messageID)
                case .failedToFetchMessage:
                    self.delegate?.onMessageLoadFailed(messageID: messageID)
                case .messageLoadFailed:
                    self.delegate?.onMessageBodyLoadFailed(messageID: messageID)
                }
            }
        }
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func didMoveToWindow() {
        super.didMoveToWindow()

        if window == nil {
            if isAdded {
                hostingController.willMove(toParent: nil)
                hostingController.removeFromParent()
                isAdded = false
            }
            return
        }

        guard !isAdded, let parentVC = parentViewController() else { return }
        hostingController.willMove(toParent: parentVC)
        parentVC.addChild(hostingController)
        hostingController.didMove(toParent: parentVC)
        hostingController.view.isUserInteractionEnabled = true
        isAdded = true
    }

    @objc
    public func loadMessage(messageID: String?) {
        guard let messageID else { return }

        currentMessageID = messageID

        delegate?.onLoadStarted(messageID: messageID)

        state.onClose = { [weak self] in
            guard let self, let id = self.currentMessageID else { return }
            self.delegate?.onClose(messageID: id)
        }

        state.phase = .loading
        state.viewModel = MessageCenterMessageViewModel(messageID: messageID)
    }
}

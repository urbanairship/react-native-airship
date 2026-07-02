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
    @Published var messageID: String?
    var onClose: (@MainActor @Sendable () -> Void)?
}

private struct MessageContainerView: View {
    @ObservedObject var state: MessageState

    var body: some View {
        if let messageID = state.messageID {
            MessageCenterMessageView(
                messageID: messageID,
                dismissAction: state.onClose
            )
            .id(messageID)
        }
    }
}

@objc(RNAirshipMessageWebViewWrapper)
@MainActor
public final class MessageWebViewWrapper: UIView {

    @objc public weak var delegate: MessageWebViewWrapperDelegate?

    private let state = MessageState()
    private var currentMessageID: String?
    private var loadTask: Task<Void, Never>?
    private var isAdded = false

    private let hostingController: UIHostingController<MessageContainerView>

    @objc
    public override init(frame: CGRect) {
        hostingController = UIHostingController(rootView: MessageContainerView(state: MessageState()))
        hostingController.view.backgroundColor = .clear

        super.init(frame: frame)

        addSubview(hostingController.view)
        hostingController.view.autoresizingMask = [.flexibleWidth, .flexibleHeight]
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

        loadTask?.cancel()
        currentMessageID = messageID

        delegate?.onLoadStarted(messageID: messageID)

        state.onClose = { [weak self] in
            guard let self, let id = self.currentMessageID else { return }
            self.delegate?.onClose(messageID: id)
        }
        state.messageID = messageID

        let viewModel = MessageCenterMessageViewModel(messageID: messageID)
        loadTask = Task { @MainActor [weak self] in
            guard let self else { return }
            do {
                let message = try await viewModel.fetchMessageThrowing()
                guard !Task.isCancelled else { return }
                self.delegate?.onLoadFinished(messageID: message.id)
            } catch let error as MessageCenterMessageError {
                guard !Task.isCancelled else { return }
                switch error {
                case .messageGone:
                    self.delegate?.onMessageGone(messageID: messageID)
                case .failedToFetchMessage:
                    self.delegate?.onMessageLoadFailed(messageID: messageID)
                }
            } catch {
                guard !Task.isCancelled else { return }
                self.delegate?.onMessageLoadFailed(messageID: messageID)
            }
        }
    }
}

/* Copyright Airship and Contributors */

import Foundation
import AirshipKit
import AirshipFrameworkProxy

@objc(RTNAirshipMessageWebViewWrapperDelegate)
public protocol MessageWebViewWrapperDelegate {
    func onMessageBodyLoadFailed(messageID: String)
    func onMessageGone(messageID: String)
    func onMessageLoadFailed(messageID: String)
    func onLoadStarted(messageID: String)
    func onLoadFinished(messageID: String)
    func onClose(messageID: String)
}

@objc(RTNAirshipMessageWebViewWrapper)
public class MessageWebViewWrapper: NSObject {
    private let innerWrapper: _MessageWebViewWrapper

    @objc
    public var webView: WKWebView {
        get {
            return self.innerWrapper.webView
        }
    }

    @objc
    public weak var delegate: MessageWebViewWrapperDelegate? {
        set {
            self.innerWrapper.delegate = newValue
        }
        get {
            self.innerWrapper.delegate
        }
    }

    @MainActor
    @objc
    public func loadMessage(messageID: String?) {
        self.innerWrapper.loadMessage(messageID: messageID)
    }

    @objc
    public init(frame: CGRect) {
        self.innerWrapper = _MessageWebViewWrapper(frame: frame)
    }
}


class _MessageWebViewWrapper: NSObject, UANavigationDelegate, NativeBridgeDelegate {

    public weak var delegate: MessageWebViewWrapperDelegate? = nil

    private let nativeBridge: NativeBridge  = NativeBridge()
    private let nativeBridgeExtension = MessageCenterNativeBridgeExtension()
    @objc
    public let webView: WKWebView
    private var messageID: String? = nil
    private var task: Task<Void, Never>? = nil

    public init(frame: CGRect) {
        self.webView = WKWebView(frame: frame)
        super.init()

        self.nativeBridge.forwardNavigationDelegate = self
        self.nativeBridge.nativeBridgeDelegate = self
        self.nativeBridge.nativeBridgeExtensionDelegate = self.nativeBridgeExtension
        self.webView.navigationDelegate = self.nativeBridge
        self.webView.configuration.dataDetectorTypes = .all
    }

    @MainActor
    public func loadMessage(messageID: String?) {
        self.webView.stopLoading()
        task?.cancel()

        guard let messageID = messageID else { return }

        guard Airship.isFlying else {
            self.delegate?.onMessageLoadFailed(messageID: messageID)
            return
        }

        self.messageID = messageID
        self.delegate?.onLoadStarted(messageID: messageID)
        self.task = Task {
            await startLoad(messageID: messageID)
        }
    }



    @MainActor
    private func startLoad(messageID: String) async {
        var message: InboxMessage? = nil
        do {
            message = try await getMessage(messageID: messageID)
        } catch {
            self.delegate?.onMessageLoadFailed(messageID: messageID)
        }

        guard let message = message else {
            if (!Task.isCancelled) {
                self.delegate?.onMessageGone(messageID: messageID)
            }
            return
        }

        let userData = await MessageCenter.shared.user.data()

        var request = URLRequest(url: message.messageBodyURL)
        request.timeoutInterval = 60
        request.setValue(
            Utils.authHeader(
                username: userData.username,
                password: userData.password
            ),
            forHTTPHeaderField: "Authorization"
        )

        if (!Task.isCancelled) {
            self.webView.load(request)
        }
    }

    private func getMessage(messageID: String) async throws -> InboxMessage? {
        let message = MessageCenter.shared.messageList.message(forID: messageID)
        if let message = message {
            return message
        }

        try await AirshipProxy.shared.messageCenter.refresh()
        return MessageCenter.shared.messageList.message(forID: messageID)
    }

    public func close() {
        guard let messageID = self.messageID else {
            return
        }
        self.delegate?.onClose(messageID: messageID)
    }

    public func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationResponse: WKNavigationResponse
    ) async -> WKNavigationResponsePolicy {
        guard let messageID = self.messageID else {
            return .cancel
        }

        guard let response = navigationResponse.response as? HTTPURLResponse else {
            return .allow
        }

        switch(response.statusCode) {
        case 410:
            delegate?.onMessageGone(messageID: messageID)
            return .cancel
        case 200..<300:
            return .allow
        default:
            delegate?.onMessageLoadFailed(messageID: messageID)
            return .cancel
        }
    }

    public func webView(
        _ webView: WKWebView,
        didFailProvisionalNavigation navigation: WKNavigation!,
        withError error: Error
    ) {
        self.didFailNavigation(error: error)
    }

    public func webView(
        _ webView: WKWebView,
        didFail navigation: WKNavigation!,
        withError error: Error
    ) {
        self.didFailNavigation(error: error)
    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        guard let messageID = self.messageID else {
            return
        }

        Task {
            try await AirshipProxy.shared.messageCenter.markMessageRead(
                messageID: messageID
            )
        }

        self.delegate?.onLoadFinished(messageID: messageID)
    }

    private func didFailNavigation(error: Error) {
        guard let messageID = self.messageID else {
            return
        }

        if let error = error as? URLError, error.code == .cancelled {
            return
        }

        self.delegate?.onMessageLoadFailed(messageID: messageID)
    }


}

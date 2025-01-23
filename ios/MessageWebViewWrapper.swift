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


class _MessageWebViewWrapper: NSObject, AirshipWKNavigationDelegate, NativeBridgeDelegate {

    public weak var delegate: MessageWebViewWrapperDelegate? = nil

    private let nativeBridge: NativeBridge  = NativeBridge()
    private var nativeBridgeExtension: MessageCenterNativeBridgeExtension? = nil
    @objc
    public let webView: WKWebView
    private var messageID: String? = nil
    private var task: Task<Void, Never>? = nil

    public init(frame: CGRect) {
        self.webView = WKWebView(frame: frame)
        super.init()

        self.nativeBridge.forwardNavigationDelegate = self
        self.nativeBridge.nativeBridgeDelegate = self
        self.webView.navigationDelegate = self.nativeBridge
        self.webView.configuration.dataDetectorTypes = .all

        if #available(iOS 16.4, *) {
            self.webView.isInspectable = Airship.isFlying && Airship.config.airshipConfig.isWebViewInspectionEnabled
        }
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
        var message: MessageCenterMessage? = nil
        do {
            message = try await getMessage(messageID: messageID)
        } catch {
            self.delegate?.onMessageLoadFailed(messageID: messageID)
        }

        guard let message = message, let user = await Airship.messageCenter.inbox.user else {
            if (!Task.isCancelled) {
                self.delegate?.onMessageGone(messageID: messageID)
            }
            return
        }

        self.nativeBridgeExtension = MessageCenterNativeBridgeExtension(
            message: message,
            user: user
        )
        self.nativeBridge.nativeBridgeExtensionDelegate = self.nativeBridgeExtension
        let auth = await Airship.messageCenter.inbox.user?.basicAuthString

        var request = URLRequest(url: message.bodyURL)
        request.timeoutInterval = 60
        request.setValue(
            auth,
            forHTTPHeaderField: "Authorization"
        )

        if (!Task.isCancelled) {
            self.webView.load(request)
        }
    }

    private func getMessage(messageID: String) async throws -> MessageCenterMessage? {
        let message = await Airship.messageCenter.inbox.message(forID: messageID)
        if let message = message {
            return message
        }

        try await AirshipProxy.shared.messageCenter.refresh()
        return await Airship.messageCenter.inbox.message(forID: messageID)
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

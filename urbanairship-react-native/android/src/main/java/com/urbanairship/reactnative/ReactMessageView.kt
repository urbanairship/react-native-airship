/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.urbanairship.Cancelable
import com.urbanairship.messagecenter.Inbox.FetchMessagesCallback
import com.urbanairship.messagecenter.Message
import com.urbanairship.messagecenter.MessageCenter
import com.urbanairship.messagecenter.webkit.MessageWebView
import com.urbanairship.messagecenter.webkit.MessageWebViewClient

class ReactMessageView(context: Context) : FrameLayout(context), LifecycleEventListener {

    private var message: Message? = null
    private var fetchMessageRequest: Cancelable? = null
    private var webView: MessageWebView? = null

    private val webViewClient: WebViewClient = object : MessageWebViewClient() {

        private var error: Int? = null

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)

            message?.let { message ->
                error?.let {
                    notifyLoadError(message.messageId, ERROR_MESSAGE_LOAD_FAILED, false)
                    return
                }

                message.markRead()
                notifyLoadFinished(message.messageId)
            }
        }

        override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String?) {
            super.onReceivedError(view, errorCode, description, failingUrl)

            message?.let { message ->
                failingUrl?.let {
                    if (it == message.messageBodyUrl) {
                        error = errorCode
                    }
                }
            }
        }

        public override fun onClose(webView: WebView) {
            message?.let {
                notifyClose(it.messageId)
            }
        }
    }

    fun loadMessage(messageId: String) {
        if (webView == null) {
            webView = MessageWebView(context)
            webView?.webViewClient = webViewClient
            addView(webView)
        }

        fetchMessageRequest?.let {
            it.cancel()
        }
        message = null
        startLoading(messageId)
    }

    fun startLoading(messageId: String) {
        notifyLoadStarted(messageId)

        if (!Utils.ensureAirshipReady()) {
            notifyLoadError(messageId, ERROR_MESSAGE_NOT_AVAILABLE, false)
            return
        }

        message = MessageCenter.shared().inbox.getMessage(messageId)

        if (message == null) {
            fetchMessageRequest = MessageCenter.shared().inbox.fetchMessages(FetchMessagesCallback { success ->
                    message = MessageCenter.shared().inbox.getMessage(messageId)
                    if (!success) {
                        notifyLoadError(messageId, ERROR_FAILED_TO_FETCH_MESSAGE, true)
                        return@FetchMessagesCallback
                    } else if (message == null || message!!.isExpired) {
                        notifyLoadError(messageId, ERROR_MESSAGE_NOT_AVAILABLE, false)
                        return@FetchMessagesCallback
                    }
                    webView?.loadMessage(message!!)
                })
        } else {
            if (message!!.isExpired) {
                notifyLoadError(messageId, ERROR_MESSAGE_NOT_AVAILABLE, false)
                return
            }
            webView?.loadMessage(message!!)
        }
    }

    private fun notifyLoadError(messageId: String, error: String, retryable: Boolean) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        event.putBoolean(RETRYABLE_KEY, retryable)
        event.putString(ERROR_KEY, error)
        notify(EVENT_LOAD_ERROR, event)
    }

    private fun notifyLoadFinished(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(EVENT_LOAD_FINISHED, event)
    }

    private fun notifyLoadStarted(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(EVENT_LOAD_STARTED, event)
    }

    private fun notifyClose(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(EVENT_CLOSE, event)
    }

    private fun notify(eventName: String, event: WritableMap) {
        val reactContext = context as ReactContext
        reactContext.getJSModule(RCTEventEmitter::class.java).receiveEvent(id, eventName, event)
    }

    override fun onHostResume() {
        webView?.onResume()
    }

    override fun onHostPause() {
        webView?.onPause()
    }

    override fun onHostDestroy() {
        cleanup()
    }

    fun cleanup() {
        webView?.setWebViewClient(null)
        webView?.destroy()
        webView = null
    }

    companion object {
        const val EVENT_LOAD_STARTED = "onLoadStarted"
        const val EVENT_LOAD_FINISHED = "onLoadFinished"
        const val EVENT_LOAD_ERROR = "onLoadError"
        const val EVENT_CLOSE = "onClose"

        private const val MESSAGE_ID_KEY = "messageId"
        private const val RETRYABLE_KEY = "retryable"
        private const val ERROR_KEY = "error"

        private const val ERROR_MESSAGE_NOT_AVAILABLE = "MESSAGE_NOT_AVAILABLE"
        private const val ERROR_FAILED_TO_FETCH_MESSAGE = "FAILED_TO_FETCH_MESSAGE"
        private const val ERROR_MESSAGE_LOAD_FAILED = "MESSAGE_LOAD_FAILED"
    }
}
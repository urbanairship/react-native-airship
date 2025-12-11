/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.annotation.SuppressLint
import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.urbanairship.messagecenter.ui.widget.MessageWebView
import com.urbanairship.messagecenter.ui.widget.MessageWebViewClient
import com.urbanairship.messagecenter.Message
import com.urbanairship.messagecenter.MessageCenter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.plus

@SuppressLint("RestrictedApi")
class ReactMessageView(context: Context) : FrameLayout(context), LifecycleEventListener {

    private var message: Message? = null
    private var webView: MessageWebView? = null
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main.immediate) + SupervisorJob()
    private var loadJob: Job? = null

    private val webViewClient: WebViewClient = object : MessageWebViewClient() {

        private var error: Int? = null

        override fun onPageFinished(view: WebView?,  url: String?) {
            super.onPageFinished(view, url)

            message?.let { message ->
                error?.let {
                    notifyLoadError(message.id, ERROR_MESSAGE_LOAD_FAILED, false)
                    return
                }

                MessageCenter.shared().inbox.markMessagesRead(message.id)
                notifyLoadFinished(message.id)
            }
        }

        override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String?) {
            super.onReceivedError(view, errorCode, description, failingUrl)

            message?.let { message ->
                failingUrl?.let {
                    if (it == message.bodyUrl) {
                        error = errorCode
                    }
                }
            }
        }

        public override fun onClose(webView: WebView) {
            message?.let {
                notifyClose(it.id)
            }
        }
    }

    private suspend fun fetchMessage(messageId: String): FetchMessageResult {
        var message = MessageCenter.shared().inbox.getMessage(messageId)

        if (message == null) {
            if (!MessageCenter.shared().inbox.fetchMessages()) {
                return FetchMessageResult.Error(ERROR_FAILED_TO_FETCH_MESSAGE, true)
            }

            message = MessageCenter.shared().inbox.getMessage(messageId)
        }

        return if (message == null || message.isExpired) {
            FetchMessageResult.Error(ERROR_MESSAGE_NOT_AVAILABLE, false)
        } else {
            FetchMessageResult.Success(message)
        }
    }

    fun loadMessage(messageId: String) {
        loadJob?.cancel()
        var delayLoading = false

        if (webView == null) {
            webView = MessageWebView(context)
            webView?.webViewClient = webViewClient
            addView(webView)
            delayLoading = true
        }

        message = null

        loadJob = scope.launch {
            if (delayLoading) {
                delay(50)
            }

            if (!isActive) {
                return@launch
            }

            notifyLoadStarted(messageId)

            val messageResult = fetchMessage(messageId)

            if (!isActive) {
                return@launch
            }

            when (messageResult) {
                is FetchMessageResult.Error -> {
                    notifyLoadError(messageId, messageResult.error, messageResult.isRetryable)
                }

                is FetchMessageResult.Success -> {
                    this@ReactMessageView.message = messageResult.message
                    webView?.loadMessage(messageResult.message)
                }
            }
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
        reactContext.airshipDispatchEvent(id, eventName, event)
    }

    override fun onHostResume() {
        webView?.onResume()
        webView?.resumeTimers()
    }

    override fun onHostPause() {
        webView?.onPause()
        webView?.pauseTimers()
    }

    override fun onHostDestroy() {
        cleanup()
    }

    fun cleanup() {
        webView?.destroy()
        webView = null
    }

    companion object {
        const val EVENT_LOAD_STARTED_REGISTRATION_NAME = "topLoadStarted"
        const val EVENT_LOAD_FINISHED_REGISTRATION_NAME = "topLoadFinished"
        const val EVENT_LOAD_ERROR_REGISTRATION_NAME = "topLoadError"
        const val EVENT_CLOSE_REGISTRATION_NAME = "topClose"

        const val EVENT_LOAD_STARTED_HANDLER_NAME = "onLoadStarted"
        const val EVENT_LOAD_FINISHED_HANDLER_NAME = "onLoadFinished"
        const val EVENT_LOAD_ERROR_HANDLER_NAME = "onLoadError"
        const val EVENT_CLOSE_HANDLER_NAME = "onClose"

        const val EVENT_LOAD_STARTED = "loadStarted"
        const val EVENT_LOAD_FINISHED = "loadFinished"
        const val EVENT_LOAD_ERROR = "loadError"
        const val EVENT_CLOSE = "close"

        private const val MESSAGE_ID_KEY = "messageId"
        private const val RETRYABLE_KEY = "retryable"
        private const val ERROR_KEY = "error"

        private const val ERROR_MESSAGE_NOT_AVAILABLE = "MESSAGE_NOT_AVAILABLE"
        private const val ERROR_FAILED_TO_FETCH_MESSAGE = "FAILED_TO_FETCH_MESSAGE"
        private const val ERROR_MESSAGE_LOAD_FAILED = "MESSAGE_LOAD_FAILED"
    }
}

internal sealed class FetchMessageResult {
    data class Success(val message: Message) : FetchMessageResult()
    data class Error(val error: String, val isRetryable: Boolean) : FetchMessageResult()
}
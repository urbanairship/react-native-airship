/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.annotation.SuppressLint
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.util.AttributeSet
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.annotation.CallSuper
import androidx.annotation.MainThread
import androidx.annotation.RestrictTo
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.urbanairship.Cancelable
import com.urbanairship.UALog
import com.urbanairship.UAirship
import com.urbanairship.actions.ActionArguments
import com.urbanairship.actions.ActionRunRequest
import com.urbanairship.javascript.JavaScriptEnvironment
import com.urbanairship.json.JsonMap
import com.urbanairship.json.JsonValue
import com.urbanairship.messagecenter.Inbox.FetchMessagesCallback
import com.urbanairship.messagecenter.Message
import com.urbanairship.messagecenter.MessageCenter
import com.urbanairship.webkit.AirshipWebViewClient
import com.urbanairship.webkit.NestedScrollAirshipWebView
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.plus
import kotlinx.coroutines.runBlocking
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ReactMessageView(context: Context) : FrameLayout(context), LifecycleEventListener {

    private var message: Message? = null
    private var webView: MessageWebView? = null
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main.immediate) + SupervisorJob()
    private var loadJob: Job? = null

    private val webViewClient: WebViewClient = object : MessageWebViewClient() {

        private var error: Int? = null

        override fun onPageFinished(view: WebView?, url: String?) {
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
            // Until ReactFeatureFlags.enableFabricPendingEventQueue is enabled by default, we need to avoid
            // sending events when the view is unmounted because the events are discarded otherwise
            if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED && delayLoading) {
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
        notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_ERROR else EVENT_LOAD_ERROR_HANDLER_NAME, event)
    }

    private fun notifyLoadFinished(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_FINISHED else EVENT_LOAD_FINISHED_HANDLER_NAME, event)
    }

    private fun notifyLoadStarted(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_STARTED else EVENT_LOAD_STARTED_HANDLER_NAME, event)
    }

    private fun notifyClose(messageId: String) {
        val event = Arguments.createMap()
        event.putString(MESSAGE_ID_KEY, messageId)
        notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_CLOSE else EVENT_CLOSE_HANDLER_NAME, event)
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


/** Base WebView configured for Airship Message Center content. */
internal class MessageWebView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyle: Int = 0,
    defResStyle: Int = 0
): NestedScrollAirshipWebView(context, attrs, defStyle, defResStyle) {

    /**
     * Loads the web view with the [Message].
     *
     * @param message The message that will be displayed.
     */
    fun loadMessage(message: Message) {
        UALog.v { "Loading message: ${message.id}" }
        val user = MessageCenter.shared().user

        // Send authorization in the headers if the web view supports it
        val headers = HashMap<String, String>()

        // Set the auth
        val (userId, password) = user.id to user.password
        if (userId != null && password != null) {
            setClientAuthRequest(message.bodyUrl, userId, password)
            headers["Authorization"] = createBasicAuth(userId, password)
        }
        UALog.v { "Load URL: ${message.bodyUrl}" }
        loadUrl(message.bodyUrl, headers)
    }
}

/** A `WebViewClient` that enables the Airship Native Bridge for Message Center. */
internal open class MessageWebViewClient : AirshipWebViewClient() {

    /**
     * @hide
     */
    @SuppressLint("RestrictedApi")
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    override fun extendActionRequest(
        request: ActionRunRequest,
        webView: WebView
    ): ActionRunRequest {
        val metadata = Bundle()
        val message = getMessage(webView)
        if (message != null) {
            metadata.putString(ActionArguments.RICH_PUSH_ID_METADATA, message.id)
        }
        request.setMetadata(metadata)
        return request
    }

    /**
     * @hide
     */
    @SuppressLint("RestrictedApi")
    @CallSuper
    @RestrictTo(RestrictTo.Scope.LIBRARY_GROUP)
    override fun extendJavascriptEnvironment(
        builder: JavaScriptEnvironment.Builder,
        webView: WebView
    ): JavaScriptEnvironment.Builder {
        val message = getMessage(webView)
        val extras = message?.extras?.let { JsonValue.wrapOpt(it).optMap() } ?: JsonMap.EMPTY_MAP
        val formattedSentDate = message?.sentDate?.let { DATE_FORMATTER.format(it) }

        return super.extendJavascriptEnvironment(builder, webView)
            .addGetter("getMessageSentDateMS", message?.sentDate?.time ?: -1)
            .addGetter("getMessageId", message?.id)
            .addGetter("getMessageTitle", message?.title)
            .addGetter("getMessageSentDate", formattedSentDate)
            .addGetter("getUserId", MessageCenter.shared().user.id)
            .addGetter("getMessageExtras", extras)
    }

    /**
     * Helper method to get the RichPushMessage from the web view.
     *
     * @param webView The web view.
     * @return The rich push message, or null if the web view does not have an associated message.
     * @note This method should only be called from the main thread.
     */
    @MainThread
    private fun getMessage(webView: WebView): Message? = runBlocking {
        val url = webView.url
        MessageCenter.shared().inbox.getMessageByUrl(url)
    }

    private companion object {
        private val DATE_FORMATTER = SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSZ", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
    }
}
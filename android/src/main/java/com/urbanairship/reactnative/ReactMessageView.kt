/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.view.ContextThemeWrapper
import android.widget.FrameLayout
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.urbanairship.messagecenter.Message
import com.urbanairship.messagecenter.ui.view.MessageView
import com.urbanairship.messagecenter.ui.view.MessageViewState
import com.urbanairship.messagecenter.ui.view.MessageViewModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.plus

class ReactMessageView(context: Context) : FrameLayout(context), LifecycleEventListener {

    private val viewModel = MessageViewModel()
    private val messageView: MessageView = MessageView(
        ContextThemeWrapper(context, R.style.RNAirshipMessageViewTheme)
    )
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Main.immediate) + SupervisorJob()
    private var currentMessageId: String? = null

    // React Native intercepts requestLayout and doesn't always propagate it to children.
    override fun requestLayout() {
        super.requestLayout()
        post {
            measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
            )
            layout(left, top, right, bottom)
        }
    }

    init {
        addView(messageView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))

        messageView.listener = object : MessageView.Listener {
            override fun onMessageLoaded(message: Message) {
                viewModel.markMessagesRead(message)
                notifyLoadFinished(message.id)
            }

            override fun onMessageLoadError(error: MessageViewState.Error.Type) {
                val messageId = currentMessageId ?: return
                // If the ViewModel is in an error state, the error originated from fetching.
                // Otherwise it came from the WebView itself.
                val (errorStr, retryable) = if (viewModel.states.value is MessageViewState.Error) {
                    when (error) {
                        MessageViewState.Error.Type.LOAD_FAILED -> ERROR_FAILED_TO_FETCH_MESSAGE to true
                        MessageViewState.Error.Type.UNAVAILABLE -> ERROR_MESSAGE_NOT_AVAILABLE to false
                    }
                } else {
                    ERROR_MESSAGE_LOAD_FAILED to false
                }
                notifyLoadError(messageId, errorStr, retryable)
            }

            override fun onRetryClicked() {
                currentMessageId?.let { viewModel.loadMessage(it) }
            }

            override fun onCloseMessage() {
                currentMessageId?.let { notifyClose(it) }
            }
        }

        scope.launch {
            viewModel.states.collect { state ->
                messageView.render(state)
                if (state is MessageViewState.Loading) {
                    currentMessageId?.let { notifyLoadStarted(it) }
                }
            }
        }
    }

    fun loadMessage(messageId: String) {
        currentMessageId = messageId
        viewModel.loadMessage(messageId)
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
        messageView.resumeWebView()
    }

    override fun onHostPause() {
        messageView.pauseWebView()
    }

    override fun onHostDestroy() {
        cleanup()
    }

    fun cleanup() {
        scope.cancel()
        viewModel.clearMessage()
    }

    companion object {
        const val EVENT_LOAD_STARTED = "topAirshipMessageViewLoadStarted"
        const val EVENT_LOAD_FINISHED = "topAirshipMessageViewLoadFinished"
        const val EVENT_LOAD_ERROR = "topAirshipMessageViewLoadError"
        const val EVENT_CLOSE = "topAirshipMessageViewClose"

        const val EVENT_LOAD_STARTED_HANDLER_NAME = "onLoadStarted"
        const val EVENT_LOAD_FINISHED_HANDLER_NAME = "onLoadFinished"
        const val EVENT_LOAD_ERROR_HANDLER_NAME = "onLoadError"
        const val EVENT_CLOSE_HANDLER_NAME = "onClose"

        private const val MESSAGE_ID_KEY = "messageId"
        private const val RETRYABLE_KEY = "retryable"
        private const val ERROR_KEY = "error"

        private const val ERROR_MESSAGE_NOT_AVAILABLE = "MESSAGE_NOT_AVAILABLE"
        private const val ERROR_FAILED_TO_FETCH_MESSAGE = "FAILED_TO_FETCH_MESSAGE"
        private const val ERROR_MESSAGE_LOAD_FAILED = "MESSAGE_LOAD_FAILED"
    }
}

/* Copyright Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.urbanairship.Cancelable;
import com.urbanairship.UAirship;
import com.urbanairship.richpush.RichPushInbox;
import com.urbanairship.richpush.RichPushMessage;
import com.urbanairship.widget.UAWebView;
import com.urbanairship.widget.UAWebViewClient;

public class ReactMessageView extends FrameLayout implements LifecycleEventListener {

    static final String EVENT_LOAD_STARTED = "onLoadStarted";
    static final String EVENT_LOAD_FINISHED = "onLoadFinished";
    static final String EVENT_LOAD_ERROR = "onLoadError";
    static final String EVENT_CLOSE = "onClose";

    private static final String MESSAGE_ID_KEY = "messageId";
    private static final String RETRYABLE_KEY = "retryable";
    private static final String ERROR_KEY = "error";

    private static final String ERROR_MESSAGE_NOT_AVAILABLE = "MESSAGE_NOT_AVAILABLE";
    private static final String ERROR_FAILED_TO_FETCH_MESSAGE = "FAILED_TO_FETCH_MESSAGE";
    private static final String ERROR_MESSAGE_LOAD_FAILED = "MESSAGE_LOAD_FAILED";

    private RichPushMessage message;
    private Cancelable fetchMessageRequest;
    private UAWebView webView;

    private WebViewClient webViewClient = new UAWebViewClient() {
        private Integer error = null;

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);

            if (message == null) {
                return;
            }

            if (error != null) {
                notifyLoadError(message.getMessageId(), ERROR_MESSAGE_LOAD_FAILED, false);
                return;
            }

            message.markRead();
            notifyLoadFinished(message.getMessageId());
        }

        @Override
        public void onReceivedError(WebView view, int errorCode, String description, @Nullable String failingUrl) {
            super.onReceivedError(view, errorCode, description, failingUrl);

            if (message != null && failingUrl != null && failingUrl.equals(message.getMessageBodyUrl())) {
                error = errorCode;
            }
        }

        @Override
        public void onClose(@NonNull WebView webView) {
            if (message != null) {
                notifyClose(message.getMessageId());
            }
        }
    };

    public ReactMessageView(@NonNull Context context) {
        super(context);
    }

    public void loadMessage(final String messageId) {
        if (webView == null) {
            webView = new UAWebView(getContext());
            webView.setWebViewClient(webViewClient);
            addView(webView);
        }

        if (fetchMessageRequest != null) {
            fetchMessageRequest.cancel();
        }
        this.message = null;
        startLoading(messageId);
    }

    void startLoading(final String messageId) {
        notifyLoadStarted(messageId);

        this.message = UAirship.shared().getInbox().getMessage(messageId);
        if (this.message == null) {
            fetchMessageRequest = UAirship.shared().getInbox().fetchMessages(new RichPushInbox.FetchMessagesCallback() {
                @Override
                public void onFinished(boolean success) {
                    RichPushMessage message = UAirship.shared().getInbox().getMessage(messageId);
                    if (!success) {
                        notifyLoadError(messageId, ERROR_FAILED_TO_FETCH_MESSAGE, true);
                        return;
                    } else if (message == null || message.isExpired()) {
                        notifyLoadError(messageId, ERROR_MESSAGE_NOT_AVAILABLE, false);
                        return;
                    }
                    webView.loadRichPushMessage(message);
                }
            });
        } else {
            if (this.message.isExpired()) {
                notifyLoadError(messageId, ERROR_MESSAGE_NOT_AVAILABLE, false);
                return;
            }
            webView.loadRichPushMessage(this.message);
        }
    }

    private void notifyLoadError(String messageId, String error, boolean retryable) {
        WritableMap event = Arguments.createMap();
        event.putString(MESSAGE_ID_KEY, messageId);
        event.putBoolean(RETRYABLE_KEY, retryable);
        event.putString(ERROR_KEY, error);
        notify(EVENT_LOAD_ERROR, event);
    }

    private void notifyLoadFinished(String messageId) {
        WritableMap event = Arguments.createMap();
        event.putString(MESSAGE_ID_KEY, messageId);
        notify(EVENT_LOAD_FINISHED, event);
    }

    private void notifyLoadStarted(String messageId) {
        WritableMap event = Arguments.createMap();
        event.putString(MESSAGE_ID_KEY, messageId);
        notify(EVENT_LOAD_STARTED, event);
    }

    private void notifyClose(String messageId) {
        WritableMap event = Arguments.createMap();
        event.putString(MESSAGE_ID_KEY, messageId);
        notify(EVENT_CLOSE, event);
    }

    private void notify(String eventName, WritableMap event) {
        ReactContext reactContext = (ReactContext) getContext();
        reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(
                getId(),
                eventName,
                event);
    }

    @Override
    public void onHostResume() {
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    public void onHostPause() {
        if (webView != null) {
            webView.onPause();
        }
    }

    @Override
    public void onHostDestroy() {
        cleanup();
    }

    public void cleanup() {
        if (webView != null) {
            webView.setWebViewClient(null);
            webView.destroy();
            webView = null;
        }
    }
}

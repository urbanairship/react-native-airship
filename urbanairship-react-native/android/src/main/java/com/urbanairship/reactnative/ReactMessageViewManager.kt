/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class ReactMessageViewManager : SimpleViewManager<ReactMessageView?>() {

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactMessageView {
        val messageView = ReactMessageView(reactContext)
        reactContext.addLifecycleEventListener(messageView)
        return messageView
    }

    override fun onDropViewInstance(messageView: ReactMessageView) {
        super.onDropViewInstance(messageView)
        (messageView.context as ThemedReactContext).removeLifecycleEventListener(messageView)
        messageView.cleanup()
    }

    @ReactProp(name = "messageId")
    fun setMessageId(view: ReactMessageView, messageId: String?) {
        messageId?.let {
            view.loadMessage(it)
        }
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        val events = listOf(
            ReactMessageView.EVENT_CLOSE,
            ReactMessageView.EVENT_LOAD_ERROR,
            ReactMessageView.EVENT_LOAD_FINISHED,
            ReactMessageView.EVENT_LOAD_STARTED
        )

        val builder = MapBuilder.builder<String, Any>()

        for (event in events) {
            builder.put(
                event,
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", event)
                )
            )
        }
        return builder.build()
    }

    companion object {
        const val REACT_CLASS = "UARCTMessageView"
    }
}
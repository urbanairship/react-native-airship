/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNAirshipMessageViewManagerInterface
import com.facebook.react.bridge.ReadableArray

class ReactMessageViewManager : SimpleViewManager<ReactMessageView>(),
    RNAirshipMessageViewManagerInterface<ReactMessageView> {

    private val delegate = object : ViewManagerDelegate<ReactMessageView> {

        override fun setProperty(view: ReactMessageView, propName: String, value: Any?) {
            when (propName) {
                "messageId" -> setMessageId(view, value as? String)
                else -> {}
            }
        }

        override fun receiveCommand(
            view: ReactMessageView,
            commandName: String,
            args: ReadableArray
        ) {
            // No commands supported
        }
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ReactMessageView> {
        return delegate
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
    override fun setMessageId(view: ReactMessageView, messageId: String?) {
        messageId?.let {
            view.loadMessage(it)
        }
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        val events = listOf(
                ReactMessageView.EVENT_CLOSE_REGISTRATION_NAME to ReactMessageView.EVENT_CLOSE_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_ERROR_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_ERROR_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_FINISHED_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_FINISHED_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_STARTED_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_STARTED_HANDLER_NAME
            )

        val builder = MapBuilder.builder<String, Any>()

        for ((name, handlerName) in events) {
            builder.put(
                name,
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", handlerName)
                )
            )
        }

        return builder.build()
    }

    companion object {
        const val REACT_CLASS = "RNAirshipMessageView"
    }
}

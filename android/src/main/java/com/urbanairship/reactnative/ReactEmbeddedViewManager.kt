/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNAirshipEmbeddedViewManagerInterface

class ReactEmbeddedViewManager : SimpleViewManager<ReactEmbeddedView>(),
    RNAirshipEmbeddedViewManagerInterface<ReactEmbeddedView> {

    private val manualDelegate = object : ViewManagerDelegate<ReactEmbeddedView> {

        @Suppress("ACCIDENTAL_OVERRIDE")
        override fun setProperty(view: ReactEmbeddedView, propName: String, value: Any?) {
            when (propName) {
                "config" -> setConfig(view, value as? String)
                "sizeToContent" -> setSizeToContent(view, value as? Boolean ?: false)
                else -> {}
            }
        }

        @Suppress("ACCIDENTAL_OVERRIDE")
        override fun receiveCommand(
            view: ReactEmbeddedView,
            commandName: String,
            args: ReadableArray
        ) {
            // No commands supported
        }
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ReactEmbeddedView> {
        return manualDelegate
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactEmbeddedView {
        return ReactEmbeddedView(reactContext)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
        return mutableMapOf(
            ReactEmbeddedView.EVENT_SIZE_CHANGE to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to "onSizeChange",
                    "captured" to "onSizeChangeCapture"
                )
            )
        )
    }

    @ReactProp(name = "config")
    override fun setConfig(view: ReactEmbeddedView, config: String?) {
        view.setConfig(config)
    }

    @ReactProp(name = "sizeToContent")
    override fun setSizeToContent(view: ReactEmbeddedView, sizeToContent: Boolean) {
        view.setSizeToContent(sizeToContent)
    }

    companion object {
        const val REACT_CLASS = "RNAirshipEmbeddedView"
    }
}

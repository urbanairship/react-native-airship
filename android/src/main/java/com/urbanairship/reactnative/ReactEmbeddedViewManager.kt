/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RTNAirshipEmbeddedViewManagerInterface

class ReactEmbeddedViewManager : SimpleViewManager<ReactEmbeddedView>(),
    RTNAirshipEmbeddedViewManagerInterface<ReactEmbeddedView> {

    private val manualDelegate = object : ViewManagerDelegate<ReactEmbeddedView?> {

        override fun setProperty(view: ReactEmbeddedView?, propName: String?, value: Any?) {
            if (view == null || propName == null) return

            when (propName) {
                "embeddedId" -> setEmbeddedId(view, value as? String)
                else -> {
                    
                }
            }
        }

        override fun receiveCommand(view: ReactEmbeddedView?, commandName: String?, args: com.facebook.react.bridge.ReadableArray?) {
            // No commands supported — add if you need any
        }
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ReactEmbeddedView?> {
        return manualDelegate
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactEmbeddedView {
        return ReactEmbeddedView(reactContext)
    }

    @ReactProp(name = "embeddedId")
    override fun setEmbeddedId(view: ReactEmbeddedView, embeddedId: String?) {
        embeddedId?.let {
            view.load(it)
        }
    }

    companion object {
        const val REACT_CLASS = "RTNAirshipEmbeddedView"
    }
}
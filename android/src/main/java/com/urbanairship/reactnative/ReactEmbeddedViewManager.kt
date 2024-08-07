/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RTNAirshipEmbeddedViewManagerDelegate
import com.facebook.react.viewmanagers.RTNAirshipEmbeddedViewManagerInterface


class ReactEmbeddedViewManager : SimpleViewManager<ReactEmbeddedView>(),
    RTNAirshipEmbeddedViewManagerInterface<ReactEmbeddedView> {

    private val delegate = RTNAirshipEmbeddedViewManagerDelegate(this)

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ReactEmbeddedView?> {
        return delegate
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
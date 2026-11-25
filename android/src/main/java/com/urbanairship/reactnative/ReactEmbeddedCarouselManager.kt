/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNAirshipEmbeddedCarouselManagerInterface

class ReactEmbeddedCarouselManager : SimpleViewManager<ReactEmbeddedCarousel>(),
    RNAirshipEmbeddedCarouselManagerInterface<ReactEmbeddedCarousel> {

    private val manualDelegate = object : ViewManagerDelegate<ReactEmbeddedCarousel> {

        @Suppress("ACCIDENTAL_OVERRIDE")
        override fun setProperty(view: ReactEmbeddedCarousel, propName: String, value: Any?) {
            when (propName) {
                "config" -> setConfig(view, value as? String)
                "page" -> setPage(view, (value as? Number)?.toInt() ?: -1)
                else -> {}
            }
        }

        @Suppress("ACCIDENTAL_OVERRIDE")
        override fun receiveCommand(
            view: ReactEmbeddedCarousel,
            commandName: String,
            args: ReadableArray
        ) {
            // No commands supported
        }
    }

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ReactEmbeddedCarousel> {
        return manualDelegate
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactEmbeddedCarousel {
        return ReactEmbeddedCarousel(reactContext)
    }

    @ReactProp(name = "config")
    override fun setConfig(view: ReactEmbeddedCarousel, config: String?) {
        view.setConfig(config)
    }

    @ReactProp(name = "page", defaultInt = -1)
    override fun setPage(view: ReactEmbeddedCarousel, page: Int) {
        view.setPage(page)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return mapOf(
            ReactEmbeddedCarousel.EVENT_STATE_CHANGE to mapOf(
                "phasedRegistrationNames" to mapOf(
                    "bubbled" to ReactEmbeddedCarousel.EVENT_STATE_CHANGE_HANDLER_NAME
                )
            )
        )
    }

    companion object {
        const val REACT_CLASS = "RNAirshipEmbeddedCarousel"
    }
}

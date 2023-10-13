/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.fragment.app.FragmentContainerView
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RTNAirshipPreferenceCenterViewManagerDelegate
import com.facebook.react.viewmanagers.RTNAirshipPreferenceCenterViewManagerInterface

class ReactPreferenceCenterViewManager() : ViewGroupManager<ViewGroup>(), RTNAirshipPreferenceCenterViewManagerInterface<ViewGroup> {

    private val delegate = RTNAirshipPreferenceCenterViewManagerDelegate(this)

    override fun getName(): String {
        return REACT_CLASS
    }

    override fun getDelegate(): ViewManagerDelegate<ViewGroup?> {
        return delegate
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ViewGroup {
        val inflater = LayoutInflater.from(reactContext)
        return inflater.inflate(R.layout.ua_preference_center_fragment_root, null) as ViewGroup
    }

    @ReactProp(name = "preferenceCenterId")
    override fun setPreferenceCenterId(view: ViewGroup, preferenceCenterId: String?) {
        val container = view.findViewWithTag<FragmentContainerView>("preferences")
        val fragment = container.getFragment<PreferenceCenterFragmentWrapper?>()
        fragment?.setPreferenceCenterId(preferenceCenterId)
    }

    companion object {
        const val REACT_CLASS = "RTNAirshipPreferenceCenterView"
    }
}
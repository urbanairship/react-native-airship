/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import androidx.core.view.doOnAttach
import com.facebook.react.bridge.LifecycleEventListener
import com.urbanairship.embedded.AirshipEmbeddedView

class ReactEmbeddedView(context: Context) : FrameLayout(context), LifecycleEventListener {

    var isLoaded = false

    fun load(embeddedId: String) {
        if (isLoaded) {
            return
        }
        isLoaded = true
        val view = AirshipEmbeddedView(context, embeddedId)
        view.setBackgroundColor(Color.RED)
        addView(view)
        requestLayout()
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        requestLayout()
    }

    override fun onHostResume() {
        requestLayout()
    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {
    }
}
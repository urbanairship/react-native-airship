/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.widget.FrameLayout
import com.facebook.react.bridge.LifecycleEventListener
import com.urbanairship.embedded.AirshipEmbeddedView

class ReactEmbeddedView(context: Context) : FrameLayout(context), LifecycleEventListener {

    var embeddedId: String? = null

    fun load(embeddedId: String) {
        if (embeddedId == this.embeddedId) {
            return
        }

        removeAllViews()
        this.embeddedId = embeddedId
        addView(AirshipEmbeddedView(context, embeddedId))
    }

    override fun onHostResume() {

    }

    override fun onHostPause() {

    }

    override fun onHostDestroy() {
        removeAllViews()
    }
}
/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.graphics.Color
import android.view.View
import android.widget.FrameLayout
import androidx.core.view.doOnAttach
import com.facebook.react.bridge.LifecycleEventListener
import com.urbanairship.embedded.AirshipEmbeddedView

class ReactEmbeddedView(context: Context) : FrameLayout(context) {

    private var embeddedId: String? = null

    fun load(embeddedId: String) {
        if (this.embeddedId == embeddedId) {
            return
        }

        removeAllViews()
        this.embeddedId = embeddedId
        addView(AirshipEmbeddedView(context, embeddedId))
    }

    override fun requestLayout() {
        super.requestLayout()

        // This view relies on a measure + layout pass happening after it calls requestLayout().
        // https://github.com/facebook/react-native/issues/4990#issuecomment-180415510
        // https://stackoverflow.com/questions/39836356/react-native-resize-custom-ui-component
        post(measureAndLayout)
    }

    private val measureAndLayout = Runnable {
        measure(MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY))
        layout(left, top, right, bottom)
    }
}
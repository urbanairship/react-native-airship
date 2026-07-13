/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.widget.FrameLayout
import com.urbanairship.embedded.AirshipEmbeddedSelection
import com.urbanairship.embedded.AirshipEmbeddedView

class ReactEmbeddedView(context: Context) : FrameLayout(context) {

    private var embeddedId: String? = null
    private var selectionType: String? = null
    private var selectionInstanceId: String? = null
    private var rendered: Triple<String?, String?, String?>? = null

    fun load(embeddedId: String) {
        this.embeddedId = embeddedId
        rebuild()
    }

    fun setSelectionType(selectionType: String?) {
        this.selectionType = selectionType
        rebuild()
    }

    fun setSelectionInstanceId(selectionInstanceId: String?) {
        this.selectionInstanceId = selectionInstanceId
        rebuild()
    }

    private fun rebuild() {
        val embeddedId = this.embeddedId ?: return
        val current = Triple(embeddedId, selectionType, selectionInstanceId)
        if (current == rendered) {
            return
        }
        rendered = current

        val selectionInstanceId = this.selectionInstanceId
        val selection = if (selectionType == "instance_id" && selectionInstanceId != null) {
            AirshipEmbeddedSelection.ByInstanceId(selectionInstanceId)
        } else {
            AirshipEmbeddedSelection.Priority
        }

        removeAllViews()
        addView(AirshipEmbeddedView(context, embeddedId, selection = selection))
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
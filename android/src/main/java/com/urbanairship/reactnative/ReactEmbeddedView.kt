/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.widget.FrameLayout
import com.urbanairship.embedded.AirshipEmbeddedSelection
import com.urbanairship.embedded.AirshipEmbeddedView
import com.urbanairship.json.JsonException
import com.urbanairship.json.JsonValue

class ReactEmbeddedView(context: Context) : FrameLayout(context) {

    private var renderedConfig: String? = null

    fun setConfig(config: String?) {
        if (config == null || config == renderedConfig) {
            return
        }
        renderedConfig = config

        val json = try {
            JsonValue.parseString(config).optMap()
        } catch (e: JsonException) {
            return
        }

        val embeddedId = json.opt("embeddedId").optString()
        if (embeddedId.isEmpty()) {
            return
        }

        val selectionJson = json.opt("selection").optMap()
        val selection = if (selectionJson.opt("type").optString() == "instance_id") {
            AirshipEmbeddedSelection.ByInstanceId(selectionJson.opt("instanceId").optString())
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

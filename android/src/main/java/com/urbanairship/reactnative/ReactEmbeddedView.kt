/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ScrollView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.urbanairship.embedded.AirshipEmbeddedSelection
import com.urbanairship.embedded.AirshipEmbeddedView
import com.urbanairship.json.JsonException
import com.urbanairship.json.JsonValue
import kotlin.math.abs

class ReactEmbeddedView(context: Context) : FrameLayout(context) {

    private var renderedConfig: String? = null
    private var sizeToContent: Boolean = false
    private var embeddedView: AirshipEmbeddedView? = null
    private val density: Float = context.resources.displayMetrics.density

    /** Last height handed to JS, in dp. Negative means nothing reported yet. */
    private var reportedHeight: Double = -1.0

    private val layoutChangeListener =
        View.OnLayoutChangeListener { view, _, _, _, _, _, _, _, _ ->
            reportContentHeight(view.measuredHeight / density.toDouble())
        }

    // The SDK view holds the rendered content as its children, so an empty one
    // means nothing is pending rather than content that measured small.
    private val hierarchyChangeListener = object : ViewGroup.OnHierarchyChangeListener {
        override fun onChildViewAdded(parent: View?, child: View?) = Unit

        override fun onChildViewRemoved(parent: View?, child: View?) {
            if ((parent as? ViewGroup)?.childCount == 0) {
                reportContentGone()
            }
        }
    }

    /** Records whether the view measures its own content rather than filling its box. */
    fun setSizeToContent(value: Boolean) {
        if (sizeToContent == value) {
            return
        }
        sizeToContent = value
        // The next report measures a different container, so it is not a duplicate.
        reportedHeight = -1.0
        embeddedView?.let { applyContainer(it) }
    }

    fun setConfig(config: String?) {
        if (config == null || config == renderedConfig) {
            return
        }

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
        val instanceId = selectionJson.opt("instanceId").optString()
        val selection = if (selectionJson.opt("type").optString() == "instance_id" && instanceId.isNotEmpty()) {
            AirshipEmbeddedSelection.ByInstanceId(instanceId)
        } else {
            AirshipEmbeddedSelection.Priority
        }

        renderedConfig = config
        reportedHeight = -1.0
        applyContainer(AirshipEmbeddedView(context, embeddedId, selection = selection))
    }

    /**
     * Rebuilds the hierarchy for the current sizing mode.
     *
     * Self sizing hosts the content in a scroll view so it measures against an
     * unconstrained height, and supplies the display height as the parent so percent
     * placements have something to resolve against. Fixed sizing resolves percentages
     * against the box React Native assigned instead, so it states no parent at all.
     *
     * @param view the embedded view to host; replaces any view already shown.
     */
    private fun applyContainer(view: AirshipEmbeddedView) {
        embeddedView?.removeOnLayoutChangeListener(layoutChangeListener)
        embeddedView?.setOnHierarchyChangeListener(null)
        (view.parent as? ViewGroup)?.removeView(view)
        removeAllViews()

        embeddedView = view
        view.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            if (sizeToContent) LayoutParams.WRAP_CONTENT else LayoutParams.MATCH_PARENT
        )

        if (sizeToContent) {
            view.parentHeightProvider = { context.resources.displayMetrics.heightPixels }
            view.addOnLayoutChangeListener(layoutChangeListener)
            view.setOnHierarchyChangeListener(hierarchyChangeListener)

            val scrollView = ScrollView(context).apply {
                isVerticalScrollBarEnabled = false
                layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            }
            scrollView.addView(view)
            addView(scrollView)
        } else {
            view.parentHeightProvider = null
            addView(view)
        }
    }

    /**
     * Reports that there is no content, clearing any height already handed over.
     *
     * Zero bypasses the measurement floor: it is an availability signal, not a
     * measurement, and the floor exists only to absorb transient layout zeros.
     */
    private fun reportContentGone() {
        if (reportedHeight == 0.0) {
            return
        }
        reportedHeight = 0.0

        val reactContext = context as? ReactContext ?: return
        val event = Arguments.createMap().apply { putDouble("height", 0.0) }
        reactContext.airshipDispatchEvent(id, EVENT_SIZE_CHANGE, event)
    }

    private fun reportContentHeight(height: Double) {
        // A height at or below the floor means the content could not resolve one, not
        // that it is empty; hold the last real value rather than collapsing the view.
        if (height <= MIN_CONTENT_HEIGHT) {
            return
        }
        if (abs(height - reportedHeight) <= HEIGHT_EPSILON) {
            return
        }
        reportedHeight = height

        val reactContext = context as? ReactContext ?: return
        val event = Arguments.createMap().apply { putDouble("height", height) }
        reactContext.airshipDispatchEvent(id, EVENT_SIZE_CHANGE, event)
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

    companion object {
        const val EVENT_SIZE_CHANGE = "topAirshipEmbeddedViewSizeChange"
        private const val MIN_CONTENT_HEIGHT = 1.0
        private const val HEIGHT_EPSILON = 0.5
    }
}

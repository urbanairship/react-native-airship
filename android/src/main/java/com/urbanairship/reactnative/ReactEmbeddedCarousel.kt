/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.widget.FrameLayout
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.ComposeView
import androidx.compose.ui.platform.ViewCompositionStrategy
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.urbanairship.automation.compose.AirshipEmbeddedCarousel
import com.urbanairship.automation.compose.AirshipEmbeddedCarouselDefaults
import com.urbanairship.automation.compose.rememberAirshipEmbeddedCarouselState
import com.urbanairship.embedded.AirshipEmbeddedSelection
import com.urbanairship.json.JsonException
import com.urbanairship.json.JsonValue
import kotlinx.coroutines.flow.distinctUntilChanged

class ReactEmbeddedCarousel(context: Context) : FrameLayout(context) {

    private data class Config(val embeddedId: String, val selection: AirshipEmbeddedSelection)

    private var renderedConfig: String? = null
    private var config by mutableStateOf<Config?>(null)
    private var requestedPage by mutableIntStateOf(-1)

    private val composeView = ComposeView(context).apply {
        setViewCompositionStrategy(ViewCompositionStrategy.DisposeOnDetachedFromWindowOrReleasedFromPool)
        setContent {
            val current = config ?: return@setContent
            val state = rememberAirshipEmbeddedCarouselState(current.embeddedId, current.selection)

            // Navigate when JS requests a new page. A request made before any
            // content is available is held until pages exist.
            LaunchedEffect(state) {
                var lastRequested = -1
                var pending: Int? = null
                snapshotFlow { requestedPage to state.pageCount }.collect { (requested, count) ->
                    if (requested != lastRequested) {
                        lastRequested = requested
                        pending = requested.takeIf { it >= 0 }
                    }
                    val target = pending
                    if (target != null && count > 0) {
                        pending = null
                        val page = minOf(target, count - 1)
                        if (page != state.pagerState.currentPage) {
                            state.pagerState.animateScrollToPage(page)
                        }
                    }
                }
            }

            // Report page state to JS.
            LaunchedEffect(state) {
                snapshotFlow {
                    val count = state.pageCount
                    Triple(if (count > 0) state.currentPage else 0, count, state.isAvailable)
                }.distinctUntilChanged().collect { (page, count, available) ->
                    notifyState(page, count, available)
                }
            }

            AirshipEmbeddedCarousel(
                state = state,
                modifier = Modifier,
                indicator = AirshipEmbeddedCarouselDefaults.dotsIndicator,
                previousArrow = AirshipEmbeddedCarouselDefaults.previousArrow(),
                nextArrow = AirshipEmbeddedCarouselDefaults.nextArrow(),
            )
        }
    }

    init {
        addView(composeView)
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
        this.config = Config(embeddedId, selection)
    }

    fun setPage(page: Int) {
        requestedPage = page
    }

    private fun notifyState(currentPage: Int, pageCount: Int, isAvailable: Boolean) {
        val event = Arguments.createMap()
        event.putInt(CURRENT_PAGE_KEY, currentPage)
        event.putInt(PAGE_COUNT_KEY, pageCount)
        event.putBoolean(IS_AVAILABLE_KEY, isAvailable)
        (context as ReactContext).airshipDispatchEvent(id, EVENT_STATE_CHANGE, event)
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
        const val EVENT_STATE_CHANGE = "topAirshipEmbeddedCarouselStateChange"
        const val EVENT_STATE_CHANGE_HANDLER_NAME = "onStateChange"

        private const val CURRENT_PAGE_KEY = "currentPage"
        private const val PAGE_COUNT_KEY = "pageCount"
        private const val IS_AVAILABLE_KEY = "isAvailable"
    }
}

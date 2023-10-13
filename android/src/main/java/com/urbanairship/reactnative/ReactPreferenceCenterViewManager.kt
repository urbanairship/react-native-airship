/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.view.Choreographer
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.fragment.app.FragmentActivity
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.uimanager.annotations.ReactPropGroup

import com.facebook.react.viewmanagers.RTNAirshipPreferenceCenterViewManagerDelegate
import com.facebook.react.viewmanagers.RTNAirshipPreferenceCenterViewManagerInterface
import com.urbanairship.preferencecenter.ui.PreferenceCenterFragment

class ReactPreferenceCenterViewManager(
    private val reactContext: ReactApplicationContext
) : ViewGroupManager<FrameLayout>()/*, RTNAirshipPreferenceCenterViewManagerInterface<ReactPreferenceCenterView>*/ {
    private var propWidth: Int? = null
    private var propHeight: Int? = null

    //private val delegate = RTNAirshipPreferenceCenterViewManagerDelegate(this)

    override fun getName(): String {
        return REACT_CLASS
    }

//    override fun getDelegate(): ViewManagerDelegate<ReactPreferenceCenterView?> {
//        return delegate
//    }

    override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
        //val preferenceCenterView = ReactPreferenceCenterView(reactContext)
        //reactContext.addLifecycleEventListener(preferenceCenterView)
        //return preferenceCenterView

        return FrameLayout(reactContext)
    }

    /**
     * Map the "create" command to an integer
     */
    override fun getCommandsMap() = mapOf("create" to COMMAND_CREATE)

    /**
     * Handle "create" command (called from JS) and call createFragment method
     */
    override fun receiveCommand(
        root: FrameLayout,
        commandId: String,
        args: ReadableArray?
    ) {
        super.receiveCommand(root, commandId, args)
        val reactNativeViewId = requireNotNull(args).getInt(0)

        when (commandId.toInt()) {
            COMMAND_CREATE -> createFragment(root, reactNativeViewId)
        }
    }

    @ReactPropGroup(names = ["width", "height"], customType = "Style")
    fun setStyle(view: FrameLayout, index: Int, value: Int) {
        if (index == 0) propWidth = value
        if (index == 1) propHeight = value
    }

    /**
     * Replace your React Native view with a custom fragment
     */
    fun createFragment(root: FrameLayout, reactNativeViewId: Int) {
        val parentView = root.findViewById<ViewGroup>(reactNativeViewId)
        setupLayout(parentView)

        val myFragment = PreferenceCenterFragmentWrapper()//PreferenceCenterFragment.create("neat")
        val activity = reactContext.currentActivity as FragmentActivity
        activity.supportFragmentManager
            .beginTransaction()
            .replace(reactNativeViewId, myFragment, reactNativeViewId.toString())
            .commit()
    }

    fun setupLayout(view: View) {
        Choreographer.getInstance().postFrameCallback(object: Choreographer.FrameCallback {
            override fun doFrame(frameTimeNanos: Long) {
                manuallyLayoutChildren(view)
                view.viewTreeObserver.dispatchOnGlobalLayout()
                Choreographer.getInstance().postFrameCallback(this)
            }
        })
    }

    /**
     * Layout all children properly
     */
    private fun manuallyLayoutChildren(view: View) {
        // propWidth and propHeight coming from react-native props
        val width = requireNotNull(propWidth)
        val height = requireNotNull(propHeight)

        view.measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY))

        view.layout(0, 0, width, height)
    }

//    override fun onDropViewInstance(preferenceCenterView: ReactPreferenceCenterView) {
//        super.onDropViewInstance(preferenceCenterView)
//        //(preferenceCenterView.context as ThemedReactContext).removeLifecycleEventListener(preferenceCenterView)
//    }
//
//    @ReactProp(name = "preferenceCenterId")
//    override fun setPreferenceCenterId(view: ReactPreferenceCenterView, preferenceCenterId: String?) {
//        preferenceCenterId?.let {
//            //view.loadPreferenceCenter(view, it)
//        }
//    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        val events = if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            listOf(
                ReactMessageView.EVENT_CLOSE_REGISTRATION_NAME to ReactMessageView.EVENT_CLOSE_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_ERROR_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_ERROR_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_FINISHED_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_FINISHED_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_STARTED_REGISTRATION_NAME to ReactMessageView.EVENT_LOAD_STARTED_HANDLER_NAME
            )
        } else {
            listOf(
                ReactMessageView.EVENT_CLOSE_HANDLER_NAME to ReactMessageView.EVENT_CLOSE_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_ERROR_HANDLER_NAME to ReactMessageView.EVENT_LOAD_ERROR_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_FINISHED_HANDLER_NAME to ReactMessageView.EVENT_LOAD_FINISHED_HANDLER_NAME,
                ReactMessageView.EVENT_LOAD_STARTED_HANDLER_NAME to ReactMessageView.EVENT_LOAD_STARTED_HANDLER_NAME
            )
        }

        val builder = MapBuilder.builder<String, Any>()

        for ((name, handlerName) in events) {
            builder.put(
                name,
                MapBuilder.of(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", handlerName)
                )
            )
        }

        return builder.build()
    }

    companion object {
        const val REACT_CLASS = "ReactPreferenceCenterViewManager"
        private const val COMMAND_CREATE = 1
    }
}
/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Handler
import android.os.Looper
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.urbanairship.Cancelable
import com.urbanairship.UAirship
import com.urbanairship.messagecenter.Inbox.FetchMessagesCallback
import com.urbanairship.messagecenter.Message
import com.urbanairship.messagecenter.MessageCenter
import com.urbanairship.messagecenter.webkit.MessageWebView
import com.urbanairship.messagecenter.webkit.MessageWebViewClient
import com.urbanairship.preferencecenter.ui.PreferenceCenterFragment
import androidx.fragment.app.FragmentContainerView
import androidx.fragment.app.add
import com.facebook.react.ReactRootView
import com.facebook.react.uimanager.ThemedReactContext

class ReactPreferenceCenterView(context: Context) : FrameLayout(context) {

    init {
        //val inflater = LayoutInflater.from(context)
        //val inflater = (context as ThemedReactContext).getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        //val view = inflater.inflate(R.layout.ua_preference_center_fragment_wrapper, null)

        setPadding(16,16,16,16)
        setBackgroundColor(Color.parseColor("#5FD3F3"))

        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT)

        addView(TextView(context).apply {
            text = "Welcome to Android Fragments with React Native."
        })
    }

    fun loadPreferenceCenter(view: ReactPreferenceCenterView, preferenceCenterId: String) {
        val fragment = PreferenceCenterFragment.create(preferenceCenterId)
        //val f = PreferenceCenterFragmentWrapper()
        //val inflater = LayoutInflater.from(context)
        //val view = inflater.inflate(R.layout.ua_preference_center_fragment_wrapper, null)
        //if (view is FragmentContainerView) {
            if (context is ThemedReactContext) {
                val activity = (context as ThemedReactContext).currentActivity as FragmentActivity
                //activity.supportFragmentManager.beginTransaction().replace(ReactRootView(context).id, fragment, "").commit()
//                when ((context as ThemedReactContext).currentActivity) {
//                    is AppCompatActivity -> (context as AppCompatActivity).supportFragmentManager.beginTransaction().add(fragment, "").commit()
//                    is FragmentActivity -> (context as FragmentActivity).supportFragmentManager.beginTransaction().add(fragment, "").commit()
//                    //is Activity -> (context as Activity).fragmentManager.beginTransaction().add(fragment, "").commit()
//                }
            }

            //addView(view)
        //}

    }

    // private fun notifyLoadError(messageId: String, error: String, retryable: Boolean) {
    //     val event = Arguments.createMap()
    //     event.putString(MESSAGE_ID_KEY, messageId)
    //     event.putBoolean(RETRYABLE_KEY, retryable)
    //     event.putString(ERROR_KEY, error)
    //     notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_ERROR else EVENT_LOAD_ERROR_HANDLER_NAME, event)
    // }

    // private fun notifyLoadFinished(messageId: String) {
    //     val event = Arguments.createMap()
    //     event.putString(MESSAGE_ID_KEY, messageId)
    //     notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_FINISHED else EVENT_LOAD_FINISHED_HANDLER_NAME, event)
    // }

    // private fun notifyLoadStarted(messageId: String) {
    //     val event = Arguments.createMap()
    //     event.putString(MESSAGE_ID_KEY, messageId)
    //     notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_LOAD_STARTED else EVENT_LOAD_STARTED_HANDLER_NAME, event)
    // }

    // private fun notifyClose(messageId: String) {
    //     val event = Arguments.createMap()
    //     event.putString(MESSAGE_ID_KEY, messageId)
    //     notify(if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) EVENT_CLOSE else EVENT_CLOSE_HANDLER_NAME, event)
    // }

    // private fun notify(eventName: String, event: WritableMap) {
    //     val reactContext = context as ReactContext
    //     reactContext.airshipDispatchEvent(id, eventName, event)
    // }

    // companion object {
    //     const val EVENT_LOAD_STARTED_REGISTRATION_NAME = "topLoadStarted"
    //     const val EVENT_LOAD_FINISHED_REGISTRATION_NAME = "topLoadFinished"
    //     const val EVENT_LOAD_ERROR_REGISTRATION_NAME = "topLoadError"
    //     const val EVENT_CLOSE_REGISTRATION_NAME = "topClose"

    //     const val EVENT_LOAD_STARTED_HANDLER_NAME = "onLoadStarted"
    //     const val EVENT_LOAD_FINISHED_HANDLER_NAME = "onLoadFinished"
    //     const val EVENT_LOAD_ERROR_HANDLER_NAME = "onLoadError"
    //     const val EVENT_CLOSE_HANDLER_NAME = "onClose"

    //     const val EVENT_LOAD_STARTED = "loadStarted"
    //     const val EVENT_LOAD_FINISHED = "loadFinished"
    //     const val EVENT_LOAD_ERROR = "loadError"
    //     const val EVENT_CLOSE = "close"

    //     private const val MESSAGE_ID_KEY = "messageId"
    //     private const val RETRYABLE_KEY = "retryable"
    //     private const val ERROR_KEY = "error"

    //     private const val ERROR_MESSAGE_NOT_AVAILABLE = "MESSAGE_NOT_AVAILABLE"
    //     private const val ERROR_FAILED_TO_FETCH_MESSAGE = "FAILED_TO_FETCH_MESSAGE"
    //     private const val ERROR_MESSAGE_LOAD_FAILED = "MESSAGE_LOAD_FAILED"
    // }
}
/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity
import com.facebook.react.uimanager.ThemedReactContext
import com.urbanairship.preferencecenter.ui.PreferenceCenterFragment

class ReactPreferenceCenterView(context: Context) : FrameLayout(context) {

    private var _preferenceCenterId: String? = null

    fun setPreferenceCenterId(preferenceCenterId: String?) {
        if (this._preferenceCenterId == preferenceCenterId) {
            return
        }

        this._preferenceCenterId = preferenceCenterId
        if (isAttachedToWindow) {
            attachFragment()
        }
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        attachFragment()
    }

    private val fragmentTag = "airship_preference_center-$id"

    private fun attachFragment() {
        val fragmentManager = ((context as ThemedReactContext).currentActivity as AppCompatActivity).supportFragmentManager
        val transaction = fragmentManager.beginTransaction()
        fragmentManager.findFragmentByTag(fragmentTag)?.let {
            transaction.remove(it)
        }

        _preferenceCenterId?.let {
            val fragment = PreferenceCenterFragment.create(it)
            transaction.add(id, fragment, fragmentTag)
        }

        transaction.commitAllowingStateLoss()
    }
}
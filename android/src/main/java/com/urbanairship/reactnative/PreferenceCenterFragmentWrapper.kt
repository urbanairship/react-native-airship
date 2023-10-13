/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.urbanairship.preferencecenter.ui.PreferenceCenterFragment


class PreferenceCenterFragmentWrapper : Fragment() {

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        return inflater.inflate(R.layout.ua_preference_center_fragment_wrapper, container, false)
    }

    fun setPreferenceCenterId(preferenceCenterId: String?) {
        val fragmentTransaction = childFragmentManager.beginTransaction()
        childFragmentManager.fragments.forEach {
            fragmentTransaction.remove(it)
        }

        if (preferenceCenterId != null) {
            val fragment = PreferenceCenterFragment.create(preferenceCenterId)
            fragmentTransaction.add(R.id.ua_preference_center_fragment_wrapper, fragment, null)
        }

        fragmentTransaction.commit()
    }
}
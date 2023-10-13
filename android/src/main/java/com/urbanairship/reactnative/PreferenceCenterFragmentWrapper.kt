/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import com.urbanairship.preferencecenter.ui.PreferenceCenterFragment

class PreferenceCenterFragmentWrapper : Fragment() {
    private lateinit var customView: ReactPreferenceCenterView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        super.onCreateView(inflater, container, savedInstanceState)
        customView = ReactPreferenceCenterView(requireNotNull(context))
        return customView
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

//        childFragmentManager.findFragmentByTag("preference_center_fragment_tag")?.let { fragment ->
//            fragment as PreferenceCenterFragment
//        }

//        view.let {
//
//        }

    }

}
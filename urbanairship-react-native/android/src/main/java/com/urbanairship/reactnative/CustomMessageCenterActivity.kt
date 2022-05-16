/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import com.urbanairship.messagecenter.MessageCenterActivity
import android.os.Bundle
import android.content.Intent

class CustomMessageCenterActivity : MessageCenterActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        intent?.let {
            if (UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER == it.action) {
                finish()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)

        if (UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER == intent.action) {
            finish()
        }
    }
}
/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Intent
import android.os.Bundle
import com.urbanairship.messagecenter.MessageActivity

class CustomMessageActivity : MessageActivity() {

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
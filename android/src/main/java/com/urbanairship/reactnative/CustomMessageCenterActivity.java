/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;
import android.content.Intent;
import android.os.Bundle;

import com.urbanairship.messagecenter.MessageCenterActivity;

public class CustomMessageCenterActivity extends MessageCenterActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getIntent() != null && UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER.equals(getIntent().getAction())) {
            finish();
            return;
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (intent != null && UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER.equals(intent.getAction())) {
            finish();
            return;
        }
    }
}

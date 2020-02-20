/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.urbanairship.messagecenter.MessageCenterActivity;

public class CustomMessageCenterActivity extends MessageCenterActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getIntent() != null && UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER.equals(getIntent().getAction())) {
            finish();
        }
    }

    @Override
    protected void onNewIntent(@NonNull Intent intent) {
        super.onNewIntent(intent);

        if (UrbanAirshipReactModule.CLOSE_MESSAGE_CENTER.equals(intent.getAction())) {
            finish();
        }
    }
}

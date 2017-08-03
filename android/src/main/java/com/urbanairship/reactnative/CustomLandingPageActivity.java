/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.content.Intent;
import android.os.Bundle;

import com.urbanairship.actions.LandingPageActivity;

public class CustomLandingPageActivity extends LandingPageActivity {

    @Override
    public void onPostCreate(Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);

        if (getIntent() != null && "CLOSE".equals(getIntent().getAction())) {
            finish();
        }

    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);

        if (intent != null && "CLOSE".equals(intent.getAction())) {
            finish();
            return;
        }

    }
}
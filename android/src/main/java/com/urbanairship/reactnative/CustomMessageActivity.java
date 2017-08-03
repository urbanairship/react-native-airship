/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;
import android.content.Intent;
import android.os.Bundle;

import com.urbanairship.messagecenter.MessageActivity;

public class CustomMessageActivity extends MessageActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);

        if (getIntent() != null && "CLOSE".equals(getIntent().getAction())){
            CustomMessageActivity.this.finish();
            return;
        }
    }

    @Override
    protected void onNewIntent(Intent intent){
        super.onNewIntent(intent);

        if (intent != null && "CLOSE".equals(intent.getAction())) {
            finish();
            return;
        }
    }

}

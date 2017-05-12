/* Copyright 2017 Urban Airship and Contributors */

package com.urbanairship.reactnative;

import android.support.annotation.NonNull;

import com.urbanairship.Autopilot;
import com.urbanairship.UAirship;
import com.urbanairship.actions.ActionArguments;
import com.urbanairship.actions.ActionResult;
import com.urbanairship.actions.DeepLinkAction;
import com.urbanairship.reactnative.events.DeepLinkEvent;


/**
 * Module's autopilot to customize Urban Airship.
 */
public class ReactAutopilot extends Autopilot {

    @Override
    public void onAirshipReady(UAirship airship) {
        super.onAirshipReady(airship);


        // Modify the deep link action to emit events
        airship.getActionRegistry().getEntry(DeepLinkAction.DEFAULT_REGISTRY_NAME).setDefaultAction(new DeepLinkAction() {
            @Override
            public ActionResult perform(@NonNull ActionArguments arguments) {
                String deepLink = arguments.getValue().getString();
                if (deepLink != null) {
                    Event event = new DeepLinkEvent(deepLink);
                    EventEmitter.shared().sendEvent(UAirship.getApplicationContext(), event);
                }
                return ActionResult.newResult(arguments.getValue());
            }
        });
    }

}

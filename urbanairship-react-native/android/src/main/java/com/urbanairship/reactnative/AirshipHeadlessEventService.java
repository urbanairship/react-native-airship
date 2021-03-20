package com.urbanairship.reactnative;

import android.content.Context;
import android.content.Intent;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

public class AirshipHeadlessEventService extends HeadlessJsTaskService {
    private static final long TASK_TIMEOUT = 60000;
    private static final String TASK_KEY = "AirshipAndroidBackgroundEventTask";

    @Nullable
    @Override
    protected HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        return new HeadlessJsTaskConfig(TASK_KEY, Arguments.createMap(), TASK_TIMEOUT, true);
    }

    public static boolean startService(@NonNull Context context) {
        Intent intent = new Intent(context, AirshipHeadlessEventService.class);

        try {
            if (context.startService(intent) != null) {
                acquireWakeLockNow(context);
                return true;
            }
        } catch (Exception e) {
            PluginLogger.info("AirshipHeadlessEventService - Failed to start service", e);
        }

        return false;
    }

    @Override
    public void onHeadlessJsTaskStart(int taskId) {
        PluginLogger.verbose("AirshipHeadlessEventService - Started");
        super.onHeadlessJsTaskStart(taskId);
    }

    @Override
    public void onHeadlessJsTaskFinish(int taskId) {
        super.onHeadlessJsTaskFinish(taskId);
        PluginLogger.error("AirshipHeadlessEventService - Finished");
    }
}

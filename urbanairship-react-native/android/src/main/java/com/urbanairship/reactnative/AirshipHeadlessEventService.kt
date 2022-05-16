/* Copyright Urban Airship and Contributors */

package com.urbanairship.reactnative

import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class AirshipHeadlessEventService : HeadlessJsTaskService() {

    override fun getTaskConfig(intent: Intent): HeadlessJsTaskConfig? {
        return HeadlessJsTaskConfig(TASK_KEY, Arguments.createMap(), TASK_TIMEOUT, true)
    }

    override fun onHeadlessJsTaskStart(taskId: Int) {
        PluginLogger.verbose("AirshipHeadlessEventService - Started")
        super.onHeadlessJsTaskStart(taskId)
    }

    override fun onHeadlessJsTaskFinish(taskId: Int) {
        super.onHeadlessJsTaskFinish(taskId)
        PluginLogger.error("AirshipHeadlessEventService - Finished")
    }

    companion object {
        private const val TASK_TIMEOUT: Long = 60000
        private const val TASK_KEY = "AirshipAndroidBackgroundEventTask"

        fun startService(context: Context): Boolean {
            val intent = Intent(context, AirshipHeadlessEventService::class.java)

            try {
                context.startService(intent)?.let {
                    acquireWakeLockNow(context)
                    return true
                }
            } catch (e: Exception) {
                PluginLogger.info("AirshipHeadlessEventService - Failed to start service", e)
            }
            return false
        }
    }
}
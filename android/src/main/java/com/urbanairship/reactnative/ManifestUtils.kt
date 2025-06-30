package com.urbanairship.reactnative

import android.content.Context
import android.content.pm.PackageManager

object ManifestUtils {

  private const val HEADLESS_JS_TASK_ON_START_MANIFEST_KEY =  "com.urbanairship.reactnative.ALLOW_HEADLESS_JS_TASK_BEFORE_MODULE"
  private const val EXTENDER_MANIFEST_KEY = "com.urbanairship.reactnative.AIRSHIP_EXTENDER"

  fun Context.extenderClassName(): String? {
    return try {
      this.packageManager.getApplicationInfo(this.packageName, PackageManager.GET_META_DATA)
        .metaData.getString(EXTENDER_MANIFEST_KEY)
    } catch (e: PackageManager.NameNotFoundException) {
      null
    }
  }

  fun Context.isHeadlessJSTaskEnabledOnStart(): Boolean {
    return try {
      this.packageManager.getApplicationInfo(this.packageName, PackageManager.GET_META_DATA)
        .metaData.getBoolean(HEADLESS_JS_TASK_ON_START_MANIFEST_KEY, true)
    } catch (e: PackageManager.NameNotFoundException) {
      true
    }
  }
}



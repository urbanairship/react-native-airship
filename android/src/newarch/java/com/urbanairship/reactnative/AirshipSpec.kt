package com.urbanairship.reactnative

import com.facebook.react.bridge.ReactApplicationContext

abstract class AirshipSpec internal constructor(context: ReactApplicationContext) :
  NativeRTNAirshipSpec(context) {
}

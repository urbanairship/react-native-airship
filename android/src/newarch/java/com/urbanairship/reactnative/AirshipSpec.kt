package com.urbanairship.reactnative

import com.facebook.react.bridge.ReactApplicationContext

/**
 * TurboModule spec implementation for Airship.
 */
abstract class AirshipSpec internal constructor(context: ReactApplicationContext) :
  NativeRTNAirshipSpec(context) {
  // This class serves as the bridge between the TurboModule system and our AirshipModule
  // All methods are defined in the TypeScript spec and codegen generates the NativeRTNAirshipSpec
}

package com.urbanairship.reactnative

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.bridge.WritableMap

internal fun ReactContext.airshipDispatchEvent(nativeTag: Int, eventName: String, event: WritableMap) {
    this.getJSModule(RCTEventEmitter::class.java)
        .receiveEvent(nativeTag, eventName, event)
}
/* Copyright Airship and Contributors */

'use strict';

import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from "react-native";

/**
 * @hidden
 */
const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

/**
 * Custom native event emitter with additional Android behavior
 *
 * @hidden
 */
export class UAEventEmitter extends NativeEventEmitter {
  constructor() {
    super(UrbanAirshipModule);
  }

  addListener(eventType: string, listener: (...args: any[]) => any, context?: Object): EmitterSubscription {
    if (Platform.OS === 'android') {
      UrbanAirshipModule.addAndroidListener(eventType);
    }
    return super.addListener(eventType, listener, context);
  }

  removeAllListeners(eventType: string) {
    if (Platform.OS === 'android') {
        UrbanAirshipModule.removeAndroidListeners(this.listeners(eventType).length);
    }

    super.removeAllListeners(eventType);
  }

  removeSubscription(subscription: EmitterSubscription) {
    if (Platform.OS === 'android') {
      UrbanAirshipModule.removeAndroidListeners(1);
    }
    super.removeSubscription(subscription);
  }
}

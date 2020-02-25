// @flow
'use strict';

import {
  NativeModules,
  NativeEventEmitter,
  Platform
} from 'react-native';

const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

class UAEventEmitter extends NativeEventEmitter {

  constructor() {
    super(UrbanAirshipModule);
  }

  addListener(eventType: string, listener: Function, context: ?Object): EmitterSubscription {
    if (Platform.OS === 'android') {
      UrbanAirshipModule.addAndroidListener(eventType);
    }
    return super.addListener(eventType, listener, context);
  }

  removeAllListeners(eventType: string) {
    if (Platform.OS === 'android') {
      const count = this.listeners(eventType).length;
      UrbanAirshipModule.removeAndroidListeners(count);
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

module.exports = UAEventEmitter;

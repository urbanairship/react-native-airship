/* Copyright Airship and Contributors */

'use strict';

import { NativeModules } from 'react-native';
import { UrbanAirship } from 'urbanairship-react-native'
import { UAEventEmitter } from 'urbanairship-react-native/js/UAEventEmitter'

/**
 * @hidden
 */
const AirshipPreferenceCenterModule = NativeModules.AirshipPreferenceCenterModule;
const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

/**
 * @hidden
 */
const EventEmitter = new UAEventEmitter();

/**
 * A listener subscription.
 */
export class Subscription {
  onRemove: () => void;
  constructor(onRemove: () => void) {
    this.onRemove = onRemove;
  }
  /**
   * Removes the listener.
   */
  remove(): void {
    this.onRemove();
  }
}

/**
 * The Airship Preference center API.
 */
export class AirshipPreferenceCenter {

  static connect() {
    AirshipPreferenceCenterModule.connect();
  }

  static openPreferenceCenter(preferenceID: String) {
    AirshipPreferenceCenterModule.open(preferenceID);
  }

  static setUseCustomPreferenceCenterUI(useCustomUI: boolean, preferenceCenterID:String) {
    AirshipPreferenceCenterModule.setUseCustomPreferenceCenterUI(useCustomUI, preferenceCenterID);
  }

  static addPrefereceCenterOpenListener(listener: (...args: any[]) => any): Subscription {
    EventEmitter.addListener("com.urbanairship.open_preference_center", listener);
      return new Subscription(() => {
        EventEmitter.removeListener("com.urbanairship.open_preference_center", listener);
      });
    }
}

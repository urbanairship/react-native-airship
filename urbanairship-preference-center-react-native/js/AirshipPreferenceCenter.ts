/* Copyright Airship and Contributors */

'use strict';

import { NativeModules } from 'react-native';
import {  UrbanAirship, JsonValue } from 'urbanairship-react-native'
import { UAEventEmitter } from 'urbanairship-react-native/js/UAEventEmitter'
import { PreferenceCenter } from './PreferenceCenter';

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

  static openPreferenceCenter(preferenceCenterId: String) {
    AirshipPreferenceCenterModule.open(preferenceCenterId);
  }

  static getConfiguration(preferenceCenterId: String): Promise<PreferenceCenter> {
    return AirshipPreferenceCenterModule.getConfiguration(preferenceCenterId);
  }

  static setUseCustomPreferenceCenterUi(useCustomUi: boolean, preferenceCenterId: String) {
    AirshipPreferenceCenterModule.setUseCustomPreferenceCenterUi(useCustomUi, preferenceCenterId);
  }

  static addPreferenceCenterOpenListener(listener: (...args: any[]) => any): Subscription {
    EventEmitter.addListener("com.urbanairship.open_preference_center", listener);
    return new Subscription(() => {
      EventEmitter.removeListener("com.urbanairship.open_preference_center", listener);
    });
  }
}

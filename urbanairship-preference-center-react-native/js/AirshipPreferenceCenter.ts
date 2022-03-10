/* Copyright Airship and Contributors */

'use strict';

import { NativeModules } from 'react-native';
import { UrbanAirship, EventType, Subscription } from 'urbanairship-react-native'
import { PreferenceCenter } from './PreferenceCenter';

/**
 * @hidden
 */
const AirshipPreferenceCenterModule = NativeModules.AirshipPreferenceCenterModule;

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
    return UrbanAirship.addListener(EventType.OpenPreferenceCenter, listener);
  }
}

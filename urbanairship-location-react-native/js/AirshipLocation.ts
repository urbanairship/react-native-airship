/* Copyright Airship and Contributors */

'use strict';

import {
  NativeModules,
} from 'react-native';

const AirshipLocationModule = NativeModules.AirshipLocationReactModule;

/**
 * The Airship Location API.
 */
export class AirshipLocation {

  /**
   * Enables or disables Urban Airship location services.
   *
   * @param enabled true to enable location, false to disable.
   */
  static setLocationEnabled(enabled: boolean) {
    AirshipLocationModule.setLocationEnabled(enabled);
  }

  /**
   * Allows or disallows location services to continue in the background.
   *
   * @param allowed true to allow background location, false to disallow.
   */
  static setBackgroundLocationAllowed(allowed: boolean) {
    AirshipLocationModule.setBackgroundLocationAllowed(allowed);
  }

  /**
   * Checks if location is enabled or not.
   *
   * @return A promise with the result.
   */
  static isLocationEnabled(): Promise<boolean> {
    return AirshipLocationModule.isLocationEnabled();
  }

  /**
   * Checks if background location is allowed or not.
   *
   * @return A promise with the result.
   */
  static isBackgroundLocationAllowed(): Promise<boolean> {
    return AirshipLocationModule.isBackgroundLocationAllowed();
  }
}

/* Copyright Airship and Contributors */

// @flow
'use strict';

import {
  NativeModules,
  Platform
} from 'react-native';

const AirshipLocationModule = NativeModules.AirshipLocationReactModule;

/**
 * The Airship Location API.
 */
class AirshipLocation {

  /**
   * Enables or disables Airship location services.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @param {boolean} enabled true to enable location, false to disable.
   */
  static setLocationEnabled(enabled: boolean) {
    AirshipLocationModule.setLocationEnabled(enabled);
  }

  /**
   * Allows or disallows location services to continue in the background.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @param {boolean} allowed true to allow background location, false to disallow.
   */
  static setBackgroundLocationAllowed(allowed: boolean) {
    AirshipLocationModule.setBackgroundLocationAllowed(allowed);
  }

  /**
   * Checks if location is enabled or not.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isLocationEnabled(): Promise<boolean> {
    return AirshipLocationModule.isLocationEnabled();
  }

  /**
   * Checks if background location is allowed or not.
   *
   * Note: On iOS, location services require an additional dependency
   * on AirshipLocationKit. For more information see
   * https://docs.airship.com/platform/react-native/location/
   *
   * @return {Promise.<boolean>} A promise with the result.
   */
  static isBackgroundLocationAllowed(): Promise<boolean> {
    return AirshipLocationModule.isBackgroundLocationAllowed();
  }

module.exports = AirshipLocation;

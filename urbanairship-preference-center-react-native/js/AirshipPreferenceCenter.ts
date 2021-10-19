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
  *Preference section item.
  */
 export interface Item {

  /**
   * The item identifier.
   */
  id: String;

  /**
   * Optional display info.
   */
  display: CommonDisplay;

 }

 /**
  *Common display info.
  */
 export interface CommonDisplay {

  /**
   *The optional name/title.
   */
  name?: String;

  /**
   *The optional description/subtitle.
   */
  description?: String;

  }

 /**
  *Preference section.
  */
 export interface Section {

  /**
   * Section identifier.
   */
   id: String;

   /**
   * Section items.
   */
   items: Item[];

   /**
   * Optional display info.
   */
   display: CommonDisplay;
 }

 /**
 * Preference center config
 */
 export interface PreferenceCenterConfig {
  /**
   * The config identifier.
   */
  id: string;

  /**
   * The preference center sections.
   */
  sections: Section[];

  /**
   * Optional common display info.
   */
  display: CommonDisplay;
 }

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

  static getConfiguration(preferenceCenterId: String): Promise<PreferenceCenterConfig> {
      return AirshipPreferenceCenterModule.getConfiguration(preferenceCenterId);
  }

  static setUseCustomPreferenceCenterUi(useCustomUi: boolean, preferenceCenterId:String) {
    AirshipPreferenceCenterModule.setUseCustomPreferenceCenterUi(useCustomUi, preferenceCenterId);
  }

  static addPreferenceCenterOpenListener(listener: (...args: any[]) => any): Subscription {
    EventEmitter.addListener("com.urbanairship.open_preference_center", listener);
      return new Subscription(() => {
        EventEmitter.removeListener("com.urbanairship.open_preference_center", listener);
      });
    }
}

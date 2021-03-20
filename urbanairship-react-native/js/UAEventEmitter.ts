/* Copyright Airship and Contributors */

'use strict';

import { NativeModules, NativeEventEmitter, Platform, AppRegistry } from "react-native";

/**
 * @hidden
 */
const UrbanAirshipModule = NativeModules.UrbanAirshipReactModule;

/**
 * SDK event emitter.
 *
 * @hidden
 */
export class UAEventEmitter  {
  nativeEventEmitter: NativeEventEmitter;
  listeners: Map<string, Array<(...args: any[]) => any>>

  constructor() {
    this.nativeEventEmitter = new NativeEventEmitter(UrbanAirshipModule);
    this.listeners = new Map();

    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask('AirshipAndroidBackgroundEventTask', () => {
        return () => this.dispatchEvents(UrbanAirshipModule.takePendingBackgroundEvents);
      });

      this.nativeEventEmitter.addListener("com.urbanairship.onPendingForegroundEvent", async  () => {
        return this.dispatchEvents(UrbanAirshipModule.takePendingForegroundEvents);
      });
    } else if (Platform.OS === 'ios') {
      this.nativeEventEmitter.addListener("com.urbanairship.onPendingEvent", async  () => {
        return this.dispatchEvents(UrbanAirshipModule.takePendingEvents);
      });
    }
  }

  removeListener(eventType: string, listener: (...args: any[]) => any): void {
    var typedListeners = this.listeners.get(eventType);
    if (typedListeners) {
      typedListeners = typedListeners.filter(obj => obj !== listener);
      this.listeners.set(eventType, typedListeners);
    }
  }

  addListener(eventType: string, listener: (...args: any[]) => any): void {
    if (!this.listeners.get(eventType)) {
      this.listeners.set(eventType, new Array());
    }

    this.listeners.get(eventType)?.push(listener);
    UrbanAirshipModule.onAirshipListenerAdded(eventType);
  }

  removeAllListeners(eventType: string) {
    this.listeners.set(eventType, new Array());
  }

  private async dispatchEvents(source: (eventType: string) => Promise<any>): Promise<any> {
    let actions = Array.from(this.listeners.keys())
    .map(async (key: string) => {
      let typedListeners = this.listeners.get(key);
      if (typedListeners == null) {
        return Promise.resolve();
      }

      let events = await source(key);

      return Promise.all(typedListeners.map(async (listener: (...args: any[]) => any) => {
        for (const event of events) {
          await listener(event);
        }
      }))
    });
    return Promise.all(actions);
  }
}

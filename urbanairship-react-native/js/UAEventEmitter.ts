/* Copyright Airship and Contributors */

'use strict';

import { NativeEventEmitter, Platform, AppRegistry, NativeModules } from "react-native";

/**
 * @hidden
 */
export type DispatchEventsCallback = (source: (eventType: string) => Promise<any>) => Promise<any>;

/**
 * @hidden
 */
export abstract class AirshipEventBridge {
  dispatchEventsCallback: DispatchEventsCallback;

  constructor(dispatchEventsCallback: DispatchEventsCallback) {
    this.dispatchEventsCallback = dispatchEventsCallback;
  }

  abstract notifyAirshipListenerAdded(eventListener: string): void;
}

class DefaultAirshipEventBridge extends AirshipEventBridge {
  nativeModule = NativeModules.UrbanAirshipReactModule;
  eventEmitter = new NativeEventEmitter(this.nativeModule);

  constructor(dispatchEventsCallback: DispatchEventsCallback) {
    super(dispatchEventsCallback);

    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask('AirshipAndroidBackgroundEventTask', () => {
        return () => dispatchEventsCallback(this.nativeModule.takePendingBackgroundEvents);
      });

      this.eventEmitter.addListener("com.urbanairship.onPendingForegroundEvent", async () => {
        return dispatchEventsCallback(this.nativeModule.takePendingForegroundEvents);
      });
    } else if (Platform.OS === 'ios') {
      this.eventEmitter.addListener("com.urbanairship.onPendingEvent", async () => {
        return dispatchEventsCallback(this.nativeModule.takePendingEvents);
      });
    }
  }

  notifyAirshipListenerAdded(eventType: string): void {
    this.nativeModule.onAirshipListenerAdded(eventType);
  }
}

/**
 * SDK event emitter.
 *
 * @hidden
 */
export class UAEventEmitter {
  airshipEventBridge: AirshipEventBridge;
  listeners: Map<string, Array<(...args: any[]) => any>>;

  constructor(airshipEventBridgeFactory?: (callback: DispatchEventsCallback) => AirshipEventBridge) {
    this.listeners = new Map();
    this.airshipEventBridge = airshipEventBridgeFactory ?
      airshipEventBridgeFactory(this.dispatchEvents.bind(this))
      : new DefaultAirshipEventBridge(this.dispatchEvents.bind(this));
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
    this.airshipEventBridge.notifyAirshipListenerAdded(eventType);
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

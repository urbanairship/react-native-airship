/* Copyright Airship and Contributors */

import {
  NativeEventEmitter,
  Platform,
  AppRegistry,
  InteractionManager,
} from 'react-native';

/**
 * SDK event emitter.
 *
 * @hidden
 */
export class UAEventEmitter {
  private eventEmitter: NativeEventEmitter;
  private listeners: Map<string, Array<(...args: any[]) => any>> = new Map();

  constructor(private readonly nativeModule: any) {
    this.eventEmitter = new NativeEventEmitter(nativeModule);

    if (Platform.OS === 'android') {
      AppRegistry.registerHeadlessTask(
        'AirshipAndroidBackgroundEventTask',
        () => {
          return () => this.dispatchEvents(true);
        }
      );
    }
    this.eventEmitter.addListener('com.airship.ready', () => {
      return new Promise((resolve, reject) => {
        InteractionManager.runAfterInteractions(() => {
          this.dispatchEvents(false).then(resolve).catch(reject);
        });
      });
    });
  }

  removeListener(eventType: string, listener: (...args: any[]) => any): void {
    var typedListeners = this.listeners.get(eventType);
    if (typedListeners) {
      typedListeners = typedListeners.filter((obj) => obj !== listener);
      this.listeners.set(eventType, typedListeners);
    }
  }

  addListener(eventType: string, listener: (...args: any[]) => any): void {
    if (!this.listeners.get(eventType)) {
      this.listeners.set(eventType, new Array());
    }

    this.listeners.get(eventType)?.push(listener);
    this.nativeModule.airshipListenerAdded(eventType);
  }

  removeAllListeners(eventType: string) {
    this.listeners.set(eventType, new Array());
  }

  private async dispatchEvents(isHeadlessJS: boolean): Promise<any> {
    let actions = Array.from(this.listeners.keys()).map(async (key: string) => {
      let typedListeners = this.listeners.get(key);
      if (typedListeners == null) {
        return Promise.resolve();
      }

      let events = await this.nativeModule.takePendingEvents(key, isHeadlessJS);
      return Promise.all(
        typedListeners.map(async (listener: (...args: any[]) => any) => {
          for (const event of events) {
            await listener(event);
          }
        })
      );
    });
    return Promise.all(actions);
  }
}

/**
 * A listener subscription.
 */
export class Subscription {
  constructor(private readonly onRemove: () => void) {}
  /**
   * Removes the listener.
   */
  public remove(): void {
    this.onRemove();
  }
}

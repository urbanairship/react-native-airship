/* Copyright Airship and Contributors */

import { NativeEventEmitter, Platform, AppRegistry } from 'react-native';

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

    this.eventEmitter.addListener('com.airship.pending_events', async () => {
      return this.dispatchEvents(false);
    });
  }

  removeListener(eventType: string, listener: (...args: any[]) => any): void {
    const typedListeners = this.listeners.get(eventType);
    if (!typedListeners) {
      return;
    }

    const remaining = typedListeners.filter((obj) => obj !== listener);
    if (remaining.length > 0) {
      this.listeners.set(eventType, remaining);
    } else {
      // An entry with no listeners would still be drained by dispatchEvents.
      this.listeners.delete(eventType);
    }
  }

  addListener(eventType: string, listener: (...args: any[]) => any): void {
    const typedListeners = this.listeners.get(eventType) ?? [];
    typedListeners.push(listener);
    this.listeners.set(eventType, typedListeners);
    this.nativeModule.airshipListenerAdded(eventType);
  }

  removeAllListeners(eventType: string) {
    this.listeners.delete(eventType);
  }

  private async dispatchEvents(isHeadlessJS: boolean): Promise<any> {
    const actions = Array.from(this.listeners.entries()).map(
      async ([eventType, typedListeners]) => {
        // takePendingEvents consumes the events natively, so only ask for a
        // type that still has somewhere to deliver them.
        if (typedListeners.length === 0) {
          return;
        }

        const events = await this.nativeModule.takePendingEvents(
          eventType,
          isHeadlessJS
        );
        return Promise.all(
          typedListeners.map(async (listener: (...args: any[]) => any) => {
            for (const event of events) {
              await listener(event);
            }
          })
        );
      }
    );
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

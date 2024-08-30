import { AirshipActions } from './AirshipActions';
import { AirshipAnalytics } from './AirshipAnalytics';
import { AirshipChannel } from './AirshipChannel';
import { AirshipContact } from './AirshipContact';
import { AirshipInApp } from './AirshipInApp';
import { AirshipLocale } from './AirshipLocale';
import { AirshipMessageCenter } from './AirshipMessageCenter';
import { AirshipPreferenceCenter } from './AirshipPreferenceCenter';
import { AirshipPrivacyManager } from './AirshipPrivacyManager';
import { AirshipPush } from './AirshipPush';
import { AirshipFeatureFlagManager } from './AirshipFeatureFlagManager';

import { AirshipConfig, EventTypeMap, EventType } from './types';
import { Subscription, UAEventEmitter } from './UAEventEmitter';

/**
 * Airship
 */
export class AirshipRoot {
  public readonly actions: AirshipActions;
  public readonly analytics: AirshipAnalytics;
  public readonly channel: AirshipChannel;
  public readonly contact: AirshipContact;
  public readonly inApp: AirshipInApp;
  public readonly locale: AirshipLocale;
  public readonly messageCenter: AirshipMessageCenter;
  public readonly preferenceCenter: AirshipPreferenceCenter;
  public readonly privacyManager: AirshipPrivacyManager;
  public readonly push: AirshipPush;
  public readonly featureFlagManager: AirshipFeatureFlagManager;

  private readonly eventEmitter: UAEventEmitter;

  constructor(private readonly module: any) {
    this.eventEmitter = new UAEventEmitter(module);

    this.actions = new AirshipActions(module);
    this.analytics = new AirshipAnalytics(module);
    this.channel = new AirshipChannel(module);
    this.contact = new AirshipContact(module);
    this.inApp = new AirshipInApp(module, this.eventEmitter);
    this.locale = new AirshipLocale(module);
    this.messageCenter = new AirshipMessageCenter(module);
    this.preferenceCenter = new AirshipPreferenceCenter(module);
    this.privacyManager = new AirshipPrivacyManager(module);
    this.push = new AirshipPush(module);
    this.featureFlagManager = new AirshipFeatureFlagManager(module);
  }

  /**
   * Calls takeOff. If Airship is already configured for
   * the app session, the new config will be applied on the next
   * app init.
   * @param config The config.
   * @returns A promise with the result. `true` if airship is ready.
   */
  public takeOff(config: AirshipConfig): Promise<boolean> {
    return this.module.takeOff(config);
  }

  /**
   * Checks if Airship is ready.
   * @returns A promise with the result.
   */
  public isFlying(): Promise<boolean> {
    return this.module.isFlying();
  }
  
  /**
   * Adds a listener.
   * @param eventType The listener type. 
   * @param listener The listener.
   * @returns A subscription.
   */
  public addListener<T extends EventType>
  (
    eventType: T,
    listener: (event: EventTypeMap[T]) => any
  ): Subscription {
    this.eventEmitter.addListener(eventType, listener);
    return new Subscription(() => {
      this.removeListener(eventType, listener);
    });
  }

  /**
   * Removes a listener.
   *
   * @param eventType The event type.
   * @param listener The event listener. Should be a reference to the function passed into addListener.
   */
  public removeListener<T extends EventType>(
    eventType: EventType,
    listener: (event: EventTypeMap[T]) => any
  ) {
    this.eventEmitter.removeListener(eventType, listener);
  }

  /**
   * Removes all listeners for a given type.
   *
   * @param eventType The event type.
   */
  public removeAllListeners(eventType: EventType) {
    this.eventEmitter.removeAllListeners(eventType);
  }
}

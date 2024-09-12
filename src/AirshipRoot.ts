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
  public actions?: AirshipActions;
  public analytics?: AirshipAnalytics;
  public channel?: AirshipChannel;
  public contact?: AirshipContact;
  public inApp?: AirshipInApp;
  public locale?: AirshipLocale;
  public messageCenter?: AirshipMessageCenter;
  public preferenceCenter?: AirshipPreferenceCenter;
  public privacyManager?: AirshipPrivacyManager;
  public push?: AirshipPush;
  public featureFlagManager?: AirshipFeatureFlagManager;

  private eventEmitter?: UAEventEmitter;

  constructor(private readonly module: any) {
    this.module = module;
  }

  /**
   * Calls takeOff. If Airship is already configured for
   * the app session, the new config will be applied on the next
   * app init.
   * @param config The config.
   * @returns A promise with the result. `true` if airship is ready.
   */
  public takeOff(config: AirshipConfig): Promise<boolean> {
    this.actions = new AirshipActions(this.module);
    this.analytics = new AirshipAnalytics(this.module);
    this.channel = new AirshipChannel(this.module);
    this.contact = new AirshipContact(this.module);
    this.inApp = new AirshipInApp(this.module, this.eventEmitter!);
    this.locale = new AirshipLocale(this.module);
    this.messageCenter = new AirshipMessageCenter(this.module);
    this.preferenceCenter = new AirshipPreferenceCenter(this.module);
    this.privacyManager = new AirshipPrivacyManager(this.module);
    this.push = new AirshipPush(this.module);
    this.featureFlagManager = new AirshipFeatureFlagManager(this.module);
    this.eventEmitter = new UAEventEmitter(this.module);
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
  public addListener<T extends EventType>(
    eventType: T,
    listener: (event: EventTypeMap[T]) => any
  ): Subscription {
    this.eventEmitter!.addListener(eventType, listener);
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
    this.eventEmitter!.removeListener(eventType, listener);
  }

  /**
   * Removes all listeners for a given type.
   *
   * @param eventType The event type.
   */
  public removeAllListeners(eventType: EventType) {
    this.eventEmitter!.removeAllListeners(eventType);
  }
}

import { PushNotification } from 'react-native';
import { Android, iOS, NotificationStatus } from './types';

/**
 * Airship Push.
 */
export class AirshipPush {
  /**
   * iOS only push methods.
   */
  public readonly iOS: AirshipPushIOS;


  /**
   * Android only push methods.
   */
  public readonly android: AirshipPushAndroid;

  constructor(private readonly module: any) {
    this.iOS = new AirshipPushIOS(module);
    this.android = new AirshipPushAndroid(module);
  }

  /**
   * Enables/disables notifications on Airship.
   * 
   * When enabled, it will cause the user to be prompted for
   * the permission on platforms that support it. 
   * To get the result of the prompt, use `enableUserNotifications`.
   * @param enabled true to enable, false to disable
   * @returns A promise.
   */
  public setUserNotificationsEnabled(enabled: boolean): Promise<void> {
    return this.module.pushSetUserNotificationsEnabled(enabled);
  }

  /**
   * Checks if user notifications are enabled or not on Airship.
   * @returns A promise with the result.
   */
  public isUserNotificationsEnabled(): Promise<boolean> {
    return this.module.pushIsUserNotificationsEnabled();
  }

  /**
   * Enables user notifications.
   * @returns A promise with the permission result.
   */
  public enableUserNotifications(): Promise<boolean> {
    return this.module.pushEnableUserNotifications();
  }

  /**
   * Gets the notification status.
   * @returns A promise with the result.
   */
  public getNotificationStatus(): Promise<NotificationStatus> {
    return this.module.pushGetNotificationStatus();
  }

  /**
   * Gets the registration token if generated.
   * Use the event EventType.PushTokenReceived to be notified
   * when available.
   * @returns A promise with the result.
   */
  public getRegistrationToken(): Promise<string | null | undefined> {
    return this.module.pushGetRegistrationToken();
  }

  /**
   * Gets the list of active notifications.
   * 
   * On Android, this list only includes notifications
   * sent through Airship.
   * @returns A promise with the result.
   */
  public getActiveNotifications(): Promise<PushNotification[]> {
    return this.module.pushGetActiveNotifications();
  }

  /**
   * Clears all notifications for the app.
   */
  public clearNotifications(): void {
    return this.module.pushClearNotifications();
  }

  /**
   * Clears a specific notification.
   * 
   * On Android, you can use this method to clear
   * notifications outside of Airship, The identifier is in
   * the format of <tag>:<id>.
   * @param identifier The identifier.
   */
  public clearNotification(identifier: string): void {
    return this.module.pushClearNotification(identifier);
  }
}

/**
 * iOS Push.
 */
export class AirshipPushIOS {
  constructor(private readonly module: any) {}

  /**
   * Sets the foreground presentation options.
   * @param options The foreground options.
   * @returns A promise.
   */
  public setForegroundPresentationOptions(
    options: iOS.ForegroundPresentationOption[]
  ): Promise<void> {
    return this.module.pushIosSetForegroundPresentationOptions(options);
  }

  /**
   * Sets the notification options.
   * @param options The notification options.
   * @returns A promise.
   */
  public setNotificationOptions(
    options: iOS.NotificationOption[]
  ): Promise<void> {
    return this.module.pushIosSetNotificationOptions(options);
  }

  /**
   * Checks if autobadge is enabled.
   * @returns A promise with the result.
   */
  public isAutobadgeEnabled(): Promise<boolean> {
    return this.module.pushIosIsAutobadgeEnabled();
  }

  /**
   * Enables/disables autobadge.
   * @param enabled true to enable, false to disable.
   * @returns A promise.
   */
  public setAutobadgeEnabled(enabled: boolean): Promise<void> {
    return this.module.pushIosSetAutobadgeEnabled(enabled);
  }

  /**
   * Set the badge number.
   * @param badge The badge number.
   * @returns A promise.
   */
  public setBadgeNumber(badge: number): Promise<void> {
    return this.module.pushIosSetBadgeNumber(badge);
  }

  /**
   * Gets the badge number.
   * @returns A promise with the result.
   */
  public getBadgeNumber(): Promise<number> {
    return this.module.pushIosGetBadgeNumber();
  }
}

/**
 * Android Push.
 */
export class AirshipPushAndroid {
  constructor(private readonly module: any) {}

  /**
   * Checks if a notification category/channel is enabled.
   * @param channel The channel name.
   * @returns A promise with the result.
   */
  public isNotificationChannelEnabled(channel: string): Promise<boolean> {
    return this.module.pushAndroidIsNotificationChannelEnabled(channel);
  }

  /**
   * Sets the notification config.
   * @param config The notification config.
   */
  public setNotificationConfig(config: Android.NotificationConfig): void {
    return this.module.pushAndroidSetNotificationConfig(config);
  }
}

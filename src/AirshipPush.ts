import { PushNotification } from 'react-native';
import { Android, iOS, NotificationStatus } from './types';

export class AirshipPush {
  public readonly iOS: AirshipPushIOS;
  public readonly android: AirshipPushAndroid;

  constructor(private readonly module: any) {
    this.iOS = new AirshipPushIOS(module);
    this.android = new AirshipPushAndroid(module);
  }

  public setUserNotificationsEnabled(enabled: boolean): Promise<void> {
    return this.module.pushSetUserNotificationsEnabled(enabled);
  }

  public isUserNotificationsEnabled(): Promise<boolean> {
    return this.module.pushIsUserNotificationsEnabled();
  }

  public enableUserNotifications(): Promise<boolean> {
    return this.module.pushEnableUserNotifications();
  }

  public getNotificationStatus(): Promise<NotificationStatus> {
    return this.module.pushGetNotificationStatus();
  }

  public getRegistrationToken(): Promise<string | null | undefined> {
    return this.module.pushGetRegistrationToken();
  }

  public getActiveNotifications(): Promise<PushNotification[]> {
    return this.module.pushGetActiveNotifications();
  }

  public clearNotifications(): Promise<void> {
    return this.module.pushClearNotifications();
  }

  public clearNotification(identifier: string): void {
    return this.module.pushClearNotification(identifier);
  }
}

export class AirshipPushIOS {
  constructor(private readonly module: any) {}

  public setForegroundPresentationOptions(
    options: iOS.ForegroundPresentationOption[]
  ): Promise<void> {
    return this.module.pushIosSetForegroundPresentationOptions(options);
  }

  public setNotificationOptions(
    options: iOS.NotificationOption[]
  ): Promise<void> {
    return this.module.pushIosSetNotificationOptions(options);
  }

  public isAutobadgeEnabled(): Promise<boolean> {
    return this.module.pushIosIsAutobadgeEnabled();
  }

  public setAutobadgeEnabled(enabled: boolean): Promise<void> {
    return this.module.pushIosSetAutobadgeEnabled(enabled);
  }

  public setBadgeNumber(badge: number): Promise<void> {
    return this.module.pushIosSetBadgeNumber(badge);
  }

  public getBadgeNumber(): Promise<number> {
    return this.module.pushIosGetBadgeNumber();
  }
}

export class AirshipPushAndroid {
  constructor(private readonly module: any) {}

  public isNotificationChannelEnabled(channel: string): Promise<boolean> {
    return this.module.pushAndroidIsNotificationChannelEnabled(channel);
  }

  public setNotificationConfig(config: Android.NotificationConfig): void {
    return this.module.pushAndroidSetNotificationConfig(config);
  }
}

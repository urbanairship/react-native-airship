import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Airship
  takeOff(config: Object): Promise<boolean>;
  isFlying(): Promise<boolean>;
  airshipListenerAdded(eventName: string): void;
  takePendingEvents(
    eventName: string,
    isHeadlessJS: boolean
  ): Promise<Object[]>;
  addListener: (eventType: string) => void;
  removeListeners: (count: number) => void;

  // Channel
  channelAddTag(tag: string): Promise<void>;
  channelRemoveTag(tag: string): Promise<void>;
  channelGetTags(): Promise<string[]>;
  channelGetChannelId(): Promise<string | null | undefined>;
  channelGetSubscriptionLists(): Promise<string[]>;
  channelEditTagGroups(operations: Object[]): Promise<void>;
  channelEditAttributes(operations: Object[]): Promise<void>;
  channelEditSubscriptionLists(operations: Object[]): Promise<void>;

  // Push
  pushSetUserNotificationsEnabled(enabled: boolean): Promise<void>;
  pushIsUserNotificationsEnabled(): Promise<boolean>;
  pushEnableUserNotifications(): Promise<boolean>;
  pushGetNotificationStatus(): Promise<Object>;
  pushGetRegistrationToken(): Promise<string | null | undefined>;
  pushGetActiveNotifications(): Promise<Object[]>;
  pushClearNotifications(): void;
  pushClearNotification(identifier: string): void;

  // // Push.ios
  pushIosSetForegroundPresentationOptions(options: string[]): Promise<void>;
  pushIosSetNotificationOptions(options: string[]): Promise<void>;
  pushIosSetAutobadgeEnabled(enabled: boolean): Promise<void>;
  pushIosIsAutobadgeEnabled(): Promise<boolean>;
  pushIosSetBadgeNumber(badgeNumber: number): Promise<void>;
  pushIosGetBadgeNumber(): Promise<number>;

  // Push.android
  pushAndroidIsNotificationChannelEnabled(channel: string): Promise<boolean>;
  pushAndroidSetNotificationConfig(config: Object): void;

  // Contact
  contactIdentify(namedUser: string): Promise<void>;
  contactReset(): Promise<void>;
  contactGetNamedUserId(): Promise<string | null | undefined>;
  contactGetSubscriptionLists(): Promise<Object>;
  contactEditTagGroups(operations: Object[]): Promise<void>;
  contactEditAttributes(operations: Object[]): Promise<void>;
  contactEditContactSubscriptionLists(operations: Object[]): Promise<void>;

  // Analytics
  analyticsTrackScreen(screen: string): Promise<void>;
  analyticsAssociateIdentifier(key: string, identifier?: string): Promise<void>;

  // Action
  actionRun(name: string, value?: Object): Promise<Object | Error>;

  // Privacy Manager
  privacyManagerSetEnabledFeatures(features: string[]): Promise<boolean>;
  privacyManagerGetEnabledFeatures(): Promise<string[]>;
  privacyManagerEnableFeature(features: string[]): Promise<void>;
  privacyManagerDisableFeature(features: string[]): Promise<void>;
  privacyManagerIsFeatureEnabled(features: string[]): Promise<void>;

  // InApp
  inAppSetDisplayInterval(milliseconds: number): Promise<void>;
  inAppGetDisplayInterval(): Promise<number>;
  inAppSetPaused(paused: boolean): Promise<void>;
  inAppIsPaused(): Promise<boolean>;

  // Message Center
  messageCenterGetUnreadCount(): Promise<number>;
  messageCenterDismiss(): Promise<void>;
  messageCenterDisplay(messageId?: string): Promise<boolean>;
  messageCenterGetMessages(): Promise<Object[]>;
  messageCenterDeleteMessage(messageId: string): Promise<boolean>;
  messageCenterMarkMessageRead(messageId: string): Promise<boolean>;
  messageCenterRefresh(): Promise<void>;
  messageCenterSetAutoLaunchDefaultMessageCenter(enabled: boolean): void;

  // Preference Center
  preferenceCenterDisplay(preferenceCenterId: string): Promise<void>;
  preferenceCenterGetConfig(preferenceCenterId: string): Promise<Object>;
  preferenceCenterAutoLaunchDefaultPreferenceCenter(
    preferenceCenterId: string,
    autoLaunch: boolean
  ): void;

  // Locale
  localeSetLocaleOverride(localeIdentifier: string): Promise<void>;
  localeGetLocale(): Promise<string>;
  localeClearLocaleOverride(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RTNAirship');

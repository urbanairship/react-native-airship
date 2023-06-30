# Migration Guide

# 15.x to 16.x

### Min iOS Version

This version of the plugin now requires iOS 14+ as the min deployment target and Xcode 14.3+.

### Notification Status

The notification status object returned by `Airship.push.getNotificationStatus()` has changed:

15.x:

```
export interface NotificationStatus {
  /**
   * If airship is opted in for push notifications are not.
   */
  airshipOptIn: boolean;

  /**
   * If notifications are enabled on Airship or not.
   */
  airshipEnabled: boolean;

  /**
   * If notifications are enabled in the app settings or not.
   */
  systemEnabled: boolean;

  /**
   * iOS status.
   */
  ios?: {
    /**
     * Authorized settings.
     */
    authorizedSettings: iOS.AuthorizedNotificationSetting[];

    /**
     * Authorized status.
     */
    authorizedStatus: iOS.AuthorizedNotificationStatus;
  };
}
```

16.x:

```
/**
 * Push notification status.
 */
export interface PushNotificationStatus {  
  /**
   * If user notifications are enabled on [Airship.push].
   */
  isUserNotificationsEnabled: boolean;

  /**
   * If notifications are allowed at the system level for the application.
   */
  areNotificationsAllowed: boolean;

  /**
   * If the push feature is enabled on [Airship.privacyManager].
   */
  isPushPrivacyFeatureEnabled: boolean;
 
 /*
  * If push registration was able to generate a token.
  */
  isPushTokenRegistered: boolean;

  /*
   * If Airship is able to send and display a push notification .
   */
  isOptedIn: boolean;

  /*
   * If user notifications are enabled on Airship and the notification permission is granted. This check
   * checks for everything but if isPushTokenRegistered is true.
   */
  isUserOptedIn: boolean;
}
```

The old flags can be determined using:
```
airshipOptIn = isOptedIn
airshipEnabled = isUserNotificationsEnabled && isPushPrivacyFeatureEnabled
systemEnabled = areNotificationsAllowed
```

On iOS, you can get the authorized settings and status using:
```
Airship.push.iOS.getAuthorizedSettings()
Airship.push.iOS.getAuthorizedStatus()
```

### NotificationOptInStatusEvent replaced

The `NotificationOptInStatusEvent` has been replaced with `PushNotificationStatusChangedEvent` which now returns the new `PushNotificationStatus` object:
```
/**
 * Event fired when the notification status changes.
 */
export interface NotificationStatusChangedEvent {
  /**
   * The notification status
   */
  status: NotificationStatus
}
```

On iOS, you can use the new `iOS.AuthorizedNotificationSettingsChangedEvent` event to be notified when authorized settings have changed.


# 14.x to 15.x

## Package Changes

The npm module is now published under the name `@ua/react-native-airship` instead of `urbanairship-react-native`. The `Airship` instance is now also exported by default.

*Old import*
import { UrbanAirship, EventType } from 'urbanairship-react-native';

*New import*
```
import Airship, { EventType } from '@ua/react-native-airship';
```

### Obsolete packages

The package `urbanairship-chat-react-native` and `urbanairship-accengage-react-native` have been removed without a replacement. The `chat` feature was discontinued and the Accengage package is only useful during the migration period from Accengage to Airship. Apps that still need to migrate should stick with 14.x until after the migration period.

### Preference Center package

The `urbanairship-preference-center-react-native` is now in the main package. You can access it through `Airship.preferenceCenter`. See the API changes for 1 to 1 method replacements.

### HMS package

The `urbanairship-hms-react-native` has been removed and replaced with a new gradle flag `airshipHmsEnabled` flag. You can set the flag to `true` in the `android/gradle.properties` file. In order to use HMS, the app still needs to include a dependency for `com.huawei.hms:push` and apply the HMS gradle plugin. See [Airship React Native setup guide](https://docs.airship.com/platform/mobile/setup/sdk/react-native/) for more info.


## API Changes

### Methods

The API is now divided up into functional components that can eb accessed from the `Airship` instance. Use the table
for replacements.

| 14.x                                                                                                                          | 15.x                                                                                                                               |
|-------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|
| UrbanAirship.takeOff(config: AirshipConfig): Promise<boolean>                                                                 | Airship.takeOff(config: AirshipConfig): Promise<boolean>                                                                           |
| UrbanAirship.isFlying(): Promise<boolean>                                                                                     | Airship.isFlying(): Promise<boolean>                                                                                               |
| UrbanAirship.addListener(eventType: EventType, listener: (...args: any[]) => any): Subscription                               | Airship.addListener(eventType: EventType, listener: (...args: any[]) => any): Subscription                                         |
| UrbanAirship.removeListener(eventType: EventType, listener: (...args: any[]) => any)                                          | Airship.removeListener(eventType: EventType, listener: (...args: any[]) => any)                                                    |
| UrbanAirship.removeAllListeners(eventType: EventType)                                                                         | Airship.removeAllListeners(eventType: EventType)                                                                                   |
| UrbanAirship.setEnabledFeatures(features: Feature[]): Promise<boolean>                                                        | Airship.privacyManager.setEnabledFeatures(features: Feature[]): Promise<void>                                                      |
| UrbanAirship.getEnabledFeatures(): Promise<Feature[]>                                                                         | Airship.privacyManager.getEnabledFeatures(): Promise<Feature[]>                                                                    |
| UrbanAirship.enableFeature(features: Feature[]): Promise<boolean>                                                             | Airship.privacyManager.enableFeature(features: Feature[]): Promise<void>                                                           |
| UrbanAirship.disableFeature(features: Feature[]): Promise<boolean>                                                            | Airship.privacyManager.disableFeature(features: Feature[]): Promise<void>                                                          |
| UrbanAirship.isFeatureEnabled(features: Feature[]): Promise<boolean>                                                          | Airship.privacyManager.isFeatureEnabled(features: Feature[]): Promise<void>                                                        |
| UrbanAirship.enableChannelCreation()                                                                             | Removed, use privacy manager flags                                                                          |
| UrbanAirship.addTag(tag: string)                                                                                              | Airship.channel.addTag(tag: string): Promise<void>                                                                                 |
| UrbanAirship.removeTag(tag: string)                                                                                           | Airship.channel.removeTag(tag: string): Promise<void>                                                                              |
| UrbanAirship.getTags(): Promise<string[]>                                                                                     | Airship.channel.getTags(): Promise<string[]>                                                                                       |
| UrbanAirship.getChannelId(): Promise<string \| null \| undefined>                                                               | Airship.channel.getChannelId(): Promise<string \| null \| undefined>                                                                 |
| UrbanAirship.editChannelTagGroups(): TagGroupEditor                                                                           | Airship.channel.editTagGroups(): TagGroupEditor                                                                                    |
| UrbanAirship.editChannelAttributes(): AttributeEditor                                                                         | Airship.channel.editAttributes(): AttributeEditor                                                                                  |
| UrbanAirship.editSubscriptionLists(): SubscriptionListEditor                                                                  | Airship.channel.editSubscriptionLists(): SubscriptionListEditor                                                                    |
| UrbanAirship.editChannelSubscriptionLists(): SubscriptionListEditor                                                           | Airship.channel.editSubscriptionLists(): SubscriptionListEditor                                                                    |
| UrbanAirship.getSubscriptionLists(types?: [...SubscriptionListType[]]): Promise<SubscriptionLists>                            | Airship.channel.getSubscriptionLists(): Promise<string[]> and Airship.contactgetSubscriptionLists(): Promise<Record<string, SubscriptionScope[]>> |
| UrbanAirship.setNamedUser(namedUser: string \| null \| undefined)                                                               | Airship.contact.identify(namedUserId: String): Promise<void> and Airship.contact.reset(): Promise<void>                            |
| UrbanAirship.getNamedUser(): Promise<string \| null \| undefined>                                                               | Airship.contact.getNamedUserId(): Promise<string \| null \| undefined>                                                               |
| UrbanAirship.editNamedUserAttributes(): AttributeEditor                                                                       | Airship.contact.editAttributes(): AttributeEditor                                                                                  |
| UrbanAirship.editContactAttributes(): AttributeEditor                                                                         | Airship.contact.editAttributes(): AttributeEditor                                                                                  |
| UrbanAirship.editContactSubscriptionLists(): ScopedSubscriptionListEditor                                                     | Airship.contact.editSubscriptionLists(): ScopedSubscriptionListEditor                                                              |
| UrbanAirship.editNamedUserTagGroups(): TagGroupEditor                                                                         | Airship.contact.editTagGroups(): TagGroupEditor                                                                                    |
| UrbanAirship.editContactTagGroups(): TagGroupEditor                                                                           | Airship.contact.editTagGroups(): TagGroupEditor                                                                                    |
| UrbanAirship.isUserNotificationsOptedIn(): Promise<boolean>                                                                   | Removed, use Airship.push.getNotificationStatus() instead.                                                                         |
| UrbanAirship.isSystemNotificationsEnabledForApp(): Promise<boolean>                                                           | Removed, use Airship.push.getNotificationStatus() instead.                                                                         |
| UrbanAirship.getNotificationStatus(): Promise<NotificationStatus>                                                             | Airship.push.getNotificationStatus(): Promise<NotificationStatus>                                                                  |
| UrbanAirship.getNotificationChannelStatus(channel: string): Promise<string>                                                   | Airship.push.isNotificationChannelEnabled(channel: string): Promise<boolean>                                                       |
| UrbanAirship.setAndroidNotificationConfig(config: NotificationConfigAndroid)                                                  | Airship.push.android.setNotificationConfig(config: Android.NotificationConfig)                                                     |
| UrbanAirship.setUserNotificationsEnabled(enabled: boolean)                                                                    | Airship.push.setUserNotificationsEnabled(enabled: boolean): Promise<void>                                                          |
| UrbanAirship.isUserNotificationsEnabled(): Promise<boolean>                                                                   | Removed, use Airship.push.getNotificationStatus() instead.                                                                         |
| UrbanAirship.enableUserPushNotifications(): Promise<boolean>                                                                  | Airship.push.enableUserNotifications(): Promise<void>                                                                              |
| UrbanAirship.getRegistrationToken(): Promise<string \| null \| undefined>                                                       | Airship.push.getRegistrationToken(): Promise<string \| null \| undefined>                                                            |
| UrbanAirship.setForegroundPresentationOptions(options: ForegroundNotificationOptionsIOS \| [iOS.ForegroundPresentationOption]) | Airship.push.iOS.setForegroundPresentationOptions(options: iOS.ForegroundPresentationOption[]): Promise<void>                      |
| UrbanAirship.setNotificationOptions(options: [iOS.NotificationOption])                                                        | Airship.push.iOS.setNotificationOptions(options: iOS.NotificationOption[]): Promise<void>                                          |
| UrbanAirship.setAutobadgeEnabled(enabled: boolean)                                                                            | Airship.push.iOS.setAutobadgeEnabled(enabled: boolean): Promise<void>                                                              |
| UrbanAirship.isAutobadgeEnabled(): Promise<boolean>                                                                           | Airship.push.iOS.isAutobadgeEnabled(): Promise<boolean>                                                                            |
| UrbanAirship.setBadgeNumber(badgeNumber: number)                                                                              | Airship.push.iOS.setBadgeNumber(badgeNumber: number): Promise<void>                                                                |
| UrbanAirship.getBadgeNumber(): Promise<number>                                                                                | Airship.push.iOSgetBadgeNumber(): Promise<number>                                                                                  |
| UrbanAirship.getActiveNotifications(): Promise<PushMessage[]>                                                           | Airship.push.getActiveNotifications(): Promise<PushNotification[]>                                                                       |
| UrbanAirship.clearNotifications()                                                                                             | Airship.push.clearNotifications()                                                                                                  |
| UrbanAirship.clearNotification(identifier: string)                                                                            | Airship.push.clearNotification(identifier: string)                                                                                 |
| UrbanAirship.runAction(name: string, value?: JsonValue): Promise<JsonValue \| Error>                                           | Airship.actions.run(name: string, value?: JsonValue): Promise<JsonValue \| Error>                                                   |
| UrbanAirship.associateIdentifier(key: string, id?: string)                                                                    | Airship.analytics.associateIdentifier(key: string, id?: string)                                                                    |
| UrbanAirship.addCustomEvent(event: CustomEvent): Promise<null \| Error>                                                        | Airship.analytics.addCustomEvent(event: CustomEvent): Promise<null \| Error>                                                        |
| UrbanAirship.setAnalyticsEnabled(enabled: boolean)                                                                            | Removed, use privacy manager flags                                                                                                 |
| UrbanAirship.isAnalyticsEnabled(): Promise<boolean>                                                                           | Removed, use privacy manager flags                                                                                                 |
| UrbanAirship.trackScreen(screen: string)                                                                                      | Airship.analytics.trackScreen(screen: string?): Promise<void>                                                                      |
| UrbanAirship.getUnreadMessageCount(): Promise<number>                                                                         | Airship.messageCenter.getUnreadCount(): Promise<number>                                                                            |
| UrbanAirship.displayMessageCenter()                                                                                           | Airship.messageCenter.display(messageId?: string): Promise<void>                                                                   |
| UrbanAirship.dismissMessageCenter()                                                                                           | Airship.messageCenter.dismiss(): Promise<void>                                                                                     |
| UrbanAirship.displayMessage(messageId: string): Promise<boolean>                                                              | Airship.messageCenter.display(messageId?: string): Promise<void>                                                                   |
| UrbanAirship.dismissMessage()                                                                                                 | Airship.messageCenter.dismiss(): Promise<void>                                                                                     |
| UrbanAirship.getInboxMessages(): Promise<InboxMessage[]>                                                                      | Airship.messageCenter.getMessages(): Promise<InboxMessage[]>                                                                       |
| UrbanAirship.deleteInboxMessage(messageId: string): Promise<boolean>                                                          | Airship.messageCenter.deleteMessage(messageId: string): Promise<void>                                                              |
| UrbanAirship.markInboxMessageRead(messageId: string): Promise<boolean>                                                        | Airship.messageCenter.markMessageRead(messageId: string): Promise<void>                                                            |
| UrbanAirship.refreshInbox(): Promise<boolean>                                                                                 | Airship.messageCenter.refreshMessages(): Promise<boolean>                                                                          |
| UrbanAirship.setAutoLaunchDefaultMessageCenter(enabled: boolean)                                                              | Airship.messageCenter.setAutoLaunchDefaultMessageCenter(enabled: boolean)                                                          |
| UrbanAirship.setCurrentLocale(localeIdentifier: String)                                                                       | Airship.locale.setLocaleOverride(localeIdentifier: String): Promise<void>                                                          |
| UrbanAirship.getCurrentLocale(): Promise<String>                                                                              | Airship.locale.getCurrentLocale(): Promise<String>                                                                                 |
| UrbanAirship.clearLocale()                                                                                                    | Airship.locale.clearLocaleOverride(): Promise<void>                                                                                |
| UrbanAirship.setInAppAutomationDisplayInterval(seconds: number)                                                               | Airship.inApp.setDisplayInterval(milliseconds: number): Promise<void>                                                              |
| AirshipPreferenceCenter.openPreferenceCenter(preferenceCenterId: String)                                                      | Airship.preferenceCenter.display(preferenceCenterId: String): Promise<void>                                                        |
| AirshipPreferenceCenter.getConfiguration(preferenceCenterId: String): Promise<PreferenceCenter>                               | Airship.preferenceCenter.getConfig(preferenceCenterId: String): Promise<PreferenceCenter>                                          |
| AirshipPreferenceCenter.setUseCustomPreferenceCenterUi(useCustomUi: boolean, preferenceCenterId: String)                      | Airship.preferenceCenter.setAutoLaunchDefaultPreferenceCenterut(useCustomUi: boolean, preferenceCenterId: String)                  |
| AirshipPreferenceCenter.addPreferenceCenterOpenListener(listener: (...args: any[]) => any): Subscription                      | Removed, use normal addListener                                                                                                    |


### Events

| 14.x                              	| 15.x                                                     	| Notes                                                                       	|
|-----------------------------------	|----------------------------------------------------------	|-----------------------------------------------------------------------------	|
| EventType.NotificationResponse    	| EventType.NotificationResponse                           	| The `notification` property has been renamed to `pushPayload`               	|
| EventType.PushReceived            	| EventType.PushReceived                                   	| The push body is now under a sub property `pushPayload`                     	|
| EventType.Register                	| EventType.ChannelCreated and EventType.PushTokenReceived 	|                                                                             	|
| EventType.Registration            	| EventType.ChannelCreated and EventType.PushTokenReceived 	|                                                                             	|
| EventType.DeepLink                	| EventType.DeepLink                                       	|                                                                             	|
| EventType.NotificationOptInStatus 	| EventType.NotificationOptInStatus                        	| The array of authorized setting names is now under `ios.authorizedSettings` 	|
| EvenType.InboxUpdated             	| EventType.MessageCenterUpdated                           	|                                                                             	|
| EvenType.ShowInbox                	| EventType.DisplayMessageCenter                           	|                                                                             	|
| EventType.ConversationUpdated     	|                                                          	| Removed                                                                     	|
| EventType.OpenChat                	|                                                          	| Removed                                                                     	|
| EventType.OpenPreferenceCenter    	| EventType.DisplayPreferenceCenter                        	|                                                                             	|


### Features

The list of available features no longer includes `all` or `none`. A new constant `FEATURES_ALL` is available that is a list of all features that can be used instead of `all`. For `none`, use an empty array instead.

# 11.x to 12.x

Data collection enabled has been replaced with privacy manager.

```
// 11.x
static setDataCollectionEnabled(enabled: boolean)
static isDataCollectionEnabled(): Promise<boolean>


// 12.x
static enableFeature(features: Feature[]): Promise<boolean>
static disableFeature(features: Feature[]): Promise<boolean>
static isFeatureEnabled(features: Feature[]): Promise<boolean>
```

For more infomration on privacy manager, please read:
- [Android docs](https://docs.airship.com/platform/android/data-collection/)
- [iOS docs](https://docs.airship.com/platform/ios/data-collection/)


# 7.x to 8.0.0

## Location Changes

Location support is now provided by the new `urbanairship-location-react-native` module. Previous
integration steps that required manually installing AirshipLocation or AirshipLocationKit framework
dependencies are no longer neessary.

## Renamed Classes

* `UACustomEvent` -> `CustomEvent`
* `UAMessageView` -> `MessageView`

## Removed Methods

* `getQuietTime`
* `setQuietTime`
* `getQuietTimeEnabled`
* `setQuietTImeEnabled`

## Added Enums

* `EventType` enum (backwards compatible with raw event strings such as `"register"`, `"notificationReceived"`, etc)

## TypeScript Changes

The module has been completely rewritten in TypeScript, and so typings now have full coverage,
with a handful of small changes.

### Renamed Interfaces

* `Message` -> `InboxMessage`
* `MessageCloseEvent` -> `MessageClosedEvent`
* `JsonMap` -> `JsonObject`

### Renamed Types

* `Event` -> `EventType`

### Added Types:

* `MessageLoadError`

## Removed Flow

As of 7.0.0 Flow typings are no longer provided, but existing apps written in Flow as well as
plain JavaScript apps will continue to work with the module. For new apps needing static
type checking, TypeScript is strongly recommended.

# 2.x to 3.0.0

Due to changes to the iOS SDK, location services now require an additional dependency on
AirshipLocationKit. See the [location](https://docs.airship.com/platform/react-native/location)
documentation for more details.

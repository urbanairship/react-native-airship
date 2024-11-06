# React Native Module Changelog

## Version 20.0.1 - November 6, 2024
Patch release that fixes a crash when using both Airship and `@react-native-firebase/messaging`.

### Changes
- Updated Airship iOS SDK to [18.12.1](https://github.com/urbanairship/ios-library/releases/tag/18.12.1)
- Updated Airship Android SDK to [18.4.0](https://github.com/urbanairship/android-library/releases/tag/18.4.0)

## Version 20.0.0 - October 25, 2024
Major version that makes it easier to include Airship in a hybrid app. The only breaking change is when extending the `AirshipPluginExtender` protocol on Java there is a new `extendConfig(Context, AirshipConfigOptions.Builder)` method to implement. Applications that are not using `AirshipPluginExtender` or using Kotlin are not affected by the breaking change.

### Changes
- Fixed tracking live activities started from a push notification
- Added methods to plugin extenders to extend the Airship Config options
- Exposed forward listeners on Android with `AirshipPluginForwardListeners` and delegates on iOS with `AirshipPluginForwardDelegates`. These listeners and delegates are useful for hybrid apps that need to listen for events both natively and in React Native context

## Version 19.4.2 - October 22, 2024
Patch release to fix live activities and live updates on react old architecture and update Android and iOS SDK.

### Changes
- Fixed live activities and live updates on react old architecture.
- Updated Airship Android SDK to [18.3.3](https://github.com/urbanairship/android-library/releases/tag/18.3.3)
- Updated Airship iOS SDK to [18.11.1](https://github.com/urbanairship/ios-library/releases/tag/18.11.1)

## Version 19.4.1 - October 9, 2024
Patch release to fix a compile issue with the old Architecture on Android.

### Changes
- Fixed compile issue when using old architecture on Android.

## Version 19.4.0 - October 4, 2024

### Changes
- Updated Airship Android SDK to [18.3.2](https://github.com/urbanairship/android-library/releases/tag/18.3.2)
- Updated Airship iOS SDK to [18.10.0](https://github.com/urbanairship/ios-library/releases/tag/18.10.0)
- Added `notificationPermissionStatus` to `PushNotificationStatus`
- Added options to `enableUserNotifications` to specify the `PromptPermissionFallback` when enabling user notifications
- Added new `showMessageCenter(messageId?: string)` and `showMessageView(messageId: string)` to `MessageCenter` to display the OOTB UI even if `autoLaunchDefaultMessageCenter` is disabled
- Added new APIs to manage [iOS Live Activities](https://docs.airship.com/platform/mobile/ios-live-activities/)
- Added new APIs to manage [Android Live Updates](https://docs.airship.com/platform/mobile/android-live-updates/)
- Added a new [iOS plugin extender]() to modify the native Airship SDK after takeOff
- Added new [Android plugin extender]() to modify the native Airship SDK after takeOff
- Deprecated `com.urbanairship.reactnative.AirshipExtender` for the common `com.urbanairship.android.framework.proxy.AirshipPluginExtender`. The manifest name also changed from `com.urbanairship.reactnative.AIRSHIP_EXTENDER` to `com.urbanairship.plugin.extender`

## Version 19.3.2 - September 13, 2024
Patch release to fix a compile issue with the new Architecture on iOS and to fix a potential race condition on the event listeners when refreshing the JS bridge.

### Changes
- Fixed compile issue when using new architecture on iOS
- Fixed potential race condition on events listeners when the JS bridge refreshes

## Version 19.3.1 - September 5, 2024
Patch release to fix compile issue with 19.3.0 when using the old architecture on Android. 

### Changes
- Fix compile issue when using old architecture on Android

## Version 19.3.0 - August 30, 2024
Minor release that adds early access support for Embedded Content. 

### Changes
- Adds AirshipEmbeddedView and listener methods to Airship.inApp for Embedded Content.
- Exposes the Airship session ID on Airship.analytics.


## Version 19.2.1 - August 23, 2024
Patch release that fixes an issue with extras parsing on notifications

### Changes
- Allow JsonObject accept undefined values
- Adds support for dynamic frameworks on iOS

## Version 19.2.0 - August 13, 2024
Minor release that fixes test devices audience check, holdout group experiments displays and in-app experience displays when resuming from a paused state. Apps that use in-app experiences are encouraged to update.

### Changes
- Updated Android SDK to 18.1.6.
- Updated iOS SDK to 18.7.2.
- Fixed test devices audience check.
- Fixed holdout group experiments displays.
- Fixed in-app experience displays when resuming from a paused state.

## Version 19.1.0 - July 17, 2024
Minor release that fixes enabling or disabling all Airship features using `FEATURES_ALL` and adds possibility to enable and disable `Feature.FeatureFlags`.

### Changes
- Fixed enabling or disabling features using `FEATURE_ALL`.
- Added possibility to enable and disable `Feature.FeatureFlags` using the privacy manager.

## Version 19.0.0 - July 9, 2024
Major release that updates the Android Airship SDK to 18.

### Changes
- Updated iOS SDK to 18.5.0
- Updated Android SDK to 18.1.1
- Added iOS logPrivacyLevel that can be set in the environments when calling takeOff

## Version 18.0.5 - Jun 21, 2024
Patch release to fix a regression on iOS with In-App Automations, Scenes, and Surveys ignoring screen, version, and custom event triggers. Apps using those triggers that are on 18.0.4 should update.

### Changes
- Updated iOS SDK to 18.4.1
- Fixed regression with triggers

## Version 18.0.4 - Jun 20, 2024
Patch release that updates iOS SDK to 18.4.0 and updates the airship mobile framework proxy to 6.3.0 which includes a fix for event management. 

### Changes
- Updated iOS SDK to 18.4.0
- Updated airship-mobile-framework-proxy to 6.3.0
- Fixed Event Emitter bug

## Version 18.0.3 - May 17, 2024
Patch release that updates to latest iOS SDK.

### Changes
- Updated iOS SDK to 18.2.2

## Version 18.0.2 - May 13, 2024
Patch release that updates to latest Airship SDKs.

### Changes
- Updated iOS SDK to 18.2.0
- Updated Android SDK to 17.8.1

## Version 18.0.1 - April 29, 2024
Patch release that updates the iOS SDK to 18.1.2.

### Changes
- Update iOS SDK to 18.1.2

## Version 18.0.0 - April 18, 2024
Major release that updates the iOS SDK to 18.1.0 and updates CustomEvents to be an interface instead of a class.

### Changes
- Replaced CustomEvent with an interface
- Update iOS SDK to 18.1.0
- Updated Android SDK to 17.8.0

## Version 17.3.0 - April 9, 2024
Minor release that fixes running Airship actions, exposes more custom event fields, and updates the iOS SDK to 17.9.1 and the Android SDK to 17.7.4.

### Changes
- Fixed running Airship actions with a single primitive typed action value
- Exposed `interactionId` and `interactionType` fields in `CustomEvent`
- Updated iOS SDK to 17.9.1
- Updated Android SDK to 17.7.4

## Version 17.2.1 - March 19, 2024
Patch release that updates the HMS Push Provider version to 17.7.3, the iOS SDK to 17.9.0 and the Android SDK to 17.7.3.

### Changes
- Updated HMS Push Provider version to 17.7.3
- Updated iOS SDK to 17.9.0
- Updated Android SDK to 17.7.3

## Version 17.2.0 - February 15, 2024
Minor release that updates the iOS SDK to 17.7.3 and Android SDK to 17.7.2, modernizes the podspec and updates NPM dependencies flagged during security audit.

### Changes
- Updated iOS SDK to 17.7.3
- Updated Android SDK to 17.7.2
- Adds `install_modules_dependencies` to podspec to support for the latest react-native 0.73.3
- Updates NPM dependencies to address security audit

## Version 17.1.1 - December 6, 2023
Patch release that fixes missing annotations on feature flag methods, makes the `airshipHmsEnabled` flag available and updates examples.

### Changes
- Adds missing annotations to `featureFlagManagerFlag` and `featureFlagManagerTrackInteraction`
- Adds a check for `airshipHmsEnabled` flag in the gradle build file to make the flag available in ExtraProperties of the Android root project
- Updates the android and ios examples

## Version 17.1.0 - December 6, 2023
Minor release that updates the iOS SDK to 17.7.0 and Android SDK to 17.6.0 and adds support for notifying the contact of a remote login.

### Changes
- Updated iOS SDK to 17.7.0
- Updated Android SDK to 17.6.0
- Added `Airship.contact.notifyRemoteLogin()` method to notify contact of remote login

## Version 17.0.0 - November 21, 2023
Major release that adds support for server side feature flag segmentation, interaction events for feature flags, and Impression billing.

### Changes
- Updated iOS SDK to 17.6.1
- Updated Android SDK to 17.5.0
- Added `Airship.featureFlagManager.trackInteraction(flag)` method to track interaction events
- Added a deprecated method `Airship.channel.enableChannelCreation()` for app that are using delayed channel creation instead of privacy manager
- Added server side segmentation for feature flags
- Added support for Impression billing
- Removed the InboxMessage `isDeleted` property
- Fixed the InboxMessage `listIconUrl` on iOS

## Version 16.1.2 - October 23, 2023
Patch release that fixes an issue with `getActiveNotifications` on Android.

### Changes
- Fixed `getActiveNotifications` method on Android

## Version 16.1.1 - September 22, 2023
Patch release that updates the iOS SDK to 17.3.1 and fixes Channel Tag Editor for React Native old architecture.

### Changes
- Updated iOS SDK to 17.3.1
- Fixed `Airship.channel.editTags()` for React Native old architecture

## Version 16.1.0 - September 11, 2023
Minor release that updates the iOS SDK to 17.3.0 and Android SDK to 17.2.1. Also adds support for Airship Feature Flag feature and for Channel Tag Editor.

### Changes
- Updated iOS SDK to 17.3.0
- Updated Android SDK to 17.2.1
- Added support for Airship Feature Flag feature
- Added a new method `Airship.channel.editTags()`
 
## Version 16.0.1 - July 21, 2023
Patch release that updates the iOS and Android Airship SDK to 17.0.3.

### Changes
- Updated iOS SDK to 17.0.3
- Updated Android SDK to 17.0.3
- Fixed Android HMS module version

## Version 16.0.0 - June 27, 2023
Major release that updates the iOS & Android Airship SDK to 17.0.2. This release adds support for Stories, In-App experiences downstream of a sequence in Journeys, and improves SDK auth. The Airship SDK now requires iOS 14+ as the minimum deployment version and Xcode 14.3+.

[Migration Guide](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)

### Changes
- Updated iOS SDK to 17.0.2
- Updated Android SDK to 17.0.2
- Replaced NotificationOptInStatusEvent with NotificationStatusChangedEvent and iOS.AuthorizedNotificationSettingsChangedEvent
- Replaced the NotificationStatus with a new NotificationStatus that contains more details on the current state of push notifications


## Version 15.3.0 - June 14, 2023

Minor release that updates the iOS SDK to 16.12.1 and Android SDK to 16.11.1 and adds support for `autoPauseInAppAutomationOnLaunch` config option.

### Changes
- Updated iOS SDK to 16.12.1
- Updated Android SDK to 16.11.1
- Added support for **autoPauseInAppAutomationOnLaunch** config option.
- Fixed `MessageCenterUpdatedEvent#messageUnreadCount` property name on iOS

## Version 15.2.6 - May 17, 2023

Patch release that fixes an issue with delivering push received events on Android when the app has not been loaded. This
regression was introduced in 15.0.0, apps trying to process a push in the background should update.

### Changes
- Fixed push received events not delivering if the app is not loaded on Android

## Version 15.2.5 - May 3, 2023

Patch release that fixes an issue with modifying attributes on iOS. Apps that are using
15.0+ that modify attributes should update.

### Changes
- Fixed modifying attributes on iOS


## Version 15.2.4 - April 28, 2023

Patch release that fixes a issue with modifying attributes on Android and an issue with
`NotificationResponseEvent` not being received if a push with a deep link is opened. Apps that are using
15.0+ that modify attributes should update.

### Changes
- Fixed modifying attributes on Android
- Fixed issue with iOS not receiving subsequent NotificationResponseEvent

## Version 15.2.3 - April 18, 2023

Patch release that fixes a crash on Android when running an Android device older than 7. Apps that target API 23 or older should update.

### Changes
- Fixed Android crash due to using method `Map#putIfAbsent` on older Android devices.

## Version 15.2.2 - April 6, 2023

Patch release that fixes Android Preference Center subscription list state when switching named users.
Apps using Preference Center that apply multiple named user IDs during an app session on Android should update.

### Changes
- Updated Android Airship SDK to 16.9.2
- Fixed an Android bug that could cause locally cached subscription list states to be in an incorrect state when switching named users.

## Version 15.2.1 - March 24, 2023

Patch release that fixing Contact update merging order, improves Scene/Survey accessibility and reporting.

### Changes
- Updated iOS Airship SDK to 16.11.3
- Updated Android Airship SDK to 16.9.1
- Fixed Airship.contact.editSubscriptionLists() bindings call
- Fixed Contact update merge order, resolving a Preference Center bug that could lead to unexpected subscription states in some circumstances.
- Improved Scene/Survey accessibility and fixed a reporting bug related to form display events.
- Added support for transparent WebView backgrounds in HTML In-App Automations.

## Version 15.2.0 - March 3, 2023
Minor release that adds support for foreground presentation options per push message on iOS, and if a notification should display or not on Android.

### Changes
- Update iOS SDK to 16.11.2
- Update Android SDK to 16.9.0
- Added method `Airship.push.android.setForegroundDisplayPredicate` to control the display of notifications in the foreground per message on Android
- Added method `Airship.push.iOS.setForegroundPresentationOptionsCallback` to control the foreground presentation options per message on iOS
- Fixed return type for `Airship.push.getActiveNotifications`
- Fixed Android build issues when using Kotlin 1.6

## Version 15.1.1 - February 15, 2023
Patch release that fixes a gradle build issue with older React Native versions.

## Version 15.1.0 - February 9, 2023

Minor release that adds `subtitle` to the push payload that maps to the `summary` on Android and `subtitle` on iOS. It also fixes a bug with `trackScreen` that was introduced in 15.0.0.

### Changes
- Added `subtitle` to `PushPayload` type.
- Fixed `trackScreen` method error.

## Version 15.0.0 - February 3, 2023
Major release with several breaking changes. Apps should use the migration guide to update [Migration Guide](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)

### Changes
- Renamed package from `urbanairship-react-native` to `@ua/react-native-airship`
- Replaces `UrbanAirship` with `Airship` as the root instance.
- Grouped functional apis under new components under the Airship instance: Airship.channel, Airship.push, Airship.push.iOS, etc...
- Added support Turbo modules and Fabric
- Removed the Chat and Accengage module
- Merged Preference Center and HMS module into the core module
- Added new methods to pause/resume In-App experiences

## Version 14.6.1 - January 20, 2023
Patch release that updates the iOS SDK to 16.10.7, fixes the result of `getActiveNotifications` and avoiding issue in the Message Center on null message ID.

### Changes
- Updated iOS SDK to 16.10.7
- Fix android notifications extras on `getActiveNotifications` method call.
- Avoid Message Center issue on null message ID.

## Version 14.6.0 - December 5, 2022
Minor release that updates the iOS SDK to 16.10.6 and add support
for isChannelCaptureEnabled and suppressAllowListError in the config for takeOff.

### Changes
- Updated iOS SDK to 16.10.6
- Add support for **isChannelCaptureEnabled** and **suppressAllowListError** in the config for takeOff.


## Version 14.5.1 - November 17, 2022
Patch release that updates the iOS SDK to 16.10.3.

### Changes
- Updated iOS SDK to 16.10.3

## Version 14.5.0 - November 3, 2022

Minor release that adds support for custom Airship URLs and fixes
conflicts with common key chain plugins.

### Changes
- Updated iOS SDK to 16.10.1
- Updated Android SDK to 16.8.0
- Added support for custom domains
- Deprecated requireInitialRemoteConfigEnabled. This config is now enabled by default
- Fixed OOTB Message Center deep linking issue on first launch

## Version 14.4.4 - October 6, 2022
Patch release that adds support for setting the IAA message display interval.

### Changes
- Add `UrbanAirship.setInAppAutomationDisplayInterval()` method
- Updated Airship Android SDK to 16.7.5
- Updated Airship iOS SDK to 16.9.4

## Version 14.4.3 - September 9, 2022
Patch release that fixes an IAA banner issue and potential crashes on Android due to Message Center database migrations.

### Changes
- Fixed channel ID in channel registration event.
- Updated Airship Android SDK to 16.7.2
- Updated Airship iOS SDK to 16.9.3

## Version 14.4.2 - September 2, 2022
Patch release that fixes iOS notification actions on a cold launch. Applications running 14.1.0 or newer should update. 

### Changes
- Add launch method to set up Airship before `application:didFinishLaunching:` finishes
- Fixed type on authorizedStatus to be a string instead of an array
- Updated Airship Android SDK to 16.7.1
- Updated Airship iOS SDK to 16.9.2


## Version 14.4.1 - July 21, 2022
Patch release that fixes a crash on message center with poor connection.

## Version 14.4.0 - July 14, 2022
Minor release that updates the Airship SDKs.

### Changes
- Updated iOS SDK to 16.8.0
- Updated Android SDK to 16.6.1

## Version 14.3.1 - June 21, 2022
Patch release that fixes a crash on preferences. Also exposes unread inbox messages count.

## Version 14.3.0 - May 4, 2022
Minor release that updates Airship Android SDK to 16.4.0, and iOS SDK to 16.6.0. These SDK releases fix several issues with Scenes and Surveys. Apps using Scenes & Surveys should update.

- Added support for randomizing Survey responses.
- Added subscription list action.
- Updated localizations. All strings within the SDK are now localized in 48 different languages.
- Improved accessibility with OOTB Message Center UI.
- In-App rules will now attempt to refresh before displaying. This change should reduce the chances of showing out of data or cancelled in-app automations, scenes, or surveys when background refresh is disabled.
- Fixed reporting issue with a single page Scene.
- Fixed rendering issues for Scenes & Surveys.
- Fixed deep links that contain invalid characters by encoding those deep links.
- Fixed crash on Android 8 with Scenes & Surveys.
- Fixed Survey attribute storage on Android.


## Version 14.2.1 - April 26, 2022
Patch release that fixes a bug with notification response callback.

## Version 14.2.0 - April 15, 2022
Minor release that updates the iOS SDK to 16.5.1 and fixes issues with getSubscriptionList method on Android.

### Changes
- Updated iOS SDK to 16.5.1
- Fixed setting multiple listeners on iOS if the plugin is created multiple times.
- Fixed getSubscriptionList method on Android.


## Version 14.1.0 - March 16, 2022
Minor release that makes it possible to call takeOff from ReactNative.

### Changes
- Added takeOff and isFlying methods
- Takeoff is now optional
- Added appcompat and lifecycle dependencies to the module

## Version 14.0.0 - March 7, 2022
Major release that adds support for multi-channel Preference Center.

### Changes
- Updated iOS SDK to 16.4.0
- Updated Android SDK to 16.3.3
- Deprecated named user tag and attribute methods in favor of contact based ones
- Added scoped subscription lists to modify a subscription list on a contact
- Breaking Change: Updated AirshipPreferenceCenter.getConfiguration(identifier) to return the full config from Airship


## Version 13.2.1 - February 10, 2022
Patch release that fixes a crash on Android due to the React Native use of androidx.appcompat:appcompat library.

### Changes
- Fixes a crash due to the React Native use of androidx.appcompat:appcompat library

## Version 13.2.0 - February 9, 2022
Minor release that updates the Airship SDKs, adds some new methods and fixes some issues.

### Changes
- Updated iOS SDK to 16.2.0
- Updated Android SDK to 16.2.0
- Added a method `getSubscriptionLists` to get the subscription lists
- Added a method `setNotificationOptions` to set the notification options for iOS
- Added a method `getNotificationStatus` to get more context on the current state of notifications
- Fixed iOS message center display when `autoLaunchMessageCenter` is set to false
- Fixed the preference center config to return the items under the key `items`

## Version 13.1.1 - January 6, 2022
Minor release that updates to latest Airship SDKs and fixes several issues.

### Changes
- Updated iOS SDK to 16.1.2
- Updated Android SDK to 16.1.1
- Add missing subscriptionId to the preference center configuration
- Prevents a crash if takeOff fails

## Version 13.1.0 - December 2, 2021
Minor release that updates to latest Airship SDKs and fixes several issues with the iOS module.

### Changes
- Updated iOS SDK to 16.1.1
- Fixed Message Center navigation style on iOS 15
- Fixed running actions from a notification action button
- Fixed channel registration causing extra attribute operations in the RTDS stream

## Version 13.0.2 - November 16, 2021
Minor release that updates to latest Airship SDKs and fixes several issues with the iOS module. Apps running 13.0.0-13.0.1 should update.

### Changes
- Updated iOS and Android SDK to 16.1.0
- Fixed null deep link on iOS
- Fixed iOS crash when sending a notification without a title or subtitle
- Fixed Message Center message `isDeleted` flag on iOS

## Version 13.0.1 - November 5, 2021
Patch release that fixes preferences resetting when upgrading to SDK 15/16. This update will restore old preferences that have not been modified in the new SDK version.

**Apps that have migrated to 13.0.0 from an older version should update. Apps currently on version 12.1.0 and below should only migrate to 13.0.1 to avoid a bug in version 13.0.0.**

### Changes
- Updated iOS SDK to 16.0.2

## Version 13.0.0 - October 20, 2021

**Due to a bug that mishandles persisted SDK settings, apps that are migrating from plugin 12.1.0 or older should avoid this version and instead use 13.0.1 or newer.**

Major release to provide new features and include the latest iOS and Android SDKs. This version requires Xcode 13 for iOS and compileSdkVersion 31 and java 8 source compatibility for Android.

- Added urbanairship-preference-center-react-native module. 
- Remove urbanairship-location-react-native module.
- Added a sample preference center to the example app.
- Support overriding locale.
- Setup android:exported explicitly on all activities.
- Updated iOS SDK to 16.0.1
- Updated Android SDK to 16.0.0

## Version 12.1.0 - October 18, 2021
Minor release adding opt-in changes.

- Update the iOS method `isUserNotificationsOptedIn` to use the `UAPush` method.
- Add the new method `isSystemNotificationsEnabledForApp` to check if the app notifications are enabled at a system level or not.
- Add the new Android method `getNotificationChannelStatus` to get the status of the specified Notification Channel. The status can be: enabled, disabled, or unknown(if the channel id not created yet).

## Version 12.0.0 - August 23, 2021
Major release that adds support for new privacy manager flags and the live chat module.

- Updated iOS SDK to 14.6.1
- Updated Android SDK to 14.6.0
- Added missing `messageId` prop in the `MessageView`


## Version 11.0.2 - June 23, 2021
Patch release updating the iOS and Android SDKs to 14.4.2 and 14.4.4 respectively.

- Updated iOS SDK to 14.4.2
- Updated Android SDK to 14.4.4

## Version 11.0.1 - May 3, 2021
Patch release to fix NPE on Android when opening notifications. Any app using 11.0.0 should update.

- Fixed NPE on Android.

## Version 11.0.0 - March 25, 2021
Major release updating the iOS and Android SDKs to 14.3.0. This release contains small breaking changes to the event handling API, and also adds an extender to Android making it easier to modify the Airship instance during takeOff.

- Updated iOS SDK to 14.3.0
- Updated Android SDK to 14.3.0
- PushReceived and background NotificationResponse events are now triggered in the background on Android. To maintain UI thread safety, apps should now clean up any listeners that might modify the UI during `componentWillUnmount`.
- UrbanAirship.addListener now returns `Subscription` instead of `EmitterSubscription`
- Added AirshipExtender to Android to make it easier to modify the Airship instance during takeOff

## Version 10.0.2 - February 02, 2021
Patch release to fix some issues with setting attributes on a named user if the named user ID contains invalid URL characters. Applications using attributes with named users that possibly contain invalid URL characters should update.

- Updated iOS SDK to 14.2.2
- Fixed attributes updates when the named user has invalid URL characters.

## Version 10.0.1 - December 30, 2020
Patch release to fix an issue where the Airship SDK is not initialized before calls are made to the module if calls are made before application:didFinishLaunching. Applications that use plugins such as `react-native-splash-screen` and make calls to Airship before the splash screen is dismissed should update.

- Updated Android SDK to 14.1.1
- Updated iOS SDK to 14.2.1
- Ensure takeOff is called on iOS when the module is created

## Version 10.0.0 - December 18, 2020

Major release that updates the iOS Airship SDK to 14.2.0 and the Android SDK to 14.1.0. Xcode 12 is required for this version.

- Added better logging for default presentation options
- Changed InboxMessage.extras type from Map<string, string> to Record<string, string>
- Updated Android SDK to 14.1.0
- Updated iOS SDK to 14.2.0
- Fixed Xcode 12 compatibility
- firebaseMessagingVersion requires version 21.0.0+

## Version 9.0.1 - October 22, 2020
Patch release that updates the iOS and Android SDKs to 14.0.1, and fixes
a bug impacting foreground noitification options on iOS.

- Updated Android SDK to 14.0.1
- Updated iOS SDK to 14.0.1
- Fixed issue causing misinterpretation of iOS foreground notification options

## Version 9.0.0 - September 16, 2020
Major release that updates Airship Android and iOS SDK to 14.0. Starting with SDK 14, all landing page and external urls are tested against a URL allow list. The easiest way to go back to 13.x behavior is to add the wildcard symbol `*` to the array under the URLAllowListScopeOpenURL key in your AirshipConfig.plist for iOS, and `urlAllowListScopeOpenUrl = *` to the airshipconfig.properties on Android. Config for `whitelist` has been removed and replaced with:
-  iOS: `URLAllowList`, Android: `urlAllowList`
-  iOS: `URLAllowListScopeOpenURL`, Android: `urlAllowListScopeOpenUrl`
-  iOS: `URLAllowListScopeJavaScriptInterface`, Android: `urlAllowListScopeJavaScriptInterface`

## Version 8.1.0 - August 17, 2020
Minor release adding a `removeAllListeners` method, fixing a bug preventing the the location module from loading on android, and bundling the following SDK updates:

### iOS (Updated iOS SDK from 13.5.1 to 13.5.4)
- Addresses [Dynamic Type](https://developer.apple.com/documentation/uikit/uifont/scaling_fonts_automatically) build warnings and Message Center Inbox UI issues.
- Fixes a crash with Accengage data migration.
- Improves iOS 14 support and fixes In-App Automation issues.
For more details, see the [iOS CHANGELOG](https://github.com/urbanairship/ios-library/blob/13.5.4/CHANGELOG.md).

### Android (Updated Android SDK from 13.3.0 to 13.3.2)
- Fixes In-App Automation version triggers to only fire on app updates instead of new installs.
- Fixes ADM registration exceptions that occur on first run and text alignment issues with In-App Automation.
For more details, see the [Android CHANGELOG](https://github.com/urbanairship/android-library/blob/13.3.2/CHANGELOG.md).

## Version 8.0.1 - July 16, 2020
Patch release to fix package generation, common gradle file references and the example app.

- Fixed package generation
- Fixed common gradle file references
- Fixed example app

## Version 8.0.0 - July 8, 2020
Major release rewritten in TypeScript and adding separate modules for location,
HMS and Accengage features

- Added urbanairship-location-react-native module (iOS integration no longer needs AirshipLocationKit for location services.)
- Added urbanairship-hms-react-native module
- Added urbanairship-accengage-react-native module
- Added full TypeScript coverage
- Removed Flow
- Updated iOS SDK to 13.5.0
- Updated Android SDK to 13.2.1

## Version 7.0.0 - May 27, 2020
Major release to provide new features and include the latest iOS and Android SDKs.

- Added support for JSON properties on custom events.
- Added support for date attributes.
- Added support for named user attributes.
- Added a sample message center screen to the example app.
- Added missing Typescript definitions for new APIs.
- Updated iOS SDK to 13.3.2
- Updated Android SDK to 13.1.2

## Version 6.1.3 - March 23, 2020
Patch addressing a regression in iOS SDK 13.1.0 causing channel tag loss
when upgrading from iOS SDK versions prior to 13.0.1. Apps upgrading from react-native module
version 5.0.1 or below should avoid plugin versions 6.1.0 through 6.1.2 in favor of version 6.1.3.

- Updated iOS SDK to 13.1.1

## Version 6.1.2 - March 12, 2020
Patch release to fix IAA Youtube video display on Android.

### Changes
- Updated Android SDK to 12.2.2

## Version 6.1.1 - February 25, 2020
Patch release enabling monorepo project structure.
Example app dependencies have been moved from the module's
package.json to the example app. These include:

- react-native-gesture-handler
- react-native-reanimated
- react-native-screens
- react-navigation
- react-navigation-tabs

iOS and Android SDKs remain at 13.1.0 and 12.2.0, respectively.

## Version 6.1.0 - February 21, 2020
- Updated iOS SDK to 13.1.0
- Updated Android SDK to 12.2.0
- Added number attributes support for iOS and Android
- Added data collection controls for iOS and Android
- Added screen tracking for iOS and Android

### Changes
- Fixed npm configuration to include a required script.

## Version 6.0.1 - January 3, 2020
Patch release to fix an issue causing a necessary script to be
excluded from the npm package. Applications using 6.0.0 should update.

### Changes
- Fixed npm configuration to include a required script.

## Version 6.0.0 - December 31, 2019
Major release to update iOS to modularized SDK 13.0.4, update Android SDK to 12.1.0,
add cross-platform attribute support and modernize the Message Center Javascript
and Typescript interfaces.

### Changes
- Updated iOS SDK to 13.0.4
- Updated Android SDK to 12.1.0
- Added attributes support
- Updated Message Center interfaces to reflect the removal of overlay Message Center views

## Version 5.0.1 - December 9, 2019
Patch release to fix a bug affecting loss of tags on iOS during app
migration to plugin 5.0.0. This patch release fixes the bug
by combining previous tags with tags that have been set since
the update to 5.0.0. Applications using 5.0.0 should update.

### Changes
- Updated iOS SDK to 12.1.2

## Version 5.0.0 - October 16, 2019
- Updated iOS SDK to 12.0.0
- Updated iOS minimum deployment target to 11.0

## Version 4.0.2 - September 3, 2019
- Updated Android SDK to 11.0.4.
- Updated iOS SDK to 11.1.2.
- Fixed display issues with UAMessageView.

## Version 3.2.2 - September 3, 2019
- Updated Android SDK to 10.1.2.
- Fixed display issues with UAMessageView.

## Version 4.0.1 - August 9, 2019
- Updated Android SDK to 11.0.3.

## Version 3.2.1 - August 9, 2019
- Updated Android SDK to 10.1.1

## Version 4.0.0 - August 1, 2019
- Updated Android SDK to 11.0.2.
- Requires ReactNative version to 0.6

## Version 3.2.0 - August 1, 2019
- Fixed `isDeleted` erroneously being set to true for iOS inbox messages.
- Displaying an inbox message will now refresh the message listing if the inbox is out of date.
- Added UAMessageView to display an inbox message within the React Native view.
- Updated Android SDK to 10.1.0
- Updated iOS SDK to 11.1.1

## Version 3.1.2 - July 24, 2019
- Fixed crash on iOS when calling `displayMessage` without the second optional parameter.
- Fixed not marking a message as read on iOS when calling `displayMessage` in an overlay.

## Version 3.1.1 - July 15, 2019
- Fixed package including a .git directory in the release.

## Version 3.1.0 - July 12, 2019
- Added the ability to do delayed channel registration.
- Added podspec for iOS cocoapod integration.

## Version 3.0.0 - June 14, 2019
- Updated iOS SDK to 11.0.0.
- Updated Android SDK to 10.0.1.
- iOS integration now requires AirshipLocationKit for location services.
- Added ability to configure android notification options.

## Version 2.2.1 - March 14, 2019
Fixed a security issue within Android Urban Airship SDK, that could allow trusted
URL redirects in certain edge cases. All applications that are using
urbanairship-react-native version 1.4.0 - 2.2.0 on Android should update as soon as possible.
For more details, please email security@urbanairship.com.

## Version 2.2.0 - December 7, 2018
- Updated Android SDK to 9.6.0.
- Android now requires compiling against API 28 (compileSdkVersion 28)
- Firebase core and messaging dependency versions can be overridden with `firebaseMessagingVersion` and `firebaseCoreVersion` gradle properties.
- Updated the sample to use latest React Native.

## Version 2.1.3 - November 20, 2018
- Updated Android SDK to 9.5.6.

## Version 2.1.2 - November 14, 2018
- Updated Android SDK to 9.5.5.
- Updated iOS SDK to 10.0.3.

## Version 2.1.1 - October 1, 2018
- Reverted Android firebase-core dependency back to 16.0.1 to avoid bug in 16.0.3.

## Version 2.1.0 - September 20, 2018
- Added support for enabling notifications with a resulting promise.
- Fixed iOS event addition bug.
- Updated Android SDK to 9.5.2.
- Updated iOS SDK to 10.0.0.

## Version 2.0.3 - October 1, 2018
- Fixed iOS pending event (backported from 2.1.0).
- Updated Android SDK to 9.5.2.

## Version 2.0.2 - September 5, 2018
- Fixed Android pending events.
- Updated Android SDK to 9.5.0.
- Updated recommmended iOS SDK to 9.4.0.
- Updated header search paths for ExpoKit.

## Version 2.0.1 - July 30, 2018
- Fixed firebase-core dependency (now 16.0.1)

## Version 2.0.0 - July 27, 2018
- Added support for authorized notification settings on iOS
- Android SDK now defaults to FCM, and depends on firebase-core
- Updated iOS SDK to 9.3.3
- Update Android SDK to 9.4.1

## Version 1.6.2 - April 20, 2018
- Remove use of AsyncTaskCompat to be compatible with Android Support Library 27

## Version 1.6.1 - April 3, 2018
- Fixed search paths for Carthage build
- Updated Urban Airship Android SDK to 9.0.6
- Updated Urban Airship iOS SDK to 9.0.5
- Removed android:theme from CustomMessageCenterActivity and CustomMessageActivity, so developers can customize the Message Center.

## Version 1.6.0 - March 14, 2018
- Updated Urban Airship Android SDK to 9.0.3
- Added method to disable the iOS plugin integration at runtime

## Version 1.5.0 - March 5, 2018
- Updated Urban Airship iOS SDK to 9.0.3
- Updated Urban Airship Android SDK to 9.0.2
- Added method to get the current registration token
- Added show inbox event when disabling the default message center
- Allow clearing named user with an empty string

## Version 1.4.2 - February 13, 2018
- Updated Urban Airship Android SDK to 9.0.1
- Fixed compatibility issues with Android SDK 9.0

## Version 1.4.1 - February 12, 2018
- Updated Urban Airship iOS SDK to 9.0.2
- Fixed compatibility issues with iOS SDK 9.0

## Version 1.4.0 - February 7, 2018
- Updated Urban Airship iOS SDK to 9.0.1
- Updated Urban Airship Android SDK to 9.0.0

## Version 1.3.2 - January 29, 2018
- Fixed a bug in Android that caused delayed event emission.

## Version 1.3.1 - December 22, 2017
- Fixed bug in iOS that caused message center to launch with auto launch disabled.

## Version 1.3.0 - November 15, 2017
- Added APIs to manage active notifications.

## Version 1.2.3 - October 30, 2017
- Changed Android Message Center title to be "Message Center" instead of the app name
- Updated Urban Airship Android SDK to 8.9.4

## Version 1.2.2 - September 15, 2017
- Fixed Airship library linking
- Fixed iOS deep linking on cold start

## Version 1.2.1 - September 11, 2017
- Added support for React Native >=.47
- Fixed quiet time

## Version 1.2.0 - August 18, 2017
- Added support for dismissing messages from outside the Message Center
- Added support for Carthage
- Updated Urban Airship Android SDK to 8.8.2
- Fixed opt-in events to be more responsive to authorization status changes

## Version 1.1.0 - June 21, 2017
- Added Message Center support
- Added iOS badge support
- Updated Urban Airship Android SDK to 8.6.0 (Android O support)
- Fixed optIn flag on the notificationOptInStatus event on Android

## Version 1.0.3 - June 5, 2017
- Fixed addCustomEvent on iOS

## Version 1.0.2 - May 24, 2017
- Fixed crash when calling removeListener

## Version 1.0.1 - May 23, 2017
- Updated Android and iOS Urban Airship SDK dependencies

## Version 1.0.0 - May 16, 2017
 - Initial release

# Airship React Native Module 23.x Changelog

[Migration Guides](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)
[All Releases](https://github.com/urbanairship/react-native-airship/releases)

## Version 23.6.0 - September 17, 2025

Minor release that updates the Android SDK to 19.13.1 and the iOS SDK to 19.9.2.

### Changes
- Updated Android SDK to [19.13.1](https://github.com/urbanairship/android-library/releases/tag/19.13.1)
- Updated iOS SDK to [19.9.2](https://github.com/urbanairship/ios-library/releases/tag/19.9.2)

## Version 23.5.1 - August 19, 2025
Patch release with several bug fixes for Scenes, including an important reporting fix for embedded content.

### Changes
- Updated Android SDK to [19.10.2](https://github.com/urbanairship/android-library/releases/tag/19.10.2)
- Updated iOS SDK to [19.8.2](https://github.com/urbanairship/ios-library/releases/tag/19.8.2)

## Version 23.5.0 - July 26, 2025
Minor release that adds support for Android log privacy level configuration and updates the Android SDK to 19.9.1 and the iOS SDK to 19.6.1.

The **23.x branch** is now considered **End of Cycle**. This branch supports React Native 0.78.x, which is no longer actively supported by the React Native team.

### Changes
- Updated Android SDK to [19.9.1](https://github.com/urbanairship/android-library/releases/tag/19.9.1)
- Updated iOS SDK to [19.6.1](https://github.com/urbanairship/ios-library/releases/tag/19.6.1)
- Added Android `logPrivacyLevel` configuration support
- Fixed issue with push received pushes when disabling headless JS task before the module initializes


## Version 23.4.0 - May 23, 2025
Minor release focused on performance improvements for Scenes.

### Changes
- Updated Android SDK to [19.8.0](https://github.com/urbanairship/android-library/releases/tag/19.8.0)
- Updated iOS SDK to [19.5.0](https://github.com/urbanairship/ios-library/releases/tag/19.5.0)

## Version 23.3.0 - May 15, 2025
Minor release that adds support for using Feature Flags as an audience condition for other Feature Flags and Vimeo videos in Scenes.

### Changes
- Added support for using Feature Flags as an audience condition for other Feature Flags.
- Added support for Vimeo videos in Scenes.
- Updated Android SDK to [19.7.0](https://github.com/urbanairship/android-library/releases/tag/19.7.0)
- Updated iOS SDK to [19.4.0](https://github.com/urbanairship/ios-library/releases/tag/19.4.0)

## Version 23.2.1 - May 9, 2025
Patch release with several bug fixes for iOS.

### Changes
- Fixed `Airship.preferenceCenter.getConfig(preferenceCenterId)` on iOS
- Updated iOS SDK to [19.3.2](https://github.com/urbanairship/ios-library/releases/tag/19.3.2)

## Version 23.2.0 - May 1, 2025
Minor release that updates the Android SDK to 19.6.2 and the iOS SDK to 19.3.1.

### Changes
- Updated Android SDK to [19.6.2](https://github.com/urbanairship/android-library/releases/tag/19.6.2)
- Updated iOS SDK to [19.3.1](https://github.com/urbanairship/ios-library/releases/tag/19.3.1)
- Added support for JSON attributes
- Added new method `Airship.channel.waitForChannelId()` that waits for the channel ID to be created

## Version 23.1.1 - April 18, 2025

Patch release that updates the Android SDK to 19.5.1 and the iOS SDK to 19.2.1

### Changes
- Updated Android SDK to [19.5.1](https://github.com/urbanairship/android-library/releases/tag/19.5.1)
- Updated iOS SDK to [19.2.1](https://github.com/urbanairship/ios-library/releases/tag/19.2.1)

## Version 23.1.0 - April 8, 2025
Minor release that updates the iOS SDK to 19.2.0 and remove commonjs in favor of ECM only to avoid [dual package hazard](https://nodejs.org/docs/latest-v19.x/api/packages.html#dual-package-hazard).  

### Changes
- Updated iOS SDK to [19.2.0](https://github.com/urbanairship/ios-library/releases/tag/19.2.0)
- Drops commonjs package
- Adds back `types` to package.json for apps that are having troubles discovering type definitions
- Fixed null notification in Airship.push.iOS.setForegroundPresentationOptionsCallback

## Version 23.0.0 - March 31, 2025
Major release that updates the Android SDK to 19.5.0 and the iOS SDK to 19.1.2. 

The only breaking change is related to the native plugin hooks, which make it easier
to integrate the plugin with hybrid apps. Most applications won't be affected.

### Changes
- Updated Android SDK to [19.5.0](https://github.com/urbanairship/android-library/releases/tag/19.5.0)
- Updated iOS SDK to [19.1.2](https://github.com/urbanairship/ios-library/releases/tag/19.1.2)
- Updated the native plugin hooks on Android:
  - Renamed the class `AirshipPluginForwardListeners` to `AirshipPluginExtenders`
  - Renamed `AirshipPluginForwardListeners.notificationListener` to `AirshipPluginExtenders.forwardNotificationListner`
  - Replaced `AirshipPluginForwardDelegates.deepLinkListener` with `AirshipPluginExtenders.onDeepLink`
  - Added `AirshipPluginExtenders.onShouldDisplayForegroundNotification` to allow overriding foreground notification display behavior
- Updated the native plugin hooks on iOS:
  - Renamed the class `AirshipPluginForwardDelegates` to `AirshipPluginExtenders`
  - Renamed `AirshipPluginForwardDelegates.pushNotificationDelegate` to `AirshipPluginExtenders.pushNotificationForwardDelegate`. The delegate must now implement
    the protocol `AirshipPluginPushNotificationDelegate` which is the same as `PushNotificationDelegate` but without the `extendPresentationOptions` method.
  - Renamed `AirshipPluginForwardDelegates.registrationDelegate` to `AirshipPluginExtenders.registrationForwardDelegate`
  - Replaced `AirshipPluginForwardDelegates.deepLinkDelegate` with `AirshipPluginExtenders.onDeepLink`
  - Added `AirshipPluginExtenders.onWillPresentForegroundNotification` to allow overriding foreground notification display behavior

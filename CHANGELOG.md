# Airship React Native Module 21.x Changelog

[Migration Guides](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)

[All Releases](https://github.com/urbanairship/react-native-airship/releases)

## Version 21.8.0 - July 25, 2025
Minor release that adds support for Android log privacy level configuration and updates the Android SDK to 19.9.1 and the iOS SDK to 19.6.1.

### Changes
- Updated Android SDK to [19.9.1](https://github.com/urbanairship/android-library/releases/tag/19.9.1)
- Updated iOS SDK to [19.6.1](https://github.com/urbanairship/ios-library/releases/tag/19.6.1)
- Added Android `logPrivacyLevel` configuration support

## Version 21.7.0 - May 23, 2025
Minor release focused on performance improvements for Scenes.

### Changes
- Updated Android SDK to [19.8.0](https://github.com/urbanairship/android-library/releases/tag/19.8.0)
- Updated iOS SDK to [19.5.0](https://github.com/urbanairship/ios-library/releases/tag/19.5.0)

## Version 21.6.0 - May 15, 2025
Minor release that adds support for using Feature Flags as an audience condition for other Feature Flags and Vimeo videos in Scenes.

### Changes
- Added support for using Feature Flags as an audience condition for other Feature Flags.
- Added support for Vimeo videos in Scenes.
- Updated Android SDK to [19.7.0](https://github.com/urbanairship/android-library/releases/tag/19.7.0)
- Updated iOS SDK to [19.4.0](https://github.com/urbanairship/ios-library/releases/tag/19.4.0)

## Version 21.5.1 - May 9, 2025
Patch release with several bug fixes for iOS.

### Changes
- Fixed `Airship.preferenceCenter.getConfig(preferenceCenterId)` on iOS
- Updated iOS SDK to [19.3.2](https://github.com/urbanairship/ios-library/releases/tag/19.3.2)


## Version 21.5.0 - May 1, 2025
Minor release that updates the Android SDK to 19.6.2 and the iOS SDK to 19.3.1.

### Changes
- Updated Android SDK to [19.6.2](https://github.com/urbanairship/android-library/releases/tag/19.6.2)
- Updated iOS SDK to [19.3.1](https://github.com/urbanairship/ios-library/releases/tag/19.3.1)
- Added support for JSON attributes
- Added new method `Airship.channel.waitForChannelId()` that waits for the channel ID to be created

## Version 21.4.1 - April 7, 2025
Patch release to fix the notification being null in `Airship.push.iOS.setForegroundPresentationOptionsCallback`.

### Changes
- Fixed null notification in `Airship.push.iOS.setForegroundPresentationOptionsCallback`

## Version 21.4.0 - April 3, 2025
Minor release that updates the iOS SDK to 19.2.0 and backports the new `AirshipPluginExtensions`.

### Changes
- Updated iOS SDK to [19.2.0](https://github.com/urbanairship/ios-library/releases/tag/19.2.0)
- Backported `AirshipPluginExtensions` from 23.0.0
- Deprecated `AirshipPluginForwardListeners` and `AirshipPluginForwardDelegates`

## Version 21.3.0 - April 1, 2025
Minor release that updates the Android SDK to 19.5.0 and the iOS SDK to 19.1.2.

### Changes
- Updated Android SDK to [19.5.0](https://github.com/urbanairship/android-library/releases/tag/19.5.0)
- Updated iOS SDK to [19.1.2](https://github.com/urbanairship/ios-library/releases/tag/19.1.2)

## Version 21.2.0 - February 24, 2025
Minor release that updates the Android SDK to 19.2.0 and the iOS SDK to 19.1.0.

### Changes
- Updated Android SDK to [19.2.0](https://github.com/urbanairship/android-library/releases/tag/19.2.0)
- Updated iOS SDK to [19.1.0](https://github.com/urbanairship/ios-library/releases/tag/19.1.0)

## Version 21.1.0 - February 12, 2025
Minor release that updates the Android SDK to 19.1.0 and fixes the `messageUnreadCount` on the `MessageCenterUpdated` event.

### Changes
- Updated Android SDK to [19.1.0](https://github.com/urbanairship/android-library/releases/tag/19.1.0)
- Fixed MessageCenterUpdatedEvent.messageUnreadCount on iOS.

## Version 21.0.2 - February 6, 2025

Patch release that updates the iOS SDK to 19.0.3 and fixes a Swift 5 warning.

### Changes
- Updated iOS SDK to [19.0.3](https://github.com/urbanairship/ios-library/releases/tag/19.0.3)

## Version 21.0.1 - February 3, 2025

Patch release that updates the iOS SDK to 19.0.2

### Changes
- Updated iOS SDK to [19.0.2](https://github.com/urbanairship/ios-library/releases/tag/19.0.2)

## Version 21.0.0 - January 24, 2025
Major release that updates the native SDKs to 19.0.0.

### Changes
- Updated Android SDK to [19.0.0](https://github.com/urbanairship/android-library/releases/tag/19.0.0).
- Updated iOS SDK to [19.0.0](https://github.com/urbanairship/ios-library/releases/tag/19.0.0).
- Xcode 16.2+ is required.
- Updated min version to iOS 15+ & Android 23+.
- Added manifest entry to disable the headless JS service when a background push is received before the module is loaded. This is not recommended to use unless its conflicting with a hybrid application. To disable the task, set the metadata entry to false for key `"com.urbanairship.reactnative.ALLOW_HEADLESS_JS_TASK_BEFORE_MODULE"`.

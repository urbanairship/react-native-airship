# React Native Module Changelog

[Migration Guides](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)
[All Releases](https://github.com/urbanairship/react-native-airship/releases)

## Version 24.5.1 - August 19, 2025
Patch release with several bug fixes for Scenes, including an important reporting fix for embedded content.

### Changes
- Updated Android SDK to [19.10.2](https://github.com/urbanairship/android-library/releases/tag/19.10.2)
- Updated iOS SDK to [19.8.2](https://github.com/urbanairship/ios-library/releases/tag/19.8.2)


## Version 24.5.0 - July 31, 2025
Minor release that updates the Android SDK to 19.10.0 and the iOS SDK to 19.7.0

### Changes
- Updated Android SDK to [19.10.0](https://github.com/urbanairship/android-library/releases/tag/19.10.0)
- Updated iOS SDK to [19.7.0](https://github.com/urbanairship/ios-library/releases/tag/19.7.0)

## Version 24.4.0 - June 25, 2025
Minor release that updates the Android SDK to 19.9.1 and the iOS SDK to 19.6.1

### Changes
- Updated Android SDK to [19.9.1](https://github.com/urbanairship/android-library/releases/tag/19.9.1
- Updated iOS SDK to [19.6.1](https://github.com/urbanairship/ios-library/releases/tag/19.6.1
- Added Android `logPrivacyLevel` configuration support
- Fixed issue with push received pushes when disabling headless JS task before the module initializes

## Version 24.3.0 - May 23, 2025
Minor release focused on performance improvements for Scenes.

### Changes
- Updated Android SDK to [19.8.0](https://github.com/urbanairship/android-library/releases/tag/19.8.0)
- Updated iOS SDK to [19.5.0](https://github.com/urbanairship/ios-library/releases/tag/19.5.0)

## Version 24.2.0 - May 15, 2025
Minor release that adds support for using Feature Flags as an audience condition for other Feature Flags and Vimeo videos in Scenes.

### Changes
- Added support for using Feature Flags as an audience condition for other Feature Flags.
- Added support for Vimeo videos in Scenes.
- Updated Android SDK to [19.7.0](https://github.com/urbanairship/android-library/releases/tag/19.7.0)
- Updated iOS SDK to [19.4.0](https://github.com/urbanairship/ios-library/releases/tag/19.4.0)

## Version 24.1.1 - May 9, 2025
Patch release with several bug fixes for iOS.

### Changes
- Fixed `Airship.preferenceCenter.getConfig(preferenceCenterId)` on iOS
- Updated iOS SDK to [19.3.2](https://github.com/urbanairship/ios-library/releases/tag/19.3.2)

## Version 24.1.0 - May 1, 2025
Minor release that updates the Android SDK to 19.6.2 and the iOS SDK to 19.3.1. 

### Changes
- Updated Android SDK to [19.6.2](https://github.com/urbanairship/android-library/releases/tag/19.6.2)
- Updated iOS SDK to [19.3.1](https://github.com/urbanairship/ios-library/releases/tag/19.3.1)
- Added support for JSON attributes
- Added new method `Airship.channel.waitForChannelId()` that waits for the channel ID to be created

## Version 24.0.0 - April 18, 2025
Major release to support React Native 0.79.

### Changes
- Added support for React Native 0.79

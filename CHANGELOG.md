# React Native Module 26.0.0 Changelog

## Version 26.1.0 - January 20, 2026

Minor release that includes accessibility improvements for Message Center and fixes a potential crash on Android.

### Changes
- Updated Android SDK to [20.1.1](https://github.com/urbanairship/android-library/releases/tag/20.1.1)
- Updated iOS SDK to [20.1.1](https://github.com/urbanairship/ios-library/releases/tag/20.1.1)
- Fixed a potential crash in Android Scenes with specific image and display settings.
- Improved VoiceOver focus handling for Message Center on iOS.
- Fixed an issue where the Message Center title was not being marked as a heading on Android.


[Migration Guide](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md)

## Version 26.0.0 - December 8, 2025

This major release updates the native Airship SDKs to 20.0 and adds support for React Native 0.82+. It includes breaking changes—primarily affecting build configurations and native customizations—as well as an updated support policy. For detailed upgrade instructions, please consult the [Migration Guide](https://github.com/urbanairship/react-native-airship/blob/main/MIGRATION.md).

### Changes
- Updated Android SDK to [20.0.4](https://github.com/urbanairship/android-library/releases/tag/20.0.4)
- Updated iOS SDK to [20.0.2](https://github.com/urbanairship/ios-library/releases/tag/20.0.2)
- Added support for React Native 0.82+
- Updated minimum iOS deployment target to 16.0
- Xcode 26+ is now required
- Removed deprecated `AirshipExtender` on Android
- Removed deprecated forward listener/delegate interfaces
- Removed support for React Native old architecture
- Removed pre-generated code from the package

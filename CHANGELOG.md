# React Native Module 26.0.0 Changelog

## Version 26.1.0 - January 15, 2026

Patch release that updates the Android and iOS SDKs, bringing several improvements and fixes to Scenes.

### Changes
- Updated Android SDK to [20.1.0](https://github.com/urbanairship/android-library/releases/tag/20.1.0)
- Updated iOS SDK to [20.0.3](https://github.com/urbanairship/ios-library/releases/tag/20.0.3)
- Added support for additional text styles, highlight markdown, and Story controls in Scenes on Android.
- Fixed an issue with keyboard safe area handling in Scenes on iOS.


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

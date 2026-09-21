# React Native Module 27.0.0 Changelog

## Version 27.0.0 - September 21, 2026

Major release that adds experimental Swift Package Manager support on iOS, updates the native Airship SDKs to 21.x, and raises platform requirements. See [MIGRATION.md](MIGRATION.md) for upgrade details.

### Changes
- Added experimental Swift Package Manager support for React Native 0.87+'s SwiftPM integration (`npx react-native spm`); CocoaPods remains the default integration
- Updated Android SDK to [21.0.2](https://github.com/urbanairship/android-library/releases/tag/21.0.2)
- Updated iOS SDK to [21.0.2](https://github.com/urbanairship/ios-library/releases/tag/21.0.2)
- Raised the minimum supported React Native version to 0.85.0
- Raised the minimum supported Android SDK to 26
- iOS: CocoaPods integration now requires `use_frameworks! :linkage => :dynamic` in your Podfile, since the Airship SDK dependency is pulled in through React Native's CocoaPods+SPM bridge rather than a published pod
- iOS: Xcode 27+ is now required to build the SDK

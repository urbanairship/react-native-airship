# Migration Guide

## 21.x - 25.x to 26.0.0

Airship React Native module 26.0.0 updates the native Airship SDKs to version 20.0, adds support for React Native 0.82+, and raises the minimum supported iOS version to 16.0.

### Package Changes
- **React Native**: 0.82+ is now required.
- **Native SDKs**: Updated to 20.x on iOS and Android.
- **Codegen**: Pre-generated code is no longer shipped. Code generation now occurs at build time.

#### iOS Requirements
- **Xcode**: 26+ is now required.
- **iOS Deployment Target**: 16.0+ is now required.

#### Android Requirements
- **Java**: JDK 17 is required for Android builds.
- **Kotlin**: Kotlin 2.2.20+ is recommended. Ensure your project's Kotlin version is compatible.

### iOS Migration 
Most applications will not be affected by these changes. They only apply to applications that have implemented native extensions or customizations to the Airship SDK.

#### Airship SDK 20
- [iOS Migration Guide](https://github.com/urbanairship/ios-library/blob/main/Documentation/Migration/migration-guide-19-20.md): Detailed guide for migrating native iOS code from Airship SDK 19.x to 20.0.

#### Deprecated Forward Delegate Removal
The `AirshipPluginForwardDelegates` class has been removed. Applications should instead use `AirshipPluginExtensions` to register listeners or overrides.

### Android Migration
Most applications will not be affected by these changes. They only apply to applications that have implemented native extensions or customizations to the Airship SDK.

#### Airship SDK 20
- [Android Migration Guide](https://github.com/urbanairship/android-library/blob/main/documentation/migration/migration-guide-19-20.md): Detailed guide for migrating native Android code from Airship SDK 19.x to 20.0.

#### Deprecated AirshipExtender Removal
The `com.urbanairship.reactnative.AirshipExtender` class has been removed. Applications should instead implement `com.urbanairship.android.framework.proxy.AirshipPluginExtender`. The `onReady` method has been replaced by `onAirshipReady(Context context)`.

The `AndroidManifest.xml` entry must also be updated. The previous meta-data name `com.urbanairship.reactnative.AIRSHIP_EXTENDER` must be replaced with `com.urbanairship.plugin.extender`:
```xml
<meta-data
    android:name="com.urbanairship.plugin.extender"
    android:value="YOUR_EXTENDER_CLASS" />
```

#### Deprecated Forward Listener Removal
The `AirshipPluginForwardListeners` class has been removed. Applications should instead use `com.urbanairship.android.framework.proxy.AirshipPluginExtensions` to register listeners or overrides.
- `AirshipPluginExtensions.forwardNotificationListener`
- `AirshipPluginExtensions.onDeepLink`
- `AirshipPluginExtensions.onShouldDisplayForegroundNotification`

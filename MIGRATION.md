# Migration Guide

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

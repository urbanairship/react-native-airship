
# ReactNativeUA Migration Guide

Migration guide for `react-native-ua` to `react-native-urbanairship`.

## Android react-native-ua removal

1) Remove the `react-native-ua` module: `npm uninstall react-native-ua`

2) Remove the entry for `react-native-ua` from `android/settings.gradle`:
```
include ':react-native-ua'
project(':react-native-ua').projectDir = file('../node_modules/react-native-ua/android')
```

3) Remove the entry for `react-native-ua` in the `android/app/build.gradle`
```
dependencies {
    compile project(':react-native-ua')
}
```

4) Remove `ReactNativeUAPackage` from the `MainApplication.java`.
```
public class MainApplication extends Application implements ReactApplication {
    @Override
    protected List<ReactPackage> getPackages() {
        return Arrays.<ReactPackage>asList(
            // ...
            new ReactNativeUAPackage()
        );
    }
}
```

## iOS react-native-ua removal

1) Remove reference to `ReactNativeUAIOS.xcodeproj` in the xcode project.

2) Open the Build Phase tab for the app's target
 - Remove reference to `libReactNativeUAIOS.a` in the _Link Binary With Libraries_
 - Remove reference to `AirshipResources.bundle` in the _Copy Bundle Resources_

3) Remove calls to `ReactNativeUAIOS` in the `AppDelegate.m` file

## Install urbanairship-react-native

Follow [React Native Guide](https://docs.urbanairship.com/platform/react-native/) to install
the `urbanairship-react-native` module.


## Import the module

```
import {
  UrbanAirship,
  UACustomEvent,
} from 'urbanairship-react-native'
```

## Direct method replacements

ReactNativeUA methods                               |  UrbanAirship methods
--------------------------------------------------- | ---------------------------------------------
static enable_notification()                        | static setUserNotificationsEnabled(true)
static disable_notification()                       | static setUserNotificationsEnabled(false)
static are_notifications_enabled(Function): Promise | static isUserNotificationsEnabled(): Promise
static enable_geolocation()                         | static setLocationEnabled(enabled: boolean)
static add_tag(tag: string)                         | static addTag(tag: string)
static remove_tag(tag: string)                      | static removeTag(tag: string
static set_quiet_time(time: Object)                 | static setQuietTime(time: Object)
static set_quiet_time_enabled(enabled: boolean)     | static setQuietTimeEnabled(enabled: boolean)
static set_quiet_time_enabled(enabled: boolean)     | static setQuietTimeEnabled(enabled: boolean)
static get_channel_id(Function): Promise            | static getChannelId(): Promise
static set_named_user_id(namedUserId: ?string)      | static setNamedUser(namedUserId: ?string)

### Notification Events

The biggest difference between the two libraries is how the notification events
are exposed. `ReactNativeUA.on_notification(listener: Function)` exposes the
event name in the event passed to the function, while `UrbanAirship.addListener(eventName: string, listener: Function)`
requires specifying the event name when adding the listener. `UrbanAirship` also
defines a different event structure depending on if its an event from
`pushReceived` vs `notificationResponse`.

#### Event objects

`notificationResponse`:
   - *actionId*: Optional. Only available if the user tapped a notification action button.
   - *isForeground*: If the user tapped a notification action button with "background" activation mode, will be false. Otherwise the value is always true.
   - *notification.alert*: Optional. The notification alert.
   - *notification.title*: Optional. The notification title.
   - *notification.extras*: The raw notification payload.

`pushReceived`:
  - *alert*: Optional. The notification alert.
  - *title*: Optional. The notification title.
  - *extras*: The raw notification payload.

#### Event name map

ReactNativeUA event                                 |  UrbanAirship event
--------------------------------------------------- |---------------------
launchedFromNotification                            | notificationResponse
launchedFromNotificationActionButton                | notificationResponse
receivedBackgroundNotificationActionButton          | notificationResponse
receivedForegroundNotification                      | pushReceived

### ReactNativeUA's enable_action_url/disable_action_url

There is no replacement for `ReactNativeUA.enable_action_url()` and `ReactNativeUA.disable_action_url()`.
Applications that rely on this behavior should use deep links instead of external urls. When a deep link
is received on the device, `UrbanAirship` will send a deep link event:

```
UrbanAirship.addListener("deepLink", (event) => {
  alert("deepLink: " + event.deepLink);
});
```

### ReactNativeUA's handle_background_notification

This method is no longer needed. The `notificationResponse` will not fire until
after the application has had a chance to add a listener.

### Android icons

Configure the Android app icon and accent color by modifying the `airshipconfig.properties` file:

```
# Notification customization
notificationIcon = ic_notification
notificationAccentColor = #00698f
```

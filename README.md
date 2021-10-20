# Airship React Native

A React Native module for Airship's iOS and Android SDK.

### Resources

* [Getting started guide](http://docs.airship.com/platform/react-native/)
* [API docs](http://docs.airship.com/reference/libraries/react-native/latest/index.html)

### Issues

Please visit https://support.airship.com/ for any issues integrating or using this module.

### Requirements:
 - Xcode 13+
 - iOS: Deployment target 11.0+
 - Android: minSdkVersion 21+, compileSdkVersion 31+
 - React Native >= 0.60.0
 - React Native cli >= 2.0.1

## Install

```
# using yarn
yarn add urbanairship-react-native

# using npm
npm install urbanairship-react-native --save
```

## iOS Setup

1) Install pods
```
cd ios && pod install
```

2) Add the following capabilities for your application target:
  - Push Notification
  - Background Modes > Remote Notifications

3) Create a plist `AirshipConfig.plist` and include it in your application’s target:
```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>developmentAppKey</key>
  <string>Your Development App Key</string>
  <key>developmentAppSecret</key>
  <string>Your Development App Secret</string>
  <key>productionAppKey</key>
  <string>Your Production App Key</string>
  <key>productionAppSecret</key>
  <string>Your Production App Secret</string>
</dict>
</plist>
```

4) Optional. In order to take advantage of iOS 10 notification attachments,
such as images, animated gifs, and video, you will need to create a notification
service extension by following the [iOS Notification Service Extension Guide](https://docs.airship.com/platform/reference/ios-extension/)

## Android Setup

1) Create the `airshipconfig.properties` file in the application's `app/src/main/assets`:
```
developmentAppKey = Your Development App Key
developmentAppSecret = Your Development App Secret

productionAppKey = Your Production App Key
productionAppSecret = Your Production Secret

# Notification customization
notificationIcon = ic_notification
notificationAccentColor = #ff0000
```

### Android FCM Setup

Adding FCM to your react-native project can be accomplished with the following steps:

1) Add the google-services gradle plugin dependency to the `build.gradle` file in project root directory:

```
buildscript {
    repositories {
        jcenter()
        google()
    }
    dependencies {
        ...
        classpath 'com.google.gms:google-services:4.2.0'
    }
}
```

2) Apply the google-services plugin *at the end* of the `build.gradle` file in the `app/` directory. The plugin directive specifically needs to be included at
the *end* of the `build.gradle` file to prevent potential dependency collisions. For more information, see the [plugin documentation](https://developers.google.com/android/guides/google-services-plugin).

```
apply plugin: 'com.google.gms.google-services'
```

3) Download your `google-services.json` file. This can be accomplished by following [`google-services.json` help documentation](https://support.google.com/firebase/answer/7015592):

4) Add the downloaded `google-service.json` file to the `app/` directory of your project. For more information
on adding the configuration file please see the [google services plugin guide](https://developers.google.com/android/guides/google-services-plugin#adding_the_json_file )

### Overriding Firebase Dependency Versions

Firebase core and messaging dependencies versions can be overriden by setting the `firebaseCoreVersion` and `firebaseMessagingVersion` in the project's build.gradle file:

```
ext {
    // Requires 21.0.0+
    firebaseMessagingVersion "VERSION"
}
```

## Enabling Notifications

Notifications by default are disabled to avoid prompting the user for permissions
at an inopportune time. For testing purposes, you probably want to enable Notifications
immediately to verify push is working:

 *Note: Push notifications are not supported on iOS simulators.*

```
import {
  UrbanAirship,
  UACustomEvent,
} from 'urbanairship-react-native'

...

export default class Sample extends Component {

  constructor(props) {
    super(props);
    UrbanAirship.setUserNotificationsEnabled(true);
  }

  ...
}
```


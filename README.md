# Urban Airship React Native

A React Native module for Urban Airship's iOS and Android SDK.

### Resources:

* [Getting started guide](http://docs.urbanairship.com/platform/react-native/)
* [API docs](http://docs.urbanairship.com/reference/libraries/react-native/latest/index.html)

### Contributing Code

We accept pull requests! If you would like to submit a pull request, please fill out and submit a
[Code Contribution Agreement](https://docs.urbanairship.com/contribution-agreement/).

### Issues

Please visit https://support.urbanairship.com/ for any issues integrating or using this module.

### Requirements:
 - Xcode 8.3+
 - React Native >= 0.44.0
 - React Native cli >= 2.0.1

## iOS Installation

1) Install and link the module:

```
react-native install urbanairship-react-native
react-native link urbanairship-react-native
```

2) Install AirshipKit by following [installation guide](https://docs.urbanairship.com/platform/ios/#sdk-installation).
The react module will do its best to find the `AirshipKit` path, but if it's unable to find it for your project due to a
non-standard install path or manual installation, you can set `AIRSHIP_SEARCH_PATH` variable with the
location of the framework.

3) Add the following capabilities for your application target:
  - Push Notification
  - Background Modes > Remote Notifications

4) Create a plist `AirshipConfig.plist` and include it in your application’s target:
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

5) Optional. In order to take advantage of iOS 10 notification attachments, such as images, animated gifs, and
video, you will need to create a notification service extension by following the [iOS Notification Service Extension Guide](https://docs.urbanairship.com/platform/reference/ios-extension/)


## Android Installation

1) Install and link the module:
```
react-native install urbanairship-react-native
react-native link urbanairship-react-native
```

2) Create the `airshipconfig.properties` file in the applications `main/assets`:
```
developmentAppKey = Your Development App Key
developmentAppSecret = Your Development App Secret

productionAppKey = Your Production App Key
productionAppSecret = Your Production Secret

# FCM/GCM Sender ID
gcmSender = Your Google API Project Number

# Notification customization
notificationIcon = ic_notification
notificationAccentColor = #ff0000
```

## Enabling Notifications

Notifications by default are disabled to avoid prompting the user for permissions
at an inopportune time. For testing purposes, you probably want to enable Notifications
immediately to verify push is working:

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

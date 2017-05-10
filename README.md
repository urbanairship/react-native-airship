# Urban Airship React Native

A React Native module for Urban Airship's iOS and Android SDK.

### Contributing Code

We accept pull requests! If you would like to submit a pull request, please fill out and submit a
[Code Contribution Agreement](https://docs.urbanairship.com/contribution-agreement.html).

### Issues

Please visit https://support.urbanairship.com/ for any issues integrating or using this module.

### Requirements:
 - React >= 4.4.0

# iOS Installation

1) Install and link the module:
```
react-native install urbanairship-react-native
react-native link urbanairship-react-native
```

2) Install [cocoapods](https://guides.cocoapods.org/using/getting-started.html)

3) Update the app's Podfile to include the Urban Airship SDK:
```
pod 'UrbanAirship-iOS-SDK', '~>8.3.0'
```

4) Update your pods:
```
pod install
```

5) Open your apps project in the generated `.xcworkspace` file, add the following
capabilities:
  - Push Notification
  - Background Modes > Remote Notifications

6) Create a plist `AirshipConfig.plist` and include it in your application’s target:
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

7) Optional. In order to take advantage of iOS 10 notification attachments, such as images, animated gifs, and
video, you will need to create a notification service extension by following the [iOS Notification Service Extension Guide](https://docs.urbanairship.com/platform/reference/ios-extension/#cocoapods)

# Android Installation

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

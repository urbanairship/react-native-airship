# Airship React Native Sample

A basic sample application that integrates the Airship React Native module.

## Setup

1) In project root
    - Install dependencies `npm install`


## Call TakeOff

`takeOff` should be called at the beginning of the lifecycle.

```javascript
import Airship from '@ua/react-native-airship';

Airship.takeOff({
    default: {
        appKey: "REPLACE_WITH_YOUR_APP_KEY",
        appSecret: "REPLACE_WITH_YOUR_APP_SECRET"
    },
    site: "us", // use "eu" for EU cloud projects
    urlAllowList: ["*"],
    android: {
        notificationConfig: {
            icon: "ic_notification",
            accentColor: "#00ff00"
        }
    }
});
```

### iOS

1) Run `pod install --repo-update` in `example/ios`

2) Start the webserver in the top-level directory by running `npx react-native start`

3) Build and run the sample in the `example` directory: `npx react-native run-ios`

### Android

1) If using FCM, add your `google-services.json` file in `example/android/app`

2) Start the webserver in the top-level directory by running `npx react-native start`

3) Build and run the sample in the `example` directory: `npx react-native run-android`

    Note: 
        You may also need to set up port forwarding for your android device:
            - List devices: `adb devices`
            - Set up port forwarding for device: `adb -s <REPLACE_WITH_YOUR_DEVICE_ID> reverse tcp:8081 tcp:8081`


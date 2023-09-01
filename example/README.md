# Airship React Native Sample

A basic sample application that integrates the Airship React Native module.

## Setup

1) Install modules: Run `yarn` in repository root

## Call TakeOff

`takeOff` should be called at the beginning of the lifecycle.

```javascript
import Airship from '@ua/react-native-airship';

Airship.takeOff({
    default: {
        appSecret: "REPLACE_WITH_YOUR_APP_SECRET",
        appKey: "REPLACE_WITH_YOUR_APP_KEY"
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

2) Start the webserver in the top-level directory by running `yarn start`

3) Build and run the sample in the `example` directory: `yarn ios`

### Android

1) If using FCM, add your `google-services.json` file in `example/android/app`

2) Start the webserver in the top-level directory by running `yarn start`

3) Build and run the sample in the `example` directory: `yarn android`


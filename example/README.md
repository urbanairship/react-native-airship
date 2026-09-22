# Airship React Native Sample

A basic sample application that integrates the Airship React Native module.

## Setup

1) In project root
    - Install dependencies `npm install`

2) Copy `example/src/AirshipConfig.ts.example` to `example/src/AirshipConfig.ts` and fill in your app's `appKey`/`appSecret`. `AirshipConfig.ts` is gitignored, so your credentials never get committed.

    ```
    cp example/src/AirshipConfig.ts.example example/src/AirshipConfig.ts
    ```

## Call TakeOff

`takeOff` is already called at app startup in `example/src/App.tsx`, using the full config from `AirshipConfig.ts`:

```typescript
import Airship from '@ua/react-native-airship';
import AirshipConfig from './AirshipConfig';

Airship.takeOff(AirshipConfig);
```

### iOS

1) Run `pod install --repo-update` in `example/ios`. If you receive an error, try deleting the Podfile.lock and re-installing.

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


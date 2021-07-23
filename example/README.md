# Airship React Native Sample

A basic sample application that integrates the Airship React Native module.

## Setup

1) Install modules: Run `yarn` in repository root

### iOS

1) Run `pod install` in `example/ios`

2) Create the `AirshipConfig.plist` file in `example/ios`

3) Start the webserver in the top-level directory by running `yarn start`

4) Build and run the sample in the `example` directory: `yarn run:ios`

### Android

1) Create the `airshipconfig.properties` file in `example/android/app/src/main/assets`

2) If using FCM, add your `google-services.json` file in `example/android/app`

3) Start the webserver in the top-level directory by running `yarn start`

4) Build and run the sample in the `example` directory: `yarn run:android`


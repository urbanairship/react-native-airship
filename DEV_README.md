# Airship React Native development

The example is set up to pull the Airship module from the root directory.

1) Install the react command line tools and watchman, if necessary:

```
npm install -g react-native-cli
```

```
brew install watchman
```

2) Install modules

```
npm install
```

## iOS

1) Run `pod install` in `example/ios`

2) Open the `example/ios/AirshipSample.xcworkspace` Project

3) Create the `AirshipConfig.plist` file

4) Start the webserver in the root by running `react-native start`

5) Build and run the sample

You should now be able to modify the iOS plugin source
directly in the sample's workspace.

## Android

1) Open `example/android` in Android Studio

2) Create the `airshipconfig.properties` file in `example/android/app/src/main/assets`

3) If using FCM, add your `google-services.json` file in `example/android/app`

4) Start the webserver in the root by running `react-native start`

5) Build and run the sample

You should now be able to modify the Android plugin source directly in the Android Studio.



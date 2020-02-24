# Airship React Native development

The example is set up to pull the Airship module from the src directory.

1) Install yarn and watchman, if necessary

```
brew install yarn
```

```
brew install watchman
```

2) Install modules

Execute the following command in the root directory

```
yarn install
```

3) Link urbanairship-react-native

Execute the following command in src/

```
yarn link
```

Next, execute the following command in example/

```
yarn link urbanairship-react-native
```

4) Perform platform-specific setup

## iOS

1) Run `pod install` in `example/ios`

2) Open the `example/ios/AirshipSample.xcworkspace` Project

3) Create the `AirshipConfig.plist` file

4) Start the webserver in the example directory by running `yarn react-native start`

5) Build and run the sample: `yarn run:ios`

You should now be able to modify the iOS plugin source
directly in the sample's workspace.

## Android

1) Open `example/android` in Android Studio

2) Create the `airshipconfig.properties` file in `example/android/app/src/main/assets`

3) If using FCM, add your `google-services.json` file in `example/android/app`

4) Start the webserver in the example directory by running `yarn react-native start`

5) Build and run the sample: `yarn run:android`

You should now be able to modify the Android plugin source directly in the Android Studio.



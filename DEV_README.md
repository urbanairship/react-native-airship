# Urban Airship React Native development

1) Install the react command line tools and watchman, if necessary:

```
npm install -g react-native-cli
```

```
brew install watchman
```

2) In the root module directory, link the development module:
```
npm link
```

3) In `sample/AirshipSample` prepare the sample:
```
npm link urbanairship-react-native
npm install
react-native link urbanairship-react-native
```

## iOS

1) Run `pod install` in `sample/AirshipSample/iOS`

2) Open the `.xcworkspace` Project

3) Create the `AirshipConfig.plist` file

4) Start the webserver by running `react-native start` in `sample/AirshipSample`

5) Build and run the sample

You should now be able to modify the iOS plugin source directly in the sample's
workspace.


## Android

1) Open `sample/AirshipSample/android` in Android Studio

2) Create the `airshipconfig.properties` file in `src/main/assets`

3) Start the webserver by running `react-native start` in `sample/AirshipSample`

4) Build and run the sample

You should now be able to modify the Android plugin source directly in the Android Studio.

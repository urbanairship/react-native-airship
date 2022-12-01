/* Copyright Airship and Contributors */
/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import {
  EventType,
  UrbanAirship,
} from 'urbanairship-react-native'


UrbanAirship.addListener(EventType.PushReceived, async (event) => {
  console.log("Push Received: " + JSON.stringify(event));
})

AppRegistry.registerComponent(appName, () => App);


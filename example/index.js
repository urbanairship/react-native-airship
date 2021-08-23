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

import { AirshipChat } from 'urbanairship-chat-react-native'


AppRegistry.registerComponent(appName, () => App);

UrbanAirship.addListener(EventType.PushReceived, async (event) => {
  console.log("Push Received: " + event.alert);
})

AirshipChat.setUseCustomChatUI(true);


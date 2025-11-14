import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import Airship, { EventType } from '@ua/react-native-airship';

Airship.addListener(EventType.PushReceived, (event) => {
    // Handle push received
    console.log("PushReceived");
    Airship.channel.editAttributes()
    .setAttribute("ulrich_first_param", "Ulrich RN 25")
    .apply();
    Airship.channel.editTags()
    .addTags(["Ulrich RN Receive 25"])
    .apply()
});

// Set up event listeners
Airship.addListener(EventType.NotificationResponse, (event) => {
    // Handle notification responses
});

Airship.addListener(EventType.PushReceived, (event) => {
    // Handle push received
});

Airship.addListener(EventType.ChannelCreated, (event) => {
    // Handle channel creation
});

Airship.addListener(EventType.PushNotificationStatusChangedStatus, (event) => {
    // Handle push notification status changes
});

AppRegistry.registerComponent(appName, () => App);

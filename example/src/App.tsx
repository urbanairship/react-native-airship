import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import MessageCenterScreen from './screens/MessageCenterScreen';
import MessageScreen from './screens/MessageScreen';
import PreferenceCenterScreen from './screens/PreferenceCenterScreen';
import SettingsScreen from './screens/SettingsScreen';
import Airship, { EventType } from '@ua/react-native-airship';

const Tab = createBottomTabNavigator();
const MessageCenterStack = createStackNavigator();


Airship.addListener(EventType.NotificationResponse, (event) => {
  console.log('NotificationResponse:', JSON.stringify(event));
});

Airship.addListener(EventType.PushReceived, (event) => {
  console.log('PushReceived:', JSON.stringify(event));
});

Airship.addListener(EventType.ChannelCreated, (event) => {
  console.log('ChannelCreated:', JSON.stringify(event));
});

Airship.addListener(EventType.NotificationOptInStatus, (event) => {
  console.log('NotificationOptInStatus:', JSON.stringify(event));
});

function MessageCenterStackScreen() {
  return (
    <MessageCenterStack.Navigator>
      <MessageCenterStack.Screen
        name="MessageCenter.Home"
        // @ts-ignore
        component={MessageCenterScreen}
        options={{ title: 'Message center' }}
      />
      <MessageCenterStack.Screen
        name="MessageDetails"
        // @ts-ignore
        component={MessageScreen}
        options={{ title: 'Message' }}
      />
    </MessageCenterStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen
          name="MessageCenter"
          component={MessageCenterStackScreen}
          options={{ title: 'Message center', headerShown: false }}
        />
        <Tab.Screen
          name="PreferenceCenter"
          component={PreferenceCenterScreen}
          options={{ title: 'Preference center' }}
        />
        {/* @ts-ignore */}
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Airship.addListener(EventType.DisplayMessageCenter, event => {
//   console.log(EventType.DisplayMessageCenter + ':', event);
//   if (event.messageId != null) {
//     this.props.navigation.navigate('MessageDetails', {
//       messageId: event.event,
//       title: '',
//     });
//   } else {
//     this.props.navigation.navigate('MessageCenter');
//   }
// });

// Airship.setAutoLaunchDefaultMessageCenter(false);
//     Airship.setUseCustomPreferenceCenterUi(true, 'neat');

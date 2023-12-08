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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

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

Airship.addListener(EventType.PushNotificationStatusChangedStatus, (event) => {
  console.log('PushNotificationStatusChangedStatus:', JSON.stringify(event));
});

Airship.addListener(EventType.IOSAuthorizedNotificationSettingsChanged, (event) => {
  console.log('IOSAuthorizedNotificationSettingsChanged:', JSON.stringify(event));
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
      <Tab.Navigator
        screenOptions={({ route, focused }) => ({
          tabBarIcon: ({ size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'MessageCenter') {
              iconName = 'message';
            } else if (route.name === 'PreferenceCenter') {
              iconName = 'tune';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            const color = focused ? '#004bff' : 'grey';

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
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

import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import MessageCenterScreen from './screens/MessageCenterScreen';
import MessageScreen from './screens/MessageScreen';
import PreferenceCenterScreen from './screens/PreferenceCenterScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const PreferenceCenterStack = createStackNavigator();
const MessageCenterStack = createStackNavigator();

function PreferenceCenterStackScreen() {
  return (
    <PreferenceCenterStack.Navigator>
      <PreferenceCenterStack.Screen
        name="PreferenceCenter.Home"
        component={PreferenceCenterScreen}
        options={{title: 'Preference center'}}
      />
      <PreferenceCenterStack.Screen
        name="MessageDetails"
        // @ts-ignore
        component={MessageScreen}
        options={{title: 'Message'}}
      />
    </PreferenceCenterStack.Navigator>
  );
}

function MessageCenterStackScreen() {
  return (
    <MessageCenterStack.Navigator>
      <MessageCenterStack.Screen
        name="MessageCenter.Home"
        // @ts-ignore
        component={MessageCenterScreen}
        options={{title: 'Message center'}}
      />
      <MessageCenterStack.Screen
        name="MessageDetails"
        // @ts-ignore
        component={MessageScreen}
        options={{title: 'Message'}}
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
          options={{title: 'Message center'}}
        />
        <Tab.Screen
          name="PreferenceCenter"
          component={PreferenceCenterStackScreen}
          options={{title: 'Preference center'}}
        />
        {/* @ts-ignore */}
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

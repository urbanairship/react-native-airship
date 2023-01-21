/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 * @flow
 */
'use strict';

import { UrbanAirship, EventType } from 'urbanairship-react-native';

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import MessageCenterScreen from './screens/MessageCenterScreen';
import PreferenceCenterScreen from './screens/PreferenceCenterScreen';
import MessageScreen from './screens/MessageScreen';

const MessageCenterStack = createStackNavigator({
  MessageList: {
    screen: MessageCenterScreen,
    navigationOptions: {
      headerTitle: 'Messages Center',
    },
  },
  MessageDetails: {
    screen: MessageScreen,
  },
});

const PreferenceCenterStack = createStackNavigator({
  MessageList: {
    screen: PreferenceCenterScreen,
    navigationOptions: {
      headerTitle: 'Preference Center',
    },
  },
  MessageDetails: {
    screen: MessageScreen,
  },
});

const TabNavigator = createBottomTabNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        title: 'Home',
      },
    },
    MessageCenter: {
      screen: MessageCenterStack,
      navigationOptions: {
        tabBarLabel: 'Message Center',
      },
    },
    PreferenceCenter: {
      screen: PreferenceCenterStack,
      navigationOptions: {
        tabBarLabel: 'Preference Center',
      },
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        tabBarLabel: 'Settings',
      },
    },
  },
  { initialRouteName: 'Home' }
);

UrbanAirship.setAutoLaunchDefaultMessageCenter(false);

UrbanAirship.addListener(EventType.DisplayMessageCenter, (event) => {
  console.log(EventType.DisplayMessageCenter + ':', event);
});

export default createAppContainer(TabNavigator);

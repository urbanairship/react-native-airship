/**
 * Sample React Native App
 * @flow
 */
'use strict';

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MessageListScreen from "./screens/MessageCenterScreen";
import MessageDetailsScreen from "./screens/MessageScreen";

const MessageCenterStack = createStackNavigator({
 MessageList: {
  screen: MessageListScreen,
  navigationOptions: {
    headerTitle: 'Messages list',
  }
 },
 MessageDetails: {
  screen: MessageDetailsScreen,
  navigationOptions: {
    headerTitle: 'Message details',
  }
 }
});

const TabNavigator = createBottomTabNavigator({
    Home: {
        screen: HomeScreen,
        navigationOptions: {
            title: "Home"
        }
    },
    MessageCenter: {
        screen: MessageCenterStack,
        navigationOptions: {
            tabBarLabel: "Message Center"
        }
    },
    Settings: {
        screen: SettingsScreen,
        navigationOptions: {
            tabBarLabel: "Settings"
        }
     },
},
  { initialRouteName: 'Home' },
);

export default createAppContainer(TabNavigator);

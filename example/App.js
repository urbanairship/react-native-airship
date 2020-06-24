/* Copyright Airship and Contributors */
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
import MessageCenterScreen from "./screens/MessageCenterScreen";
import MessageScreen from "./screens/MessageScreen";

const MessageCenterStack = createStackNavigator({
    MessageList: {
        screen: MessageCenterScreen,
        navigationOptions: {
            headerTitle: 'Messages Center',
        }
    },
    MessageDetails: {
        screen: MessageScreen
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

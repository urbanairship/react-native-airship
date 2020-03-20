/**
 * Sample React Native App
 * @flow
 */
'use strict';

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import MessageCenterScreen from "./screens/MessageCenterScreen";

const TabNavigator = createBottomTabNavigator({
    Home: {
        screen: HomeScreen,
        navigationOptions: {
            title: "Home"
        }
    },
    MessageCenter: {
        screen: MessageCenterScreen,
        navigationOptions: {
            tabBarLabel: "Message center"
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

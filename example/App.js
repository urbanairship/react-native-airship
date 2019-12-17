/**
 * Sample React Native App
 * @flow
 */
'use strict';

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";

const TabNavigator = createBottomTabNavigator(
  {
    Home: HomeScreen,
    Settings: SettingsScreen,
  },
  { initialRouteName: 'Home' },
);

export default createAppContainer(TabNavigator);

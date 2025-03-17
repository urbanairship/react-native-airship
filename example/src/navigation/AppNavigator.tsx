/* Copyright Airship and Contributors */

import React from 'react';
import { Platform, UIManager } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Enable layout animations on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Define the type for our navigation parameters
export type RootStackParamList = {
  Home: undefined;
  MessageCenter: undefined;
  MessageDetails: { messageId: string; title?: string };
  PreferenceCenter: undefined;
  CustomEvents: undefined;
};

import HomeScreen from '../screens/HomeScreen';
import MessageCenterScreen from '../screens/MessageCenterScreen';
import MessageScreen from '../screens/MessageScreen';
import PreferenceCenterScreen from '../screens/PreferenceCenterScreen';
import CustomEventsScreen from '../screens/CustomEventsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#004BFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Airship Example' }}
        />
        <Stack.Screen 
          name="MessageCenter" 
          component={MessageCenterScreen} 
          options={{ title: 'Message Center' }}
        />
        <Stack.Screen 
          name="MessageDetails" 
          component={MessageScreen} 
          options={({ route }) => ({ title: route.params?.title || 'Message' })}
        />
        <Stack.Screen 
          name="PreferenceCenter" 
          component={PreferenceCenterScreen} 
          options={{ title: 'Preference Center' }}
        />
        <Stack.Screen 
          name="CustomEvents" 
          component={CustomEventsScreen} 
          options={{ title: 'Custom Events' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
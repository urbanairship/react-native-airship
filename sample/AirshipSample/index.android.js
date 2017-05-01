/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 const UrbanAirship = require('urbanairship-react-native');

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class AirshipSample extends Component {
  constructor(props) {
    super(props);
    UrbanAirship.setUserNotificationsEnabled(true);
  }

  componentWillMount() {
        // add handler to handle all incoming notifications
        UrbanAirship.addListener("notificationResponse", (notification) => {
            console.log('notification:', notification.alert);
            alert(notification.alert);
        });
      }


  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('AirshipSample', () => AirshipSample);

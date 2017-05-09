/**
 * Sample React Native App
 * @flow
 */

 import {
   UrbanAirship,
   UACustomEvent,
 } from 'urbanairship-react-native'

import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class AirshipSample extends Component {

  constructor(props) {
    super(props);
    this.state = {channelId: ""}
    UrbanAirship.setUserNotificationsEnabled(true);
  }

  componentWillMount() {

    UrbanAirship.getChannelId().then((channelId) => {
      this.state.channelId = channelId;
      this.setState(this.state);
    });

    // add handler to handle all incoming notifications
    UrbanAirship.addListener("notificationResponse", (response) => {
      console.log('notificationResponse:', JSON.stringify(response));
      alert("notificationResponse: " + response.notification.alert);
    });

    UrbanAirship.addListener("pushReceived", (notification) => {
      console.log('pushReceived:', JSON.stringify(notification));
      alert("pushReceived: " + notification.alert);
    });

    UrbanAirship.addListener("deepLink", (event) => {
      console.log('deepLink:', JSON.stringify(event));
      alert("deepLink: " + event.deepLink);
    });

    UrbanAirship.addListener("registration", (event) => {
      console.log('registration:', JSON.stringify(event));
      this.state.channelId = channelId;
      this.setState(this.state);
    });

    UrbanAirship.addListener("notificationOptInStatus", (event) => {
      console.log('notificationOptInStatus:', JSON.stringify(event));
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.channel}>
          Channel ID {'\n'}
          {this.state.channelId}
        </Text>

        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
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
  channel: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

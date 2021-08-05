/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * MessageScreen: Contains the selected message to be displayed.
 */
'use strict';

import {
  MessageView
} from 'urbanairship-react-native'

import React from 'react';

import {
  View,
  ActivityIndicator,
  Alert
} from 'react-native';

import styles from './../Styles'

export default class MessageScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      animating: true
    }

    this.startLoading = this.startLoading.bind(this);
    this.finishLoading = this.finishLoading.bind(this);
    this.failedLoading = this.failedLoading.bind(this);
  }

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    return {
      title: params ? params.title : "",
    }
  }

  startActivityIndicator() {
    setTimeout(() => {
      this.setState({
        animating: false
      });
    }, 500);
  }

  stopActivityIndicator() {
    setTimeout(() => {
      this.setState({
        animating: false
      });
    }, 500);
  }

  startLoading() {
    this.startActivityIndicator();
  }

  finishLoading() {
    this.stopActivityIndicator();
  }

  failedLoading() {
    this.stopActivityIndicator();
    Alert.alert('Error', 'Unable to load message. Please try again later',
      [{ text: 'OK', onPress: () => this.props.navigation.goBack() },]
    )
  }

  render() {
    const { params } = this.props.navigation.state;
    const messageId = params ? params.messageId : "";

    return (
      <View style={styles.backgroundContainer}>
        <MessageView messageId={messageId}
          onLoadStarted={this.startLoading}
          onLoadFinished={this.finishLoading}
          onLoadError={this.failedLoading}
          style={{ flex: 1 }}
        />
        {this.state.animating &&
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large"
            animating={this.state.animating}
          />
        </View>
        }
      </View>
    );
  }
}
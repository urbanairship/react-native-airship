/**
 * Sample React Native App
 *
 * MessageScreen: Contains the selected message to be displayed.
 */
'use strict';

import {
 UAMessageView,
} from 'urbanairship-react-native'

import React, {
  Component,
} from 'react';

import {
  View,
} from 'react-native';

import styles from './../Styles'

export default class MessageScreen extends React.Component {

  constructor(props) {
    super (props);
  }

  static navigationOptions = ({ navigation }) => {
      const { params } = navigation.state;
      return {
        title: params ? params.title: "",
      }
  };

  render() {
    const { params } = this.props.navigation.state;
    const messageId = params ? params.messageId : "";
    return (
       <View style={styles.backgroundContainer}>
            <UAMessageView messageId={messageId} style={{ flex: 1 }}/>
       </View>
    );
  }
}

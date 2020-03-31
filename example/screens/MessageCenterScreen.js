/**
 * Sample React Native App
 *
 * MessageCenterScreen: Contains the list of messages.
 */
'use strict';

import {
 UrbanAirship,
} from 'urbanairship-react-native'

import React, {
  Component,
} from 'react';

import {
  Text,
  View,
  Image,
  ScrollView,
  Button,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import Moment from 'moment';

import styles from './../Styles';

function Item({ message, navigation }) {
  return (
  <TouchableHighlight
    activeOpacity={0.6}
    underlayColor="#DDDDDD"
    onPress={() => navigation.navigate("MessageDetails", { messageId: message.id, title: message.title })}>
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{message.title}</Text>
      <Text style={styles.itemSubtitle}>{Moment(message.sentDate).format('MM/DD/YYYY')}</Text>
      <View style={styles.itemSeparator}></View>
    </View>
  </TouchableHighlight>
  );
}

export default class MessageCenterScreen extends React.Component {

  constructor(props) {
    super (props);
    this.state = {
      messages: [],
    }

    this.handleUpdateMessageList();
  }

  handleUpdateMessageList() {
    UrbanAirship.getInboxMessages().then((data) => {
        this.setState({
            messages: data,
        });
    });
  }

  render() {
    return (
       <View style={styles.backgroundContainer}>
        <FlatList
            data={this.state.messages}
            renderItem={({ item }) => <Item message={item} navigation={this.props.navigation} />}
            keyExtractor={item => item.id}
        />
       </View>
    );
  }
}

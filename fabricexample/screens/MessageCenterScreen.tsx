/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * MessageCenterScreen: Contains the list of messages.
 */
'use strict';

import {UrbanAirship, EventType, InboxMessage} from 'urbanairship-react-native';

import React from 'react';

import {
  Text,
  View,
  FlatList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';

import Moment from 'moment';

import styles from './../Styles';

interface MessageCenterScreenProps {
  navigation: any;
}

function Item({message, navigation}: {message: any; navigation: any}) {
  return (
    <TouchableHighlight
      activeOpacity={0.6}
      underlayColor="#DDDDDD"
      onPress={() =>
        navigation.navigate('MessageDetails', {
          messageId: message.id,
          title: message.title,
        })
      }>
      <View style={styles.item}>
        <Text style={styles.itemTitle}>{message.title}</Text>
        <Text style={styles.itemSubtitle}>
          {Moment(message.sentDate).format('MM/DD/YYYY')}
        </Text>
        <View style={styles.itemSeparator}></View>
      </View>
    </TouchableHighlight>
  );
}

export default class MessageCenterScreen extends React.Component<
  MessageCenterScreenProps,
  {
    messages: InboxMessage[];
    refreshing: boolean;
  }
> {
  constructor(props: MessageCenterScreenProps) {
    super(props);
    this.state = {
      messages: [],
      refreshing: true,
    };

    this.refreshMessageCenter = this.refreshMessageCenter.bind(this);

    this.handleUpdateMessageList();

    UrbanAirship.setAutoLaunchDefaultMessageCenter(false);

    UrbanAirship.addListener(EventType.DisplayMessageCenter, event => {
      console.log(EventType.DisplayMessageCenter + ':', event);
      if (event.messageId != null) {
        this.props.navigation.navigate('MessageDetails', {
          messageId: event.event,
          title: '',
        });
      } else {
        this.props.navigation.navigate('MessageCenter');
      }
    });
  }

  handleUpdateMessageList() {
    UrbanAirship.getInboxMessages().then(data => {
      this.setState({
        messages: data,
        refreshing: false,
      });
    });
  }

  refreshMessageCenter() {
    this.handleUpdateMessageList();
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <FlatList
          data={this.state.messages}
          renderItem={({item}) => (
            <Item message={item} navigation={this.props.navigation} />
          )}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.refreshMessageCenter}
            />
          }
        />
      </View>
    );
  }
}

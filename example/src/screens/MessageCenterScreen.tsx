/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * MessageCenterScreen: Contains the list of messages.
 */
'use strict';

import * as React from 'react';

import {
  Text,
  View,
  FlatList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';

import Moment from 'moment';

import styles from './../Styles';
import Airship, { EventType, InboxMessage } from '@ua/react-native-airship';
import { Subscription } from 'src/UAEventEmitter';

interface MessageCenterScreenProps {
  navigation: any;
}

function Item({ message, navigation }: { message: any; navigation: any }) {
  return (
    <TouchableHighlight
      activeOpacity={0.6}
      underlayColor="#DDDDDD"
      onPress={() =>
        navigation.navigate('MessageDetails', {
          messageId: message.id,
          title: message.title,
        })
      }
    >
      <View style={styles.item}>
        <Text style={styles.itemTitle}>{message.title}</Text>
        <Text style={styles.itemSubtitle}>
          {Moment(message.sentDate).format('MM/DD/YYYY')}
        </Text>
        <View style={styles.itemSeparator} />
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
  private updateSubscription?: Subscription;

  constructor(props: MessageCenterScreenProps) {
    super(props);
    this.state = {
      messages: [],
      refreshing: true,
    };

    this.refreshMessageCenter = this.refreshMessageCenter.bind(this);
    this.handleUpdateMessageList = this.handleUpdateMessageList.bind(this);
  }

  componentDidMount(): void {
    this.updateSubscription = Airship.addListener(
      EventType.MessageCenterUpdated,
      this.handleUpdateMessageList
    );
    this.handleUpdateMessageList();
  }

  componentWillUnmount(): void {
    this.updateSubscription?.remove();
  }

  handleUpdateMessageList() {
    Airship.messageCenter.getMessages().then((data) => {
      this.setState({
        messages: data,
        refreshing: false,
      });
    });
  }

  refreshMessageCenter() {
    Airship.messageCenter
      .refreshMessages()
      .then(() => {
        this.setState({
          refreshing: false,
        });
      })
      .catch((error) => {
        console.log('failed to refresh', error);
      });
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <FlatList
          data={this.state.messages}
          renderItem={({ item }) => (
            <Item message={item} navigation={this.props.navigation} />
          )}
          keyExtractor={(item) => item.id}
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

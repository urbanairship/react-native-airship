/* Copyright Airship and Contributors */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableHighlight,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Moment from 'moment';
import styles from '../Styles';
import Airship, { EventType } from '@ua/react-native-airship';
type MessageCenterScreenProps = {
  navigation: any;
  route?: any;
};

type MessageItem = {
  id: string;
  title: string;
  sentDate: string;
};

const Item = ({ message, navigation }: { message: MessageItem; navigation: any }) => (
  <TouchableHighlight
    activeOpacity={0.6}
    underlayColor="#DDDDDD"
    onPress={() => {
      navigation.navigate('MessageDetails', {
        messageId: message.id,
        title: message.title,
      });
    }}
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

const MessageCenterScreen = ({ navigation }: MessageCenterScreenProps) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [refreshing, setRefreshing] = useState(true);

  const handleUpdateMessageList = useCallback(() => {
    Airship.messageCenter.getMessages().then((data) => {
      setMessages(data);
      setRefreshing(false);
    }).catch(() => {
      // Expected error when message center is not available
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    const updateSubscription = Airship.addListener(
      EventType.MessageCenterUpdated,
      handleUpdateMessageList
    );

    handleUpdateMessageList();

    return () => {
      updateSubscription.remove();
    };
  }, [handleUpdateMessageList]);

  const refreshMessageCenter = () => {
    setRefreshing(true);
    Airship.messageCenter
      .refreshMessages()
      .then(() => {
        return Airship.messageCenter.getMessages();
      })
      .then((data) => {
        setMessages(data);
        setRefreshing(false);
      })
      .catch(() => {
        // Expected error when message center is not available
        setRefreshing(false);
      });
  };

  return (
    <View style={styles.backgroundContainer}>
      {refreshing ? (
        <View style={[styles.centerContainer, {padding: 16}]}>
          <ActivityIndicator size="large" color="#004bff" />
        </View>
      ) : messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <Item message={item} navigation={navigation} />
          )}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshMessageCenter}
            />
          }
        />
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>Message Center Unavailable</Text>
          <Text style={styles.warningText}>
            No messages found. Try refreshing or check your configuration.
          </Text>
        </View>
      )}
    </View>
  );
};

export default MessageCenterScreen;
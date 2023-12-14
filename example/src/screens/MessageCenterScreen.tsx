/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * MessageCenterScreen: Contains the list of messages.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Text, View, FlatList, TouchableHighlight, RefreshControl } from 'react-native';
import Moment from 'moment';
import styles from './../Styles';
import Airship, { EventType } from '@ua/react-native-airship';

const Item = ({ message, navigation }) => (
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

const MessageCenterScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(true);

  const handleUpdateMessageList = useCallback(() => {
    Airship.messageCenter.getMessages().then((data) => {
      setMessages(data);
      setRefreshing(false);
    });
  }, []);

  useEffect(() => {
    const updateSubscription = Airship.addListener(
      EventType.MessageCenterUpdated,
      handleUpdateMessageList,
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
        setRefreshing(false);
      })
      .catch((error) => {
        console.log('Failed to refresh', error);
        setRefreshing(false);
      });
  };

  return (
    <View style={styles.backgroundContainer}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <Item message={item} navigation={navigation} />}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshMessageCenter} />
        }
      />
    </View>
  );
};

export default MessageCenterScreen;

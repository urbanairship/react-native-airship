import React, { useState, useEffect } from 'react';
import { View, Text, Image, Dimensions, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import Airship, { EventType } from '@ua/react-native-airship';

import styles from '../Styles';

function ChannelCell({ channelId }) {
  const copyToClipboard = () => {
    Clipboard.setString(channelId);
  };

  return (
    <TouchableOpacity onPress={copyToClipboard}>
      <Text style={styles.channel}>
        Channel ID {'\n'}{channelId}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [channelId, setChannelId] = useState(null);

  useEffect(() => {
    Airship.push.getNotificationStatus().then((id) => {
      console.log(id);
    }).catch((error) => {
      console.error("Error getting notification status:", error);
    });

    Airship.push.iOS.getAuthorizedNotificationSettings().then((id) => {
      console.log(id);
    }).catch((error) => {
      console.error("Error getting notification settings:", error);
    });

    Airship.push.iOS.getAuthorizedNotificationStatus().then((id) => {
      console.log(id);
    });

    Airship.push.getNotificationStatus().then((id) => {
      console.log(id);
    });

    Airship.channel.getChannelId().then((id) => {
      if (id) {
        setChannelId(id);
      }
    });

    let subscription = Airship.addListener(EventType.ChannelCreated, (event) => {
      setChannelId(event.channelId);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const MyVerticalStack = () => {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 50, backgroundColor: 'red' }} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        style={[styles.backgroundIcon, { marginBottom: 1000}]}
        source={require('./../img/airship-mark.png')}
      />
      {channelId && <ChannelCell channelId={channelId} />}
      </View>
        <View style={{ height: 50, backgroundColor: 'green' }} />
      </View>
    );
  };

  return (
    <MyVerticalStack/>
  );
}

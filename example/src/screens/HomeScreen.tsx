/* Copyright Airship and Contributors */

import React, { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { View, Text, Platform, Button, KeyboardAvoidingView } from 'react-native';
import Airship, { EventType } from '@ua/react-native-airship';
import styles from '../Styles';

export default function HomeScreen() {
  const [channelId, setChannelId] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const isIOS = Platform.OS === 'ios';
  const liveLabel = isIOS ? 'Live Activities' : 'Live Updates';

  useEffect(() => {
    Airship.channel.getChannelId().then(id => id && setChannelId(id));
    Airship.push.getNotificationStatus().then(status => setNotificationsEnabled(status.isUserOptedIn));

    const channelListener = Airship.addListener(EventType.ChannelCreated, event => setChannelId(event.channelId));
    const optInListener = Airship.addListener(EventType.PushNotificationStatusChangedStatus, event => {
      console.log('Event', event);
      setNotificationsEnabled(event.status.isUserOptedIn);
    });

    return () => {
      channelListener.remove();
      optInListener.remove();
    };
  }, []);

  const handleNotificationsEnabled = async enabled => {
    enabled
      ? await Airship.push.enableUserNotifications({ fallback: 'systemSettings' })
      : Airship.push.setUserNotificationsEnabled(false);
  };

  const startLive = () => {
    const manager = isIOS ? Airship.iOS.liveActivityManager : Airship.android.liveUpdateManager;
    if (isIOS) {
      manager.start({
        attributesType: 'ExampleWidgetsAttributes',
        content: { state: { emoji: '🙌' }, relevanceScore: 0.0 },
        attributes: { name: uuid.v4() },
      });
    } else {
      manager.start({
        type: 'Example',
        name: uuid.v4(),
        content: { emoji: '🙌' },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 200 : 0}
    >
      <View style={{ flex: 1, padding: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 24, marginBottom: 20 }}>Airship Example</Text>
          {channelId ? (
            <View style={styles.roundedView}>
              <Text>Channel ID: {channelId}</Text>
            </View>
          ) : (
            <View style={styles.warningView}>
              <Text style={styles.warningTitleText}>Channel Unavailable</Text>
              <Text style={styles.warningBodyText}>
                Have you added the takeOff call with the correct app key and secret?
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginBottom: 20 }}>
          <Button
            title={notificationsEnabled ? 'Push Enabled' : 'Push Disabled'}
            onPress={() => handleNotificationsEnabled(!notificationsEnabled)}
            color={notificationsEnabled ? '#6CA15F' : '#E0E0E0'}
          />
        </View>
        <View style={[styles.roundedView, { marginBottom: 20, padding: 8 }]}>
          <Text style={{ fontWeight: 'bold', marginLeft: 8, marginBottom: 8 }}>{liveLabel}</Text>
          <Button onPress={startLive} title="Start New" color="#841584" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
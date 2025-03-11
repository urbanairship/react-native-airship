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

  const checkLiveActivities = async () => {
    try {
      const manager = isIOS ? Airship.iOS.liveActivityManager : Airship.android.liveUpdateManager;
      const activities = await manager.listAll();
      console.log(isIOS ? 'Live Activities:' : 'Live Updates:', activities);
      alert(activities.length ? `Found ${activities.length} active ${liveLabel}` : `No active ${liveLabel} found`);
    } catch (error) {
      console.error('Error checking live activities/updates:', error);
    }
  };

  useEffect(() => {
    Airship.channel.getChannelId().then(id => id && setChannelId(id));
    Airship.push.getNotificationStatus().then(status => setNotificationsEnabled(status.isUserOptedIn));

    const channelListener = Airship.addListener(EventType.ChannelCreated, event => setChannelId(event.channelId));
    const optInListener = Airship.addListener(EventType.PushNotificationStatusChangedStatus, event => {
      console.log('Event', event);
      setNotificationsEnabled(event.status.isUserOptedIn);
    });
    const liveActivityListener = isIOS ? Airship.addListener(EventType.IOSLiveActivitiesUpdated, checkLiveActivities) : null;

    return () => {
      channelListener.remove();
      optInListener.remove();
      liveActivityListener && liveActivityListener.remove();
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

  const endAllLive = async () => {
    const manager = isIOS ? Airship.iOS.liveActivityManager : Airship.android.liveUpdateManager;
    const activities = await manager.listAll();
    activities.forEach(activity => {
      isIOS
        ? manager.end({ activityId: activity.id, dismissalPolicy: { type: 'immediate' } })
        : manager.end({ name: activity.name });
    });
  };

  const updateAllLive = async () => {
    const manager = isIOS ? Airship.iOS.liveActivityManager : Airship.android.liveUpdateManager;
    const activities = await manager.listAll();
    activities.forEach(activity => {
      if (isIOS) {
        manager.update({
          activityId: activity.id,
          content: {
            state: { emoji: activity.content.state.emoji + '🙌' },
            relevanceScore: 0.0,
          },
        });
      } else {
        manager.update({
          name: activity.name,
          content: { emoji: activity.content.emoji + '🙌' },
        });
      }
    });
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
          <Button onPress={endAllLive} title="End All" color="#841584" />
          <Button onPress={updateAllLive} title="Update All" color="#841584" />
          <Button onPress={checkLiveActivities} title="Check Status" color="#1E88E5" />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
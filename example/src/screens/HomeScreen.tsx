/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * HomeScreen: Contains elements for enabling push, displaying the channel ID, and for setting named user and tags.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Airship, { EventType } from '@ua/react-native-airship';

import styles from '../Styles';
import NamedUserInputCell from './Home Elements/NamedUserInputCell';
import NamedUserManagerCell from './Home Elements/NamedUserManagerCell';
import ChannelCell from './Home Elements/ChannelCell';

const EnablePushCell: React.FC<{
  notificationsEnabled: boolean;
  handleNotificationsEnabled: (value: boolean) => void;
}> = ({ notificationsEnabled, handleNotificationsEnabled }) => (
  <TouchableOpacity
    style={[
      styles.enablePushButtonContainer,
      // eslint-disable-next-line react-native/no-inline-styles
      { backgroundColor: notificationsEnabled ? '#6CA15F' : '#E0E0E0' },
    ]}
    onPress={() => handleNotificationsEnabled(!notificationsEnabled)}
  >
    <Text style={styles.enablePushRowText}>
      {notificationsEnabled ? 'Push Enabled' : 'Push Disabled'}
    </Text>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const [channelId, setChannelId] = useState(null);
  const [namedUser, setNamedUser] = useState<string | undefined>(undefined);
  const [namedUserText, setNamedUserText] = useState('');

  const refreshNamedUser = useCallback(async () => {
    const fetchedNamedUser = await Airship.contact.getNamedUserId();
    setNamedUser(fetchedNamedUser);
  }, []);

  const handleNamedUserSet = useCallback(async () => {
    await Airship.contact.identify(namedUserText);
    await refreshNamedUser();
    setNamedUserText(''); // Clear named user text once set
  }, [namedUserText, refreshNamedUser]);

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', (e) => {});

    const hideListener = Keyboard.addListener('keyboardDidHide', () => {});

    Airship.push
      .getNotificationStatus()
      .then((id) => {})
      .catch((error) => {});

    Airship.push.iOS
      .getAuthorizedNotificationSettings()
      .then((id) => {})
      .catch((error) => {});

    Airship.push.iOS
      .getAuthorizedNotificationStatus()
      .then((id) => {})
      .catch((error) => {});

    Airship.channel
      .getChannelId()
      .then((id) => {
        if (id) {
          setChannelId(id);
        }
      })
      .catch((error) => {});

    let subscription = Airship.addListener(
      EventType.ChannelCreated,
      (event) => {
        setChannelId(event.channelId);
      }
    );

    return () => {
      subscription.remove();
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 200 : 0}
    >
      <View style={{ flex: 1, flexShrink: 1, padding: 20 }}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={[styles.backgroundIcon, { marginBottom: 20 }]}
            source={require('./../img/airship-mark.png')}
          />
        </View>
        {channelId && <ChannelCell channelId={channelId} />}

        <NamedUserManagerCell
          namedUserText={namedUserText}
          handleNamedUserSet={handleNamedUserSet}
          handleUpdateNamedUserText={setNamedUserText}
          namedUser={namedUser}
        />
        <View style={{ flexGrow: 1, flexShrink: 1 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

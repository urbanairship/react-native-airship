/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * HomeScreen: Contains elements for enabling push, displaying the channel ID, and for setting named user and tags.
 */

import React, { useState, useEffect, useCallback } from 'react';
import uuid from 'react-native-uuid';
import {
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Button,
} from 'react-native';
import Airship, {
  EventType,
  AirshipEmbeddedView,
} from '@ua/react-native-airship';

import styles from '../Styles';
import NamedUserManagerCell from './Home Elements/NamedUserManagerCell';
import TagManagerCell from './Home Elements/TagManagerCell';
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEmbeddedReady, setEmbeddedReady] = useState(false);

  const refreshTags = useCallback(async () => {
    const fetchedTags = await Airship.channel.getTags();
    setTags(fetchedTags);
  }, []);

  const refreshNamedUser = useCallback(async () => {
    const fetchedNamedUser = await Airship.contact.getNamedUserId();
    setNamedUser(fetchedNamedUser);
  }, []);

  const handleNamedUserSet = useCallback(async () => {
    await Airship.contact.identify(namedUserText);
    await refreshNamedUser();
    setNamedUserText(''); // Clear named user text once set
  }, [namedUserText, refreshNamedUser]);

  const handleTagAdd = useCallback(async () => {
    await Airship.channel.addTag(tagText);
    await refreshTags();
    setTagText('');
  }, [tagText, refreshTags]);

  const handleTagRemove = useCallback(
    async (text: string) => {
      await Airship.channel.removeTag(text);
      await refreshTags();
    },
    [refreshTags]
  );

  const handleNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      await Airship.push.enableUserNotifications({
        fallback: 'systemSettings',
      });
    } else {
      Airship.push.setUserNotificationsEnabled(false);
    }
  }, []);

  useEffect(() => {
    setEmbeddedReady(Airship.inApp.isEmbeddedReady('test'));

    Airship.channel.getChannelId().then((id) => {
      if (id) {
        setChannelId(id);
      }
    });

    Airship.push
      .getNotificationStatus()
      .then((status) => setNotificationsEnabled(status.isUserOptedIn));

    const fetchTags = async () => {
      const fetchedTags = await Airship.channel.getTags();
      setTags(fetchedTags);
    };

    fetchTags();

    const fetchNamedUser = async () => {
      const fetchedNamedUser = await Airship.contact.getNamedUserId();
      setNamedUser(fetchedNamedUser);
    };

    fetchNamedUser();

    let channelListener = Airship.addListener(
      EventType.ChannelCreated,
      (event) => {
        setChannelId(event.channelId);
      }
    );

    let embeddedListener = Airship.inApp.addEmbeddedReadyListener(
      'test',
      (isReady) => {
        setEmbeddedReady(isReady);
      }
    );

    let optInListener = Airship.addListener(
      EventType.PushNotificationStatusChangedStatus,
      (event) => {
        console.log('Event', event);
        setNotificationsEnabled(event.status.isUserOptedIn);
      }
    );

    return () => {
      channelListener.remove();
      embeddedListener.remove();
      optInListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 200 : 0}
    >
      <View style={{ flex: 1, flexShrink: 0, padding: 20 }}>
        {isEmbeddedReady ? (
          <View style={{ flex: 1 }}>
            <AirshipEmbeddedView embeddedId="test" style={{ flex: 1 }} />
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Image
              style={[styles.backgroundIcon, { paddingBottom: 0 }]}
              source={require('./../img/airship-mark.png')}
            />
          </View>
        )}

        <View style={[styles.roundedView, { marginVertical: 8 }]}>
          {Platform.OS === 'ios' ? (
            <Text style={{ fontWeight: 'bold', marginStart: 8 }}>
              Live Activities
            </Text>
          ) : (
            <Text style={{ fontWeight: 'bold', marginStart: 8 }}>
              Live Updates
            </Text>
          )}

          <Button
            onPress={async () => {
              if (Platform.OS === 'ios') {
                Airship.iOS.liveActivityManager.create({
                  attributesType: 'ExampleWidgetsAttributes',
                  content: {
                    state: {
                      emoji: '🙌',
                    },
                    relevanceScore: 0.0,
                  },
                  attributes: {
                    name: uuid.v4(),
                  },
                });
              } else {
                Airship.android.liveUpdateManager.create({
                  type: 'Example',
                  name: uuid.v4(),
                  content: {
                    emoji: '🙌',
                  },
                });
              }
            }}
            title="Start New"
            color="#841584"
          />

          <Button
            onPress={async () => {
              if (Platform.OS === 'ios') {
                const activities =
                  await Airship.iOS.liveActivityManager.listAll();
                activities.forEach((element) => {
                  Airship.iOS.liveActivityManager.end({
                    activityId: element.id,
                  });
                });
              } else {
                const activities =
                  await Airship.android.liveUpdateManager.listAll();
                activities.forEach((element) => {
                  Airship.android.liveUpdateManager.end({
                    name: element.name,
                  });
                });
              }
            }}
            title="End All"
            color="#841584"
          />

          <Button
            onPress={async () => {
              if (Platform.OS === 'ios') {
                const activities =
                  await Airship.iOS.liveActivityManager.listAll();
                activities.forEach((element) => {
                  Airship.iOS.liveActivityManager.update({
                    activityId: element.id,
                    content: {
                      state: {
                        emoji: element.content.state.emoji + '🙌',
                      },
                      relevanceScore: 0.0,
                    },
                  });
                });
              } else {
                const activities =
                  await Airship.android.liveUpdateManager.listAll();
                activities.forEach((element) => {
                  Airship.android.liveUpdateManager.update({
                    name: element.name,
                    content: {
                      emoji: element.content.emoji + '🙌',
                    },
                  });
                });
              }
            }}
            title="Update Alll"
            color="#841584"
          />
        </View>

        <View style={{ flexDirection: 'column' }}>
          {channelId ? (
            <>
              <View style={[styles.roundedView, { marginBottom: 8 }]} />
              <EnablePushCell
                notificationsEnabled={notificationsEnabled}
                handleNotificationsEnabled={handleNotificationsEnabled}
              />
              <View style={[styles.roundedView, { marginBottom: 8 }]}>
                <ChannelCell channelId={channelId} />
              </View>
              <View style={[styles.roundedView, { marginBottom: 8 }]}>
                <NamedUserManagerCell
                  namedUserText={namedUserText}
                  handleNamedUserSet={handleNamedUserSet}
                  handleUpdateNamedUserText={setNamedUserText}
                  namedUser={namedUser}
                />
              </View>
              <View style={styles.roundedView}>
                <TagManagerCell
                  tagText={tagText}
                  tags={tags}
                  handleTagAdd={handleTagAdd}
                  handleTagRemove={handleTagRemove}
                  handleUpdateTagText={setTagText}
                />
              </View>
            </>
          ) : (
            <View style={styles.warningView}>
              <Text style={styles.warningTitleText}>Channel Unavailble</Text>
              <Text style={styles.warningBodyText}>
                Have you added the takeOff call with the correct app key and
                secret?
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexGrow: 0 }} />
      </View>
    </KeyboardAvoidingView>
  );
}

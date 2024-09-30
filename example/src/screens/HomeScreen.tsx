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

  const handleNotificationsEnabled = useCallback((enabled: boolean) => {
    Airship.push.setUserNotificationsEnabled(enabled);
    setNotificationsEnabled(enabled);
  }, []);

  useEffect(() => {
    // Add takeOff here

    Airship.push
      .getNotificationStatus()
      .then((id) => {
        console.log(id);
      })
      .catch((error) => {
        console.error('Error getting notification status:', error);
      });

    setEmbeddedReady(Airship.inApp.isEmbeddedReady('test'));

    Airship.push.iOS
      .getAuthorizedNotificationSettings()
      .then((id) => {
        console.log(id);
      })
      .catch((error) => {
        console.error('Error getting notification settings:', error);
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

    Airship.push.isUserNotificationsEnabled().then(setNotificationsEnabled);

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

    let subscription = Airship.addListener(
      EventType.ChannelCreated,
      (event) => {
        setChannelId(event.channelId);
      }
    );

    Airship.inApp.addEmbeddedReadyListener('test', (isReady) => {
      console.log('Test ' + isReady);
      setEmbeddedReady(isReady);
    });

    return () => {
      subscription.remove();
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

        {Platform.OS === 'ios' ? (
          <View>
            <Button
              onPress={async () => {
                Airship.iOS.liveActivityManager.create({
                  attributesType: 'ExampleWidgetsAttributes',
                  content: {
                    state: {
                      emoji: '🙌',
                    },
                    relevanceScore: 0.0,
                  },
                  attributes: {
                    name: 'some-unique-name',
                  },
                });
              }}
              title="Start LA"
              color="#841584"
            />

            <Button
              onPress={async () => {
                const activities = await Airship.iOS.liveActivityManager.list({
                  attributesType: 'Example',
                });
                activities.forEach((element) => {
                  Airship.iOS.liveActivityManager.end({
                    activityId: element.id,
                    attributesType: 'ExampleWidgetsAttributes',
                  });
                });
              }}
              title="End All LA"
              color="#841584"
            />

            <Button
              onPress={async () => {
                const activities = await Airship.iOS.liveActivityManager.list({
                  attributesType: 'ExampleWidgetsAttributes',
                });
                activities.forEach((element) => {
                  Airship.iOS.liveActivityManager.update({
                    activityId: element.id,
                    attributesType: 'ExampleWidgetsAttributes',
                    content: {
                      state: {
                        emoji: element.content.state.emoji + '🙌',
                      },
                      relevanceScore: 0.0,
                    },
                  });
                });
              }}
              title="Update All LA"
              color="#841584"
            />
          </View>
        ) : (
          <View />
        )}

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

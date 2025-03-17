/* Copyright Airship and Contributors */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Button,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import styles from '../Styles';
import Airship, { 
  EventType,
  AirshipEmbeddedView,
} from '@ua/react-native-airship';

type HomeScreenProps = {
  navigation: any;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isEmbeddedReady, setEmbeddedReady] = useState(false);
  const embeddedViewId = "test";
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');
  const [namedUser, setNamedUser] = useState<string | undefined>(undefined);
  const [namedUserText, setNamedUserText] = useState('');
  const [loading, setLoading] = useState(false);

  const refreshTags = useCallback(async () => {
    try {
      const fetchedTags = await Airship.channel.getTags();
      setTags(fetchedTags);
    } catch (error) {
      // Ignore errors fetching tags
    }
  }, []);

  const refreshNamedUser = useCallback(async () => {
    try {
      const fetchedNamedUser = await Airship.contact.getNamedUserId();
      setNamedUser(fetchedNamedUser);
    } catch (error) {
      // Ignore errors fetching named user
    }
  }, []);

  const handleNamedUserSet = useCallback(async () => {
    if (!namedUserText) return;
    setLoading(true);
    try {
      await Airship.contact.identify(namedUserText);
      await refreshNamedUser();
      setNamedUserText(''); // Clear named user text once set
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [namedUserText, refreshNamedUser]);

  const handleTagAdd = useCallback(async () => {
    if (!tagText) return;
    setLoading(true);
    try {
      await Airship.channel.addTag(tagText);
      await refreshTags();
      setTagText('');
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [tagText, refreshTags]);

  const handleTagRemove = useCallback(async (text: string) => {
    setLoading(true);
    try {
      await Airship.channel.removeTag(text);
      await refreshTags();
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, [refreshTags]);

  const handleNotificationsEnabled = useCallback(async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled) {
        await Airship.push.enableUserNotifications({
          fallback: 'systemSettings',
        });
      } else {
        await Airship.push.setUserNotificationsEnabled(false);
      }
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  const startLiveActivity = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        await Airship.iOS.liveActivityManager.start({
          attributesType: 'ExampleWidgetsAttributes',
          content: {
            state: {
              emoji: '🙌',
            },
            relevanceScore: 0.0,
          },
          attributes: {
            name: Date.now().toString(),
          },
        });
      } else {
        await Airship.android.liveUpdateManager.start({
          type: 'Example',
          name: Date.now().toString(),
          content: {
            emoji: '🙌',
          },
        });
      }
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  const endAllLiveActivities = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        const activities = await Airship.iOS.liveActivityManager.listAll();
        for (const element of activities) {
          await Airship.iOS.liveActivityManager.end({
            activityId: element.id,
            dismissalPolicy: {
              type: "immediate"
            }
          });
        }
      } else {
        const activities = await Airship.android.liveUpdateManager.listAll();
        for (const element of activities) {
          await Airship.android.liveUpdateManager.end({
            name: element.name,
          });
        }
      }
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  const updateAllLiveActivities = async () => {
    setLoading(true);
    try {
      if (Platform.OS === 'ios') {
        const activities = await Airship.iOS.liveActivityManager.listAll();
        for (const element of activities) {
          await Airship.iOS.liveActivityManager.update({
            activityId: element.id,
            content: {
              state: {
                emoji: element.content.state.emoji + '🙌',
              },
              relevanceScore: 0.0,
            },
          });
        }
      } else {
        const activities = await Airship.android.liveUpdateManager.listAll();
        for (const element of activities) {
          await Airship.android.liveUpdateManager.update({
            name: element.name,
            content: {
              emoji: element.content.emoji + '🙌',
            },
          });
        }
      }
    } catch (error) {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Check embedded view ready state
        setEmbeddedReady(Airship.inApp.isEmbeddedReady(embeddedViewId));
        
        // Get channel ID
        const id = await Airship.channel.getChannelId();
        if (id) {
          setChannelId(id);
        }
        
        // Check notification status
        const status = await Airship.push.getNotificationStatus();
        setNotificationsEnabled(status.isUserOptedIn);
        
        // Get tags
        const fetchedTags = await Airship.channel.getTags();
        setTags(fetchedTags);
        
        // Get named user
        const fetchedNamedUser = await Airship.contact.getNamedUserId();
        setNamedUser(fetchedNamedUser);
      } catch (error) {
        // Expected error when Airship is not initialized
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // Set up listeners
    const channelListener = Airship.addListener(
      EventType.ChannelCreated,
      (event) => {
        setChannelId(event.channelId);
      }
    );

    const embeddedListener = Airship.inApp.addEmbeddedReadyListener(
      embeddedViewId,
      (isReady) => {
        setEmbeddedReady(isReady);
      }
    );

    const optInListener = Airship.addListener(
      EventType.PushNotificationStatusChangedStatus,
      (event) => {
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
      <ScrollView style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#004bff" />
          </View>
        )}
        
        {/* Main Content */}
        {channelId ? (
          <>
            {/* Embedded View Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Airship Embedded View</Text>
              </View>
              {isEmbeddedReady ? (
                <>
                  <View style={styles.embeddedContainer}>
                    <AirshipEmbeddedView embeddedId={embeddedViewId} style={{ height: 150 }} />
                  </View>
                  <Text style={styles.embeddedCaption}>Embedded View ID: "{embeddedViewId}"</Text>
                </>
              ) : (
                <View style={styles.homeHeaderContainer}>
                  <Text style={styles.sectionSubtitle}>Embedded view with ID: "{embeddedViewId}" is not available yet</Text>
                </View>
              )}
            </View>
            {/* Push Notifications Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Push Notifications</Text>
              </View>
              <View style={styles.pushContainer}>
                <TouchableOpacity
                  style={[
                    styles.pushButton,
                    { backgroundColor: notificationsEnabled ? '#6ca15f' : '#E0E0E0' }
                  ]}
                  onPress={() => handleNotificationsEnabled(!notificationsEnabled)}
                >
                  <Text style={styles.pushButtonText}>
                    {notificationsEnabled ? 'Push Enabled' : 'Push Disabled'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Channel ID Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Channel ID</Text>
              </View>
              <View style={styles.channelIdContainer}>
                <Text style={styles.channelIdLabel}>Tap to copy to clipboard:</Text>
                <TouchableHighlight 
                  onPress={() => {
                    // Copy to clipboard would go here
                  }}
                  underlayColor="#F0F0F0"
                >
                  <Text style={styles.channelIdValue}>{channelId}</Text>
                </TouchableHighlight>
              </View>
            </View>

            {/* Named User Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Named User</Text>
              </View>
              <View style={styles.namedUserContainer}>
                <Text style={styles.namedUserLabel}>
                  Current Named User: {namedUser ? namedUser : 'Not set'}
                </Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter named user ID"
                    value={namedUserText}
                    onChangeText={setNamedUserText}
                    onSubmitEditing={handleNamedUserSet}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={handleNamedUserSet}
                  >
                    <Text style={styles.inputButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tags Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tags</Text>
              </View>
              <View style={styles.tagsContainer}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter tag"
                    value={tagText}
                    onChangeText={setTagText}
                    onSubmitEditing={handleTagAdd}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.inputButton}
                    onPress={handleTagAdd}
                  >
                    <Text style={styles.inputButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagsDisplay}>
                  {tags.map((tag) => (
                    <View key={tag} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{tag}</Text>
                      <TouchableOpacity
                        style={styles.tagRemoveButton}
                        onPress={() => handleTagRemove(tag)}
                      >
                        <Text style={styles.tagRemoveButtonText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Live Activities/Updates Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {Platform.OS === 'ios' ? 'Live Activities' : 'Live Updates'}
                </Text>
              </View>
              <View style={styles.liveButtonRow}>
                <Button
                  title="Start New"
                  onPress={startLiveActivity}
                  color="#004bff"
                />
              </View>
              <View style={styles.liveButtonRow}>
                <Button
                  title="End All"
                  onPress={endAllLiveActivities}
                  color="#004bff"
                />
              </View>
              <View style={styles.liveButtonRow}>
                <Button
                  title="Update All"
                  onPress={updateAllLiveActivities}
                  color="#004bff"
                />
              </View>
            </View>
            
          </>
        ) : (
          <View style={[styles.section, {backgroundColor: '#FFEBEE'}]}>
            <Text style={styles.warningTitle}>Channel Unavailable</Text>
            <Text style={styles.warningText}>
              Have you added the takeOff call with the correct app key and secret?
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
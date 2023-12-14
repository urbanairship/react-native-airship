import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, FlatList, Image, ScrollView, Switch, TextInput, TouchableOpacity } from 'react-native';
import Airship from '@ua/react-native-airship';
import styles from '../Styles';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagText, setTagText] = useState('');
  const [namedUserText, setNamedUserText] = useState('');
  const [namedUser, setNamedUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    console.log(navigation.getState());

    Airship.push.isUserNotificationsEnabled().then(setNotificationsEnabled);

    const fetchTags = async () => {
      const fetchedTags = await Airship.channel.getTags();
      setTags(fetchedTags);
    };

    const fetchNamedUser = async () => {
      const fetchedNamedUser = await Airship.contact.getNamedUserId();
      setNamedUser(fetchedNamedUser);
    };

    fetchTags();
    fetchNamedUser();
  }, [navigation]);

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
    setNamedUserText(namedUserText);
  }, [namedUserText, refreshNamedUser]);

  const handleTagAdd = useCallback(async () => {
    await Airship.channel.addTag(tagText);
    await refreshTags();
    setTagText('');
  }, [tagText, refreshTags]);

  const handleTagRemove = useCallback(async (text: string) => {
    await Airship.channel.removeTag(text);
    await refreshTags();
  }, [refreshTags]);

  const handleNotificationsEnabled = useCallback((enabled: boolean) => {
    Airship.push.setUserNotificationsEnabled(enabled);
    setNotificationsEnabled(enabled);
  }, []);

  const handleMessageCenterDisplay = useCallback(() => {
    Airship.messageCenter.display();
  }, []);

  const openPreferenceCenter = useCallback(() => {
    const centerId = 'neat';
    Airship.preferenceCenter.setAutoLaunchDefaultPreferenceCenter(centerId, false);
    Airship.preferenceCenter.display(centerId);
  }, []);


  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          style={{ width: '100%', resizeMode: 'contain', alignItems: 'center' }}
          source={require('./../img/airship-mark.png')}
        />
        <View style={{ height: 75 }} />
        <EnablePushCell
          notificationsEnabled={notificationsEnabled}
          handleNotificationsEnabled={handleNotificationsEnabled}
        />
        <View />
        <NamedUserManagerCell
          namedUserText={namedUserText}
          handleNamedUserSet={handleNamedUserSet}
          handleUpdateNamedUserText={setNamedUserText}
          namedUser={namedUser}
        />
        <TagsManagerCell
          tagText={tagText}
          tags={tags}
          handleTagAdd={handleTagAdd}
          handleTagRemove={handleTagRemove}
          handleUpdateTagText={setTagText}
        />
        <Button
          color="#0d6a83"
          onPress={handleMessageCenterDisplay}
          title="Message Center"
        />
        <Button
          color="#0d6a83"
          onPress={openPreferenceCenter}
          title="Preference Center"
        />
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const EnablePushCell: React.FC<{
  notificationsEnabled: boolean;
  handleNotificationsEnabled: (value: boolean) => void;
}> = ({ notificationsEnabled, handleNotificationsEnabled }) => (
  <View style={styles.cellContainer}>
    <Text style={styles.rowLabel}>Enable Push</Text>
    <Switch
      trackColor={{ true: '#0d6a83', false: null }}
      onValueChange={handleNotificationsEnabled}
      value={notificationsEnabled}
    />
  </View>
);

const NamedUserManagerCell: React.FC<{
  namedUserText: string;
  handleNamedUserSet: () => void;
  handleUpdateNamedUserText: (value: string) => void;
  namedUser: string | undefined;
}> = ({ namedUserText, handleNamedUserSet, handleUpdateNamedUserText, namedUser }) => (
  <View style={styles.managerCell}>
    <View style={styles.stackRight}>
      <NamedUserInputCell
        namedUserText={namedUserText}
        handleNamedUserSet={handleNamedUserSet}
        handleUpdateNamedUserText={handleUpdateNamedUserText}
        placeholder={'named user'}
      />
      <Text style={{ marginLeft: 10, color: '#0d6a83' }}>
        {namedUser ? `Named User: ${namedUser}` : null}
      </Text>
    </View>
  </View>
);

const NamedUserInputCell: React.FC<{
  namedUserText: string;
  handleNamedUserSet: () => void;
  handleUpdateNamedUserText: (value: string) => void;
  placeholder: string;
}> = ({ namedUserText, handleNamedUserSet, handleUpdateNamedUserText, placeholder }) => (
  <View style={styles.miniCellContainer}>
    <TextInput
      style={styles.textInput}
      autoCorrect={false}
      autoCapitalize={'none'}
      onSubmitEditing={handleNamedUserSet}
      onChangeText={handleUpdateNamedUserText}
      value={namedUserText}
      placeholder={placeholder}
    />
    <View>
      <Button
        color="#0d6a83"
        onPress={handleNamedUserSet}
        title="Set Named User"
      />
    </View>
  </View>
);

const TagsManagerCell: React.FC<{
  tagText: string;
  tags: string[];
  handleTagAdd: () => void;
  handleTagRemove: (value: string) => void;
  handleUpdateTagText: (value: string) => void;
}> = ({ tagText, tags, handleTagAdd, handleTagRemove, handleUpdateTagText }) => (
  <View style={styles.managerCell}>
    <View style={styles.stackRight}>
      <TagInputCell
        tagText={tagText}
        handleTagAdd={handleTagAdd}
        handleUpdateTagText={handleUpdateTagText}
        placeholder={'tag'}
      />
      <FlatList
        horizontal={true}
        data={tags}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.cellContainer}>
            <Text style={{ color: '#0d6a83' }}>{item}</Text>
            <TouchableOpacity
              style={styles.circle}
              onPress={() => handleTagRemove(item)}
            >
              <View style={styles.dash} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  </View>
);

const TagInputCell: React.FC<{
  tagText: string;
  handleTagAdd: () => void;
  handleUpdateTagText: (value: string) => void;
  placeholder: string;
}> = ({ tagText, handleTagAdd, handleUpdateTagText, placeholder }) => (
  <View style={styles.miniCellContainer}>
    <TextInput
      style={styles.textInput}
      autoCorrect={false}
      autoCapitalize={'none'}
      onSubmitEditing={() => handleTagAdd()}
      onChangeText={handleUpdateTagText}
      value={tagText}
      placeholder={placeholder}
    />
    <View>
      <Button
        color="#0d6a83"
        onPress={() => handleTagAdd()}
        title="Add Tag"
      />
    </View>
  </View>
);

import * as React from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Image,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Airship from '@ua/react-native-airship';

import styles from '../Styles';

interface SettingsScreenProps {
  navigation: any;
}

export default class SettingsScreen extends React.Component<
  SettingsScreenProps,
  {
    notificationsEnabled: boolean;
    tags: string[];
    tagText: string;
    namedUserText: string;
    namedUser: string | undefined;
  }
> {
  constructor(props: SettingsScreenProps) {
    super(props);
    console.log(props.navigation.getState());
    this.state = {
      notificationsEnabled: false,
      tags: [],
      tagText: '',
      namedUserText: '',
      namedUser: undefined,
    };

    this.handleNotificationsEnabled =
      this.handleNotificationsEnabled.bind(this);

    this.handleTagAdd = this.handleTagAdd.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleUpdateTagText = this.handleUpdateTagText.bind(this);

    this.handleNamedUserSet = this.handleNamedUserSet.bind(this);
    this.handleUpdateNamedUserText = this.handleUpdateNamedUserText.bind(this);
    this.handleRenderNamedUser = this.handleRenderNamedUser.bind(this);
    this.handleMessageCenterDisplay =
      this.handleMessageCenterDisplay.bind(this);

    this.handleUpdateTagsList();
    this.handleUpdateNamedUser();
  }

  handleNotificationsEnabled(enabled: boolean) {
    Airship.push.setUserNotificationsEnabled(enabled);
    this.setState({ notificationsEnabled: enabled });
  }

  handleUpdateNamedUser() {
    Airship.contact.getNamedUserId().then((data) => {
      this.setState({
        namedUser: data!,
      });
    });
  }

  handleNamedUserSet(text: string) {
    Airship.contact.identify(text);
    this.handleUpdateNamedUser();
    this.setState({ namedUserText: '' });
  }

  handleRenderNamedUser(text: string) {
    if (text != null) {
      return <Text>Named User: {this.state.namedUser}</Text>;
    } else {
      return null;
    }
  }

  handleUpdateNamedUserText(text: string) {
    this.setState({ namedUserText: text });
  }

  handleUpdateTagsList() {
    Airship.channel.getTags().then((data) => {
      this.setState({
        tags: data,
      });
    });
  }

  handleTagAdd(text: string) {
    Airship.channel.addTag(text);
    this.handleUpdateTagsList();
    this.setState({ tagText: '' });
  }

  handleTagRemove(text: string) {
    Airship.channel.removeTag(text);
    this.handleUpdateTagsList();
  }

  handleUpdateTagText(text: string) {
    this.setState({ tagText: text });
  }

  handleMessageCenterDisplay() {
    Airship.messageCenter.display();
  }

  openPreferenceCenter() {
    Airship.preferenceCenter.setAutoLaunchDefaultPreferenceCenter(
      'neat',
      false
    );
    Airship.preferenceCenter.display('neat');
    Airship.preferenceCenter.setAutoLaunchDefaultPreferenceCenter(
      'neat',
      false
    );
  }

  componentDidMount() {
    Airship.push.isUserNotificationsEnabled().then((enabled) => {
      this.setState({ notificationsEnabled: enabled });
    });
  }

  render() {
    return (
      <View style={styles.backgroundContainer}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Image
            style={{
              width: 300,
              height: 38,
              marginTop: 50,
              alignItems: 'center',
            }}
            source={require('./../img/airship-mark.png')}
          />
          <View style={{ height: 75 }} />
          <EnablePushCell
            notificationsEnabled={this.state.notificationsEnabled}
            handleNotificationsEnabled={this.handleNotificationsEnabled}
          />
          <View />
          <NamedUserManagerCell
            namedUserText={this.state.namedUserText}
            handleNamedUserSet={this.handleNamedUserSet}
            handleUpdateNamedUserText={this.handleUpdateNamedUserText}
            handleRenderNamedUser={this.handleRenderNamedUser}
          />
          <TagsManagerCell
            tagText={this.state.tagText}
            tags={this.state.tags}
            handleTagAdd={this.handleTagAdd}
            handleTagRemove={this.handleTagRemove}
            handleUpdateTagText={this.handleUpdateTagText}
          />
          <Button
            color="#0d6a83"
            onPress={() => this.handleMessageCenterDisplay()}
            title="Message Center"
          />
          <Button
            color="#0d6a83"
            onPress={() => this.openPreferenceCenter()}
            title="Preference Center"
          />
        </ScrollView>
      </View>
    );
  }
}

class EnablePushCell extends React.Component<{
  notificationsEnabled: boolean;
  handleNotificationsEnabled: (value: boolean) => void;
}> {
  render() {
    return (
      <View style={styles.cellContainer}>
        <Text style={styles.rowLabel}>Enable Push</Text>
        <Switch
          trackColor={{ true: '#0d6a83', false: null }}
          onValueChange={(value) =>
            this.props.handleNotificationsEnabled(value)
          }
          value={this.props.notificationsEnabled}
        />
      </View>
    );
  }
}

class NamedUserManagerCell extends React.Component<{
  namedUserText: string;
  handleNamedUserSet: (value: string) => void;
  handleUpdateNamedUserText: (value: string) => void;
  handleRenderNamedUser: (value: string) => React.ReactElement | null;
}> {
  render() {
    return (
      <View style={styles.managerCell}>
        <View style={styles.stackRight}>
          <NamedUserInputCell
            namedUserText={this.props.namedUserText}
            handleNamedUserSet={this.props.handleNamedUserSet}
            handleUpdateNamedUserText={this.props.handleUpdateNamedUserText}
            handleRenderNamedUser={this.props.handleRenderNamedUser}
            placeholder={'named user'}
          />
          <Text style={{ marginLeft: 10, color: '#0d6a83' }}>
            {this.props.handleRenderNamedUser(this.props.namedUserText)}
          </Text>
        </View>
      </View>
    );
  }
}

class NamedUserInputCell extends React.Component<{
  namedUserText: string;
  handleNamedUserSet: (value: string) => void;
  handleUpdateNamedUserText: (value: string) => void;
  handleRenderNamedUser: (value: string) => React.ReactElement | null;
  placeholder: string;
}> {
  render() {
    return (
      <View style={styles.miniCellContainer}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize={'none'}
          onSubmitEditing={(_event) =>
            this.props.handleNamedUserSet(this.props.namedUserText)
          }
          onChangeText={(text) => this.props.handleUpdateNamedUserText(text)}
          value={this.props.namedUserText}
        />
        <View>
          <Button
            color="#0d6a83"
            onPress={() =>
              this.props.handleNamedUserSet(this.props.namedUserText)
            }
            title="Set Named User"
          />
        </View>
      </View>
    );
  }
}

class TagsManagerCell extends React.Component<{
  tagText: string;
  tags: string[];
  handleTagAdd: (value: string) => void;
  handleTagRemove: (value: string) => void;
  handleUpdateTagText: (value: string) => void;
}> {
  render() {
    return (
      <View style={styles.managerCell}>
        <View style={styles.stackRight}>
          <TagInputCell
            tagText={this.props.tagText}
            handleTagAdd={this.props.handleTagAdd}
            handleUpdateTagText={this.props.handleUpdateTagText}
            placeholder={'tag'}
          />
          <FlatList
            horizontal={true}
            data={this.props.tags}
            keyExtractor={(item, _index) => item}
            renderItem={({ item }) => (
              <View style={styles.cellContainer}>
                <Text style={{ color: '#0d6a83' }}>{item}</Text>
                <View style={styles.circle}>
                  <TouchableOpacity
                    style={styles.circle}
                    onPress={() => this.props.handleTagRemove(item)}
                  />
                  <View style={styles.dash} />
                </View>
              </View>
            )}
          />
        </View>
      </View>
    );
  }
}

class TagInputCell extends React.Component<{
  tagText: string;
  handleTagAdd: (value: string) => void;
  handleUpdateTagText: (value: string) => void;
  placeholder: string;
}> {
  render() {
    return (
      <View style={styles.miniCellContainer}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize={'none'}
          onSubmitEditing={(event) =>
            this.props.handleTagAdd(event.nativeEvent.text)
          }
          onChangeText={(text) => this.props.handleUpdateTagText(text)}
          value={this.props.tagText}
        />
        <View>
          <Button
            color="#0d6a83"
            onPress={() => this.props.handleTagAdd(this.props.tagText || '')}
            title="Add Tag"
          />
        </View>
      </View>
    );
  }
}

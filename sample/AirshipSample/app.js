/**
 * Sample React Native App
 * @flow
 */
'use strict';

import {
 UrbanAirship,
 UACustomEvent,
} from 'urbanairship-react-native'

import React, {
  Component,
} from 'react';

import {
  StyleSheet,
  Text,
  View,
  AppRegistry,
  Image,
  Switch,
  Button,
  ListView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

const styles = StyleSheet.create({
  centeredContainer: {
    flex: 1,
    flexDirection:'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0A500',
  },
  stackRight: {
    flex: 1,
    flexDirection:'column',
    alignItems: 'flex-start',
    backgroundColor: '#E0A500',
  },
  cellContainer: {
    flex: 0,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0A500',
    marginTop: 15,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  miniCellContainer: {
    flex: 0,
    flexDirection:'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0A500',
    marginRight: 10,
    marginLeft: 10,
  },
  managerCell: {
    flex:0,
    flexDirection:'row',
    padding:10
  },
  channel: {
    fontSize: 16,
    color: '#0d6a83',
    textAlign: 'center',
    padding: 10,
  },
  rowLabel: {
    flexDirection:'row',
    color: '#0d6a83',
    fontSize: 16,
    marginRight: 10
  },
  instructions: {
    fontSize: 11,
    marginTop: 40,
    textAlign: 'center',
    color: '#0d6a83',
    marginBottom: 5,
  },
  textInput: {
    flex:1,
    color:'#0d6a83',
    alignSelf: 'flex-start',
    width: 100,
    flexDirection:'row',
    height: 35,
    borderColor:'white',
    borderWidth: 1,
  },
  inputButton: {
    width: 150,
    height: 35,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 20/2,
    backgroundColor: '#0d6a83'
  },
  dash: {
   backgroundColor: 'white',
   height: 2,
   width: 10,
   position: 'absolute',
   left: 5,
   top: 8.5,
 },
});

const notificationsEnabledKey = "com.urbanairship.notificationsEnabled"
const locationEnabledKey = "com.urbanairship.locationEnabled"

export default class AirshipSample extends Component {
  constructor(props) {
    super(props);

    const tagsDS = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      channelId: "",
      notificationsEnabled: false,
      locationEnabled: false,
      tagsDS: tagsDS.cloneWithRows(['']),
      tagText:"",
      namedUserText:"",
    }

    this.handleNotificationsEnabled = this.handleNotificationsEnabled.bind(this);
    this.handleLocationEnabled = this.handleLocationEnabled.bind(this);

    this.handleTagAdd = this.handleTagAdd.bind(this);
    this.handleTagRemove = this.handleTagRemove.bind(this);
    this.handleUpdateTagText= this.handleUpdateTagText.bind(this);

    this.handleNamedUserSet = this.handleNamedUserSet.bind(this);
    this.handleUpdateNamedUserText = this.handleUpdateNamedUserText.bind(this);
    this.handleRenderNamedUser = this.handleRenderNamedUser.bind(this);

    this.handleUpdateTagsList();
    this.handleUpdateNamedUser();
  }

  handleNotificationsEnabled(enabled) {
    UrbanAirship.setUserNotificationsEnabled(enabled)
    this.setState({notificationsEnabled:enabled});
  }

  handleLocationEnabled(enabled) {
    UrbanAirship.setLocationEnabled(enabled)
    this.setState({locationEnabled:enabled});
  }

  handleUpdateNamedUser () {
    UrbanAirship.getNamedUser().then((data) => {
         this.setState({
           namedUser: data,
         });
    });
  }

  handleNamedUserSet(text) {
    UrbanAirship.setNamedUser(text)
    this.handleUpdateNamedUser();
    this.setState({namedUserText:""})
  }

  handleRenderNamedUser(text) {
    if (text != null) {
      return (
          <Text>
            Named User: {this.state.namedUser}
          </Text>
        );
    } else {
      return null;
    }
  }

  handleUpdateNamedUserText(text) {
    this.setState({namedUserText:text})
  }

  handleUpdateTagsList () {
    const tagsDS = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    UrbanAirship.getTags().then((data) => {
      this.setState({
        tagsDS: tagsDS.cloneWithRows(data),
      });
    });
  }

  handleTagAdd(text) {
    UrbanAirship.addTag(text)
    this.handleUpdateTagsList();
    this.setState({tagText:""})
  }

  handleTagRemove(text) {
    UrbanAirship.removeTag(text)
    this.handleUpdateTagsList();
  }

  handleUpdateTagText(text) {
    this.setState({tagText:text})
  }

  componentWillMount() {
    UrbanAirship.getChannelId().then((channelId) => {
      this.setState({channelId:channelId})
    });

    UrbanAirship.isUserNotificationsEnabled().then ((enabled) => {
      this.setState({notificationsEnabled:enabled})
    })

    UrbanAirship.isLocationEnabled().then ((enabled) => {
      this.setState({locationEnabled:enabled})
    })

    UrbanAirship.addListener("notificationResponse", (response) => {
      console.log('notificationResponse:', JSON.stringify(response));
      alert("notificationResponse: " + response.notification.alert);
    });

    UrbanAirship.addListener("pushReceived", (notification) => {
      console.log('pushReceived:', JSON.stringify(notification));
      alert("pushReceived: " + notification.alert);
    });

    UrbanAirship.addListener("deepLink", (event) => {
      console.log('deepLink:', JSON.stringify(event));
      alert("deepLink: " + event.deepLink);
    });

    UrbanAirship.addListener("registration", (event) => {
      console.log('registration:', JSON.stringify(event));
      this.state.channelId = channelId;
      this.setState(this.state);
    });

    UrbanAirship.addListener("notificationOptInStatus", (event) => {
      console.log('notificationOptInStatus:', JSON.stringify(event));
    });
  }

  render() {

    let channelcell = null
    if (this.state.channelId) {
      channelcell = <ChannelCell channelId={this.state.channelId}/>;
    }

    return (
      <View style={styles.centeredContainer}>
        <Image
          style={{width: 300, height: 38, marginTop:50}}
          source={require('./img/urban-airship-sidebyside.png')}
        />
        <View style={{height:75}}>
        </View>
        <EnablePushCell
          notificationsEnabled={this.state.notificationsEnabled}
          handleNotificationsEnabled={this.handleNotificationsEnabled}
        />
        <View>
          {channelcell}
        </View>
        <NamedUserManagerCell
          namedUserText={this.state.namedUserText}
          handleNamedUserSet={this.handleNamedUserSet}
          handleUpdateNamedUserText={this.handleUpdateNamedUserText}
          handleRenderNamedUser={this.handleRenderNamedUser}
        />
        <TagsManagerCell
          tagText={this.state.tagText}
          tagsDS={this.state.tagsDS}
          handleTagAdd={this.handleTagAdd}
          handleTagRemove={this.handleTagRemove}
          handleUpdateTagText={this.handleUpdateTagText}
        />
        <EnableLocationCell
          locationEnabled={this.state.locationEnabled}
          handleLocationEnabled={this.handleLocationEnabled}
        />
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    );
  }
}

class ChannelCell extends Component {
  render() {
    return (
      <Text style={styles.channel}>
        Channel ID {'\n'}
        {this.props.channelId}
      </Text>
    );
  }
}

class EnablePushCell extends Component {
  render() {
    return (
      <View style={styles.cellContainer}>
        <Text style={styles.rowLabel}>
          Enable Push
        </Text>
        <Switch
          onTintColor='#0d6a83'
          onValueChange={(value) => this.props.handleNotificationsEnabled(value)}
          value={this.props.notificationsEnabled}
        />
      </View>
    );
  }
}

class EnableLocationCell extends Component {
  render() {
    return (
      <View style={styles.cellContainer}>
        <Text style={styles.rowLabel}>
          Enable Location
        </Text>
        <Switch
          onTintColor='#0d6a83'
          onValueChange={(value) => this.props.handleLocationEnabled(value)}
          value={this.props.locationEnabled}
        />
      </View>
    );
  }
}

class NamedUserManagerCell extends Component {
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
          <Text style={{marginLeft:10, color:'#0d6a83'}}>
            {this.props.handleRenderNamedUser(this.props.namedUserText)}
          </Text>
        </View>
      </View>
    );
  }
}

class NamedUserInputCell extends Component {
  render () {
        return (
          <View style={styles.miniCellContainer}>
            <TextInput
              style={styles.textInput}
              autoCorrect={false}
              autoCapitalize={'none'}
              onSubmitEditing={(event) => this.props.handleNamedUserSet(this.props.namedUserText)}
              onChangeText={(text) => this.props.handleUpdateNamedUserText(text)}
              value={this.props.namedUserText}
            />
            <View style={styles.inputButton}>
               <Button
                 color='#0d6a83'
                 onPress={() => this.props.handleNamedUserSet(this.props.namedUserText)}
                 title="Set Named User"
               />
            </View>
          </View>
       );
    }
}

class TagsManagerCell extends Component {
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
        <ListView
          horizontal={true}
          enableEmptySections={true}
          dataSource={this.props.tagsDS}
          renderRow={(rowData) =>
            <View style={styles.cellContainer}>
              <Text style={{color:'#0d6a83'}}>
              {rowData}
              </Text>
              <View style={styles.circle}>
                <TouchableOpacity
                style={styles.circle}
                onPress={() => this.props.handleTagRemove(rowData)}
                title="-"
                />
                <View style = {styles.dash}/>
                </View>
              </View>
          }
        />
        </View>
      </View>
    );
  }
}

class TagInputCell extends Component {
  render () {
    return (
      <View style={styles.miniCellContainer}>
        <TextInput
          style={styles.textInput}
          autoCorrect={false}
          autoCapitalize={'none'}
          onSubmitEditing={(event) => this.props.handleTagAdd(event.nativeEvent.text)}
          onChangeText={(text) => this.props.handleUpdateTagText(text)}
          value={this.props.tagText}
        />
        <View style={styles.inputButton}>
          <Button
             color='#0d6a83'
             onPress={() => this.props.handleTagAdd(this.props.tagText || '')}
             title="Add Tag"
          />
       </View>
      </View>
    );
  }
}

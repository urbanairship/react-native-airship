/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * HomeScreen: Contains only the channelId for the moment.
 */
'use strict';

import {
  UrbanAirship,
} from 'urbanairship-react-native'

import React, {
  Component,
} from 'react';

import {
  Text,
  View,
  Image,
  ScrollView,
} from 'react-native';

import styles from './../Styles'

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

export default class HomeScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      channelId: ""
    }
  }

  componentDidMount() {
    //console.log(UrbanAirship.getAirshipVersion());
    // UrbanAirship.getAirshipVersion(value => {
    //   console.log("Version : " + value);
    //   this.setState({ channelId: value})
    // })
    // const urbanAirshipDeeplinkListener = UrbanAirship.addListener(
    //   EventType.DeepLink,
    //   async event => {
    //     console.log("deeplink received");
    //   },
    // );
    UrbanAirship.getChannelId().then((channelId) => {
      this.setState({ channelId: channelId })
    });
  }

  render() {
    let channelcell = null
    if (this.state.channelId) {
      channelcell = <ChannelCell channelId={this.state.channelId} />;
    }

    return (
      <View style={styles.backgroundContainer}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Image
            style={{ width: 300, height: 38, marginTop: 50, alignItems: 'center' }}
            source={require('./../img/urban-airship-sidebyside.png')}
          />
          <View style={{ height: 75 }}>
          </View>
          {channelcell}
        </ScrollView>
        <View style={styles.bottom}>
          <Text style={styles.instructions}>
            Press Cmd+R to reload,{'\n'}
              Cmd+D or shake for dev menu
            </Text>
        </View>
      </View>
    );
  }
}

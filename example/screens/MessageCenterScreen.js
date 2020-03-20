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
  Button,
} from 'react-native';

import styles from './../Styles'

export default class MessageCenterScreen extends React.Component {

  constructor(props) {
    super (props);

    this.handleMessageCenterDisplay = this.handleMessageCenterDisplay.bind(this);
  }

  componentDidMount() {
    this.handleMessageCenterDisplay()
  }

  handleMessageCenterDisplay() {
    UrbanAirship.displayMessageCenter()
  }


  render() {
    return (
       <View style={styles.backgroundContainer}>
         <ScrollView contentContainerStyle={styles.contentContainer}>
           <Image
             style={{width: 300, height: 38, marginTop:50, alignItems:'center'}}
             source={require('./../img/urban-airship-sidebyside.png')}
           />
           <View style={{height:75}}>
           </View>
           <Button
             color='#0d6a83'
             onPress={() => this.handleMessageCenterDisplay()}
             title="Message center"
           />
         </ScrollView>
       </View>
    );
  }
}

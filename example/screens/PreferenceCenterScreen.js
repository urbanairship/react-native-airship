/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * PreferenceScreen: Contains the preference for a choosen identifier to be displayed.
 */
'use strict';

import React, {
  Component,
} from 'react';

import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  SectionList,
} from 'react-native';

import {
  UrbanAirship,
  EventType
} from 'urbanairship-react-native'

import {
  AirshipPreferenceCenter,
} from 'urbanairship-preference-center-react-native'

import { StatusBar } from 'react-native';
import TableView from 'react-native-tableview';

const { Section, Item } = TableView;

export default class PreferenceScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        preferenceCenterId: "neat",
        preferenceCenterConfig: {},
        activeChannelSubscriptions: [],
        activeContactSubscriptions: {},
        preferenceCenterData: []
    }

    this.initAirshipListeners();
    this.fillInSubscriptionList();
    this.updatePreferenceCenterConfig();
  }

  initAirshipListeners () {
    AirshipPreferenceCenter.addPreferenceCenterOpenListener( (body) => {
        //Navigate to custom UI
        console.log("Preference center opened : " + body);
    });
  }

  fillInSubscriptionList() {
    UrbanAirship.getSubscriptionLists(["channel", "contact"]).then((subscriptionList) => {
        this.setState({
            activeChannelSubscriptions: subscriptionList.channel,
            activeContactSubscriptions: subscriptionList.contact
        });
    });
  }

  updatePreferenceCenterConfig() {
    AirshipPreferenceCenter.getConfiguration(this.state.preferenceCenterId).then((config) => {
        this.setState({ preferenceCenterConfig: config })
        var sections = config.sections;
        if (sections) {
           var data = []
           sections.map((section) => {
             data = data.concat({title: section.display, data: section.items});
           });
           this.setState({ preferenceCenterData: data })
        }
    });
  }

  isSubscribedChannelSubscription(subscriptionId) {
    if (this.state.activeChannelSubscriptions != null) {
        return this.state.activeChannelSubscriptions.includes(subscriptionId);
    }
    return false;
  }

  isSubscribedContactSubscription (subscriptionId, scopes) {
    if (this.state.activeContactSubscriptions != null) {
        if (!scopes.length) {
            return this.state.activeContactSubscriptions.includes(subscriptionId);
        }

        if (this.state.activeContactSubscriptions[subscriptionId] != null) {
          var activeContactSubscriptionsScopes = this.state.activeContactSubscriptions[subscriptionId];
          if (scopes.every((item) => activeContactSubscriptionsScopes.includes(item))) {
            return true;
          } else {
            return false;
          }
        } else return false;
    }
    return false;
  }

  onPreferenceChannelItemToggled(subscriptionId, subscribe) {
    var editor = UrbanAirship.editChannelSubscriptionLists();
    var updatedArray = this.state.activeChannelSubscriptions;
    if (subscribe) {
      editor.subscribe(subscriptionId);
      updatedArray.concat(subscriptionId)
    } else {
      editor.unsubscribe(subscriptionId);
      updatedArray = updatedArray.filter((item) => item != subscriptionId);
    }
    editor.apply();
    this.setState({
        activeChannelSubscriptions: updatedArray
    });
    //setState(() {});
  }

  onPreferenceContactSubscriptionItemToggled(subscriptionId, scopes, subscribe) {
      var editor = UrbanAirship.editContactSubscriptionLists();
      if (subscribe) {
        editor.subscribe(subscriptionId, scopes);
      } else {
        editor.unsubscribe(subscriptionId, scopes);
      }
      editor.apply();
      applyContactSubscription(subscriptionId, scopes, subscribe);
      //setState(() {});
  }

//  applyContactSubscription(subscriptionId, scopes, subscribe) {
//    var currentScopes = this.state.activeContactSubscriptions[subscriptionId] ?? [];
//    var newScopes = [];
//    if (subscribe) {
//        newScopes = new List.from(currentScopes)..addAll(scopes);
//    } else {
//        currentScopes.removeWhere((item) => scopes.contains(item));
//        newScopes = currentScopes;
//    }
//    activeContactSubscriptions[subscriptionId] = newScopes;
//  }

render() {

  const AlertItem = ({ item }) => (
    <View style={{flexDirection: "row"}}>
        <View style={{
            borderColor: '#aaaaaa',
            borderWidth: 1,
            borderRadius: 3,
            flex: 0.25,
            backgroundColor: '#aaaaaa',
        }}>
            <Text>{item.display.name}</Text>
            <Text>{item.display.description}</Text>
        </View>
    </View>
  );

  const ChanneSubscriptionItem = ({ item }) => (
    <View style={{flexDirection: "row"}}>
        <View style={{ flex: 0.99 }}>
            <Text>{item.display.name}</Text>
            <Text>{item.display.description}</Text>
        </View>
        <Switch
            trackColor={{ true: "#0d6a83", false: null }}
            onValueChange={(value) => this.onPreferenceChannelItemToggled(item.subscription_id, value)}
            value={this.isSubscribedChannelSubscription(item.subscription_id)}
        />
    </View>
  );

  const renderItem = ({ item }) =>
   {
       if (item.type == 'channel_subscription') {
          return <ChanneSubscriptionItem item={item} />;
       } else if (item.type == 'contact_subscription_group') {
          return <ChanneSubscriptionItem item={item} />;
       } else if (item.type == 'contact_subscription') {
         return <ChanneSubscriptionItem item={item} />;
       } else if (item.type == 'alert') {
         return <ChanneSubscriptionItem item={item} />;
       } else {
         return <AlertItem item={item} />;
       }
   }

  const renderSectionHeader = ({ section }) => (
    <View>
        <Text>{section.title.name}</Text>
        <Text>{section.title.description}</Text>
    </View>
  );

  return (
    <SafeAreaView>
        <SectionList
            sections={this.state.preferenceCenterData}
            keyExtractor={(item, index) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
        />
    </SafeAreaView>
  );

}

};

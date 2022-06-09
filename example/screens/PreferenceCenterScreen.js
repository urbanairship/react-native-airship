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
  Button,
  AppRegistry,
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
        preferenceCenterDisplay: {},
        activeChannelSubscriptions: [],
        activeContactSubscriptions: {},
        sections: []
    }

    this.initAirshipListeners();
    this.fillInSubscriptionList();
    this.updatePreferenceCenterConfig();
  }

  initAirshipListeners () {
    UrbanAirship.addListener(EventType.OpenPreferenceCenter, (event) => {
        console.log(EventType.OpenPreferenceCenter + ':', event);
    });
  }

  fillInSubscriptionList() {
    UrbanAirship.getSubscriptionLists(["channel", "contact"]).then((subscriptionList) => {
        this.setState({
            activeChannelSubscriptions: subscriptionList.channelSubscriptionLists,
            activeContactSubscriptions: subscriptionList.ContactSubscriptionList
        });
    });
  }

  updatePreferenceCenterConfig() {
    AirshipPreferenceCenter.getConfiguration(this.state.preferenceCenterId).then((config) => {
        this.setState({ preferenceCenterDisplay: config.display })
        var sections = config.sections;
        if (sections) {
            this.setState({ sections: sections })
        }
    });
  }

  isSubscribedChannelSubscription(subscriptionId) {
    if (this.props.activeChannelSubscriptions != null) {
        return this.props.activeChannelSubscriptions.includes(subscriptionId);
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

render() {

  return (
    <View style={{ flex: 1 }}>
      <TableView
          reactModuleForCell="PreferenceCell"
          style={{ flex: 1 }}
          allowsToggle
          allowsMultipleSelection
        >

        {this.state.sections.map(section => (
            <Section label={section.display.name}>
                {section.items.map(item => (
                    <Item
                        key = {item.id}
                        name = {item.display.name}
                        description = {item.display.description}
                        subscriptionId = {item.subscription_id}
                    />
                ))}
            </Section>
        ))}

      </TableView>
    </View>
  );
}

};

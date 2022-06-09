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
  TouchableHighlight,
  StyleSheet,
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
        preferenceCenterId: "test_mouna",
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
        if (scopes.length === 0) {
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
  }

  onPreferenceContactSubscriptionItemToggled(subscriptionId, scopes, subscribe) {
      var editor = UrbanAirship.editContactSubscriptionLists();
      scopes.map((scope) => {
            if (subscribe) {
              editor.subscribe(subscriptionId, scope);
            } else {
              editor.unsubscribe(subscriptionId, scope);
            }
            editor.apply();
        }
      )
      this.applyContactSubscription(subscriptionId, scopes, subscribe);
  }

  applyContactSubscription(subscriptionId, scopes, subscribe) {
    var currentScopes = this.state.activeContactSubscriptions[subscriptionId] ?? [];
    var updatedArray = this.state.activeContactSubscriptions;
    if (subscribe) {
        currentScopes = currentScopes.concat(scopes);
    } else {
        currentScopes = currentScopes.filter((e) => !scopes.includes(e));
    }
    updatedArray[subscriptionId] = currentScopes;
    this.setState({
        activeContactSubscriptions: updatedArray
    });
  }

render() {

  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      paddingHorizontal: 10,
      borderRadius: 20
    },
    subscribedScopeButton: {
      alignItems: "center",
      backgroundColor: "#FF0000",
      padding: 10
    },
    unsubscribedScopeButton: {
        alignItems: "center",
        backgroundColor: "#FD959A",
        padding: 10
    },
    scopeContainer: {
      alignItems: "center",
      padding: 10
    },
    scopeText: {
      color:'white',
      fontSize:12,
      alignSelf: 'center'
    }
  });

  const Separator = () => (
    <View style={{flex: 1, height: 1, backgroundColor: 'gray'}} />
  );

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
    <View>
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
        <Separator/>
    </View>
  );

  const ContactSubscriptionItem = ({ item }) => (
    <View>
    <View style={{flexDirection: "row"}}>
        <View style={{ flex: 0.99 }}>
            <Text>{item.display.name}</Text>
            <Text>{item.display.description}</Text>
        </View>
        <Switch
            trackColor={{ true: "#0d6a83", false: null }}
            onValueChange={(value) => this.onPreferenceChannelItemToggled(item.subscription_id, [], value)}
            value={this.isSubscribedContactSubscription(item.subscription_id, [])}
        />
    </View>
    <Separator/>
    </View>
  );

  const ContactSubscriptionGroupItem = ({ item }) => (
      <View>
      <View>
        <Text>{item.display.name}</Text>
        <Text>{item.display.description}</Text>
        <View style={{ flex:1, flexDirection:'row', flexWrap: 'wrap', paddingTop: 10, paddingBottom: 10}}>
            {item.components.map(component => {
              return (
                <ScopeItem subscriptionId={item.subscription_id} component={component}/>
              );
            })}
        </View>
      </View>
      <Separator/>
      </View>
  );

  const ScopeItem = ({subscriptionId ,component }) => (
    <View style={styles.container}>
        <TouchableHighlight onPress={() => this.onPreferenceContactSubscriptionItemToggled(subscriptionId, component.scopes, !this.isSubscribedContactSubscription(subscriptionId, component.scopes))}>
            <View style={styles.scopeButton}>
                {this.isSubscribedContactSubscription(subscriptionId, component.scopes) ? <Text style={styles.subscribedScopeButton}>{component.display.name}</Text> :  <Text style={styles.unsubscribedScopeButton}>{component.display.name}</Text>}
            </View>
        </TouchableHighlight>
    </View>
  );

  const renderItem = ({ item }) =>
   {
       if (item.type == 'channel_subscription') {
          return <ChanneSubscriptionItem item={item} />;
       } else if (item.type == 'contact_subscription') {
          return <ContactSubscriptionItem item={item} />;
       } else if (item.type == 'contact_subscription_group') {
         return <ContactSubscriptionGroupItem item={item} />;
       } else if (item.type == 'alert') {
         return <AlertItem item={item} />;
       }
   }

  const renderSectionHeader = ({ section }) => (
    <View style={{backgroundColor: "#fff"}}>
        <Text style={{fontSize: 25}}>{section.title.name}</Text>
        <Text style={{fontSize: 15}}>{section.title.description}</Text>
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

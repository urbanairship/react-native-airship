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
  ActivityIndicator,
  Switch,
  SectionList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';

import {
  UrbanAirship
} from 'urbanairship-react-native'

import styles from './../Styles'

export default class PreferenceScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
        preferenceCenterId: 'neat',
        isFetching: true,
        activeChannelSubscriptions: [],
        activeContactSubscriptions: {},
        preferenceCenterData: []
    }

    this.fillInSubscriptionList();
    this.refreshPreferenceCenterConfig();
  }

  fillInSubscriptionList() {
    UrbanAirship.getSubscriptionLists(["channel", "contact"]).then((subscriptionList) => {
        this.setState({
            activeChannelSubscriptions: subscriptionList.channel,
            activeContactSubscriptions: subscriptionList.contact
        });
    });
  }

  refreshPreferenceCenterConfig() {
    UrbanAirship.getPreferenceCenterConfig(this.state.preferenceCenterId).then((config) => {
        console.log(config);
        var sections = config.sections;
        if (sections) {
           var data = []
           sections.map((section) => {
             data = data.concat({title: section.display, data: section.items});
           });
           this.setState({ preferenceCenterData: data })
           this.stopActivityIndicator()
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
      updatedArray = updatedArray.concat(subscriptionId)
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

    startActivityIndicator() {
      setTimeout(() => {
        this.setState({
          isFetching: true
        });
      }, 500);
    }

    stopActivityIndicator() {
      setTimeout(() => {
        this.setState({
          isFetching: false
        });
      }, 500);
    }

render() {

  const SampleItem = ({ item }) => (
    <View>
        <Text style={styles.cellTitle}>{item.display.name}</Text>
        <Text style={styles.cellSubtitle}>{item.display.description}</Text>
    </View>
  );

  const AlertItem = ({ item }) => (
    <View style={{flexDirection: "row"}}>
        <View style={styles.alertContainer}>
            <SampleItem item={item}/>
        </View>
    </View>
  );

  const ChanneSubscriptionItem = ({ item }) => (
    <View  style={styles.pcCellContainer}>
        <View style={{flexDirection: "row"}}>
            <View style={{ flex: 1 }}>
                <SampleItem item={item}/>
            </View>
            <Switch
                trackColor={{ true: "#0d6a83", false: null }}
                onValueChange={(value) => this.onPreferenceChannelItemToggled(item.subscription_id, value)}
                value={this.isSubscribedChannelSubscription(item.subscription_id)}
            />
        </View>
    </View>
  );

  const ContactSubscriptionItem = ({ item }) => (
    <View  style={styles.pcCellContainer}>
        <View style={{flexDirection: "row"}}>
            <View style={{ flex: 0.99 }}>
                <SampleItem item={item}/>
            </View>
            <Switch
                trackColor={{ true: "#0d6a83", false: null }}
                onValueChange={(value) => this.onPreferenceChannelItemToggled(item.subscription_id, [], value)}
                value={this.isSubscribedContactSubscription(item.subscription_id, [])}
            />
        </View>
    </View>
  );

  const ContactSubscriptionGroupItem = ({ item }) => (
    <View style={styles.pcCellContainer}>
        <View>
            <SampleItem item={item}/>
            <View style={{ flex:1, flexDirection:'row', flexWrap: 'wrap', paddingTop: 10, paddingBottom: 10}}>
            {item.components.map(component => {
              return (
                <ScopeItem subscriptionId={item.subscription_id} component={component} key={component.uniqueId}/>
              );
            })}
            </View>
       </View>
    </View>
  );

  const ScopeItem = ({subscriptionId ,component}) => (
    <View style={styles.scopeContainer}>
        <TouchableHighlight style={[this.isSubscribedContactSubscription(subscriptionId, component.scopes) ? styles.subscribedScopeButton : styles.unsubscribedScopeButton]} onPress={() => this.onPreferenceContactSubscriptionItemToggled(subscriptionId, component.scopes, !this.isSubscribedContactSubscription(subscriptionId, component.scopes))}>
            <View style={styles.scopeButton}>
                <Text>{component.display.name}</Text>
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
    <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>{section.title.name}</Text>
        <Text style={styles.sectionSubtitle}>{section.title.description}</Text>
    </View>
  );

  const onRefresh = () => {
      this.startActivityIndicator;
      this.refreshPreferenceCenterConfig();
      return
  };

  return (
    <View style={styles.pcContainer}>
        {
            (this.state.isFetching === true) ?
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator size="large"
                            animating={this.state.isFetching}
                    />
                </View> :
            <SectionList
                sections={this.state.preferenceCenterData}
                keyExtractor={(item, index) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                refreshControl={
                    <RefreshControl
                      refreshing={this.state.isFetching}
                      onRefresh={this.onRefresh}
                    />
                }
            />
        }
    </View>
  );
}

};

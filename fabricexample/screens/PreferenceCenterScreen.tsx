/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * PreferenceScreen: Contains the preference for a choosen identifier to be displayed.
 */
'use strict';

import React, {Component} from 'react';

import {
  Text,
  View,
  ActivityIndicator,
  Switch,
  SectionList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';

import {SubscriptionScope, UrbanAirship} from 'urbanairship-react-native';

import styles from './../Styles';

interface PreferenceCenterProps {}

interface PreferenceCenterData {
  title: unknown;
  data: any[];
}
export default class PreferenceScreen extends Component<
  PreferenceCenterProps,
  {
    preferenceCenterId: string;
    isFetching: boolean;
    activeChannelSubscriptions: string[] | undefined;
    activeContactSubscriptions: Record<string, SubscriptionScope[]> | undefined;
    preferenceCenterData: PreferenceCenterData[];
  }
> {
  constructor(props: PreferenceCenterProps) {
    super(props);
    this.state = {
      preferenceCenterId: 'neat',
      isFetching: true,
      activeChannelSubscriptions: [],
      activeContactSubscriptions: {},
      preferenceCenterData: [],
    };

    this.fillInSubscriptionList();
    this.refreshPreferenceCenterConfig();
  }

  fillInSubscriptionList() {
    UrbanAirship.getSubscriptionLists(['channel', 'contact']).then(
      subscriptionList => {
        this.setState({
          activeChannelSubscriptions: subscriptionList.channel,
          activeContactSubscriptions:
            subscriptionList.contact as unknown as Record<
              string,
              SubscriptionScope[]
            >,
        });
      },
    );
  }

  refreshPreferenceCenterConfig() {
    UrbanAirship.getPreferenceCenterConfig(this.state.preferenceCenterId).then(
      config => {
        console.log(config);
        var sections = config.sections;
        if (sections) {
          var data: PreferenceCenterData[] = [];
          sections.map(section => {
            data = data.concat({title: section.display, data: section.items});
          });
          this.setState({preferenceCenterData: data});
          this.stopActivityIndicator();
        }
      },
    );
  }

  isSubscribedChannelSubscription(subscriptionId: string) {
    if (this.state.activeChannelSubscriptions != null) {
      return this.state.activeChannelSubscriptions.includes(subscriptionId);
    }
    return false;
  }

  isSubscribedContactSubscription(
    subscriptionId: string,
    scopes: SubscriptionScope[],
  ) {
    if (this.state.activeContactSubscriptions != null) {
      if (scopes.length === 0) {
        return subscriptionId in this.state.activeContactSubscriptions;
      }

      if (this.state.activeContactSubscriptions[subscriptionId] != null) {
        var activeContactSubscriptionsScopes =
          this.state.activeContactSubscriptions[subscriptionId];
        if (
          scopes.every(item => activeContactSubscriptionsScopes.includes(item))
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return false;
  }

  onPreferenceChannelItemToggled(subscriptionId: string, subscribe: boolean) {
    var editor = UrbanAirship.editChannelSubscriptionLists();
    var updatedArray = this.state.activeChannelSubscriptions!;
    if (subscribe) {
      editor.subscribe(subscriptionId);
      updatedArray = updatedArray.concat(subscriptionId);
    } else {
      editor.unsubscribe(subscriptionId);
      updatedArray = updatedArray.filter(item => item != subscriptionId);
    }
    editor.apply();
    this.setState({
      activeChannelSubscriptions: updatedArray,
    });
  }

  onPreferenceContactSubscriptionItemToggled(
    subscriptionId: string,
    scopes: SubscriptionScope[],
    subscribe: boolean,
  ) {
    var editor = UrbanAirship.editContactSubscriptionLists();
    scopes.map(scope => {
      if (subscribe) {
        editor.subscribe(subscriptionId, scope);
      } else {
        editor.unsubscribe(subscriptionId, scope);
      }
      editor.apply();
    });
    this.applyContactSubscription(subscriptionId, scopes, subscribe);
  }

  applyContactSubscription(
    subscriptionId: string,
    scopes: SubscriptionScope[],
    subscribe: boolean,
  ) {
    var currentScopes =
      this.state.activeContactSubscriptions![subscriptionId] ?? [];
    var updatedArray = this.state.activeContactSubscriptions;
    if (subscribe) {
      currentScopes = currentScopes.concat(scopes);
    } else {
      currentScopes = currentScopes.filter(e => !scopes.includes(e));
    }
    updatedArray![subscriptionId] = currentScopes;
    this.setState({
      activeContactSubscriptions: updatedArray,
    });
  }

  startActivityIndicator() {
    setTimeout(() => {
      this.setState({
        isFetching: true,
      });
    }, 500);
  }

  stopActivityIndicator() {
    setTimeout(() => {
      this.setState({
        isFetching: false,
      });
    }, 500);
  }

  render() {
    interface ItemProp {
      item: {
        display: {
          name: string;
          description: string;
        };
        subscription_id: string;
        components: any;
        type: string;
        id: string;
      };
    }

    const SampleItem = ({item}: ItemProp) => (
      <View>
        <Text style={styles.cellTitle}>{item.display.name}</Text>
        <Text style={styles.cellSubtitle}>{item.display.description}</Text>
      </View>
    );

    const AlertItem = ({item}: ItemProp) => (
      <View style={{flexDirection: 'row'}}>
        <View style={styles.alertContainer}>
          <SampleItem item={item} />
        </View>
      </View>
    );

    const ChanneSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.pcCellContainer}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{true: '#0d6a83', false: null}}
            onValueChange={value =>
              this.onPreferenceChannelItemToggled(item.subscription_id, value)
            }
            value={this.isSubscribedChannelSubscription(item.subscription_id)}
          />
        </View>
      </View>
    );

    const ContactSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.pcCellContainer}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 0.99}}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{true: '#0d6a83', false: null}}
            onValueChange={value =>
              this.onPreferenceChannelItemToggled(item.subscription_id, value)
            }
            value={this.isSubscribedContactSubscription(
              item.subscription_id,
              [],
            )}
          />
        </View>
      </View>
    );

    const ContactSubscriptionGroupItem = ({item}: ItemProp) => (
      <View style={styles.pcCellContainer}>
        <View>
          <SampleItem item={item} />
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              paddingTop: 10,
              paddingBottom: 10,
            }}>
            {item.components.map((component: any) => {
              return (
                <ScopeItem
                  subscriptionId={item.subscription_id}
                  component={component}
                  key={component.uniqueId}
                />
              );
            })}
          </View>
        </View>
      </View>
    );

    const ScopeItem = ({
      subscriptionId,
      component,
    }: {
      subscriptionId: string;
      component: any;
    }) => (
      <View style={styles.scopeContainer}>
        <TouchableHighlight
          style={[
            this.isSubscribedContactSubscription(
              subscriptionId,
              component.scopes,
            )
              ? styles.subscribedScopeButton
              : styles.unsubscribedScopeButton,
          ]}
          onPress={() =>
            this.onPreferenceContactSubscriptionItemToggled(
              subscriptionId,
              component.scopes,
              !this.isSubscribedContactSubscription(
                subscriptionId,
                component.scopes,
              ),
            )
          }>
          <View style={styles.scopeContainer}>
            <Text>{component.display.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );

    const renderItem = ({item}: ItemProp) => {
      if (item.type == 'channel_subscription') {
        return <ChanneSubscriptionItem item={item} />;
      } else if (item.type == 'contact_subscription') {
        return <ContactSubscriptionItem item={item} />;
      } else if (item.type == 'contact_subscription_group') {
        return <ContactSubscriptionGroupItem item={item} />;
      } else if (item.type == 'alert') {
        return <AlertItem item={item} />;
      } else {
        return null;
      }
    };

    const renderSectionHeader = ({section}: {section: any}) => (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>{section.title.name}</Text>
        <Text style={styles.sectionSubtitle}>{section.title.description}</Text>
      </View>
    );

    const onRefresh = () => {
      this.startActivityIndicator;
      this.refreshPreferenceCenterConfig();
      return;
    };

    return (
      <View style={styles.pcContainer}>
        {this.state.isFetching === true ? (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="large" animating={this.state.isFetching} />
          </View>
        ) : (
          <SectionList
            sections={this.state.preferenceCenterData}
            keyExtractor={(item, _index) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isFetching}
                onRefresh={onRefresh}
              />
            }
          />
        )}
      </View>
    );
  }
}

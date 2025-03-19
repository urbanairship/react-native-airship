/* Copyright Airship and Contributors */

'use strict';

import React, { Component } from 'react';

import {
  Text,
  View,
  ActivityIndicator,
  Switch,
  SectionList,
  TouchableHighlight,
  RefreshControl,
} from 'react-native';
import Airship, { SubscriptionScope } from '@ua/react-native-airship';

import styles from '../Styles';

interface PreferenceCenterProps {
  navigation?: any;
}

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
      preferenceCenterId: 'example_center',
      isFetching: true,
      activeChannelSubscriptions: [],
      activeContactSubscriptions: {},
      preferenceCenterData: [],
    };

    this.fillInSubscriptionList();
    this.refreshPreferenceCenterConfig();
  }

  fillInSubscriptionList() {
    Promise.all([
      Airship.contact.getSubscriptionLists(),
      Airship.channel.getSubscriptionLists(),
    ]).then((results) => {
      this.setState({
        activeContactSubscriptions: results[0],
        activeChannelSubscriptions: results[1],
      });
    }).catch(() => {
      // Expected error when subscription lists are not available
    });
  }

  refreshPreferenceCenterConfig() {
    Airship.preferenceCenter
      .getConfig(this.state.preferenceCenterId)
      .then((config) => {
        var sections = config?.sections;
        if (sections && sections.length > 0) {
          var data: PreferenceCenterData[] = [];
          sections.map((section) => {
            data = data.concat({ title: section.display, data: section.items });
          });
          this.setState({ preferenceCenterData: data });
          this.stopActivityIndicator();
        } else {
          this.stopActivityIndicator();
        }
      })
      .catch(() => {
        // Expected error when preference center is not available
        this.stopActivityIndicator();
      });
  }

  isSubscribedChannelSubscription(subscriptionId: string) {
    if (this.state.activeChannelSubscriptions != null) {
      return this.state.activeChannelSubscriptions.includes(subscriptionId);
    }
    return false;
  }

  isSubscribedContactSubscription(
    subscriptionId: string,
    scopes: SubscriptionScope[]
  ) {
    if (this.state.activeContactSubscriptions != null) {
      if (scopes.length === 0) {
        return subscriptionId in this.state.activeContactSubscriptions;
      }

      if (this.state.activeContactSubscriptions[subscriptionId] != null) {
        var activeContactSubscriptionsScopes =
          this.state.activeContactSubscriptions[subscriptionId];
        if (
          scopes.every((item) =>
            activeContactSubscriptionsScopes?.includes(item)
          )
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
    var editor = Airship.channel.editSubscriptionLists();
    var updatedArray = this.state.activeChannelSubscriptions!;
    if (subscribe) {
      editor.subscribe(subscriptionId);
      updatedArray = updatedArray.concat(subscriptionId);
    } else {
      editor.unsubscribe(subscriptionId);
      updatedArray = updatedArray.filter((item) => item != subscriptionId);
    }
    editor.apply();
    this.setState({
      activeChannelSubscriptions: updatedArray,
    });
  }

  onPreferenceContactSubscriptionItemToggled(
    subscriptionId: string,
    scopes: SubscriptionScope[],
    subscribe: boolean
  ) {
    var editor = Airship.contact.editSubscriptionLists();
    scopes.map((scope) => {
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
    subscribe: boolean
  ) {
    var currentScopes =
      this.state.activeContactSubscriptions![subscriptionId] ?? [];
    var updatedArray = this.state.activeContactSubscriptions;
    if (subscribe) {
      currentScopes = currentScopes.concat(scopes);
    } else {
      currentScopes = currentScopes.filter((e) => !scopes.includes(e));
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

    // eslint-disable-next-line react/no-unstable-nested-components
    const SampleItem = ({ item }: ItemProp) => (
      <View>
        <Text style={styles.cellTitle}>{item.display.name}</Text>
        <Text style={styles.cellSubtitle}>{item.display.description}</Text>
      </View>
    );

    // eslint-disable-next-line react/no-unstable-nested-components
    const AlertItem = ({ item }: ItemProp) => (
      <View style={{ flexDirection: 'row' }}>
        <View style={styles.alertContainer}>
          <SampleItem item={item} />
        </View>
      </View>
    );

    // eslint-disable-next-line react/no-unstable-nested-components
    const ChanneSubscriptionItem = ({ item }: ItemProp) => (
      <View style={styles.pcCellContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{ true: '#6ca15f', false: null }}
            onValueChange={(value) =>
              this.onPreferenceChannelItemToggled(item.subscription_id, value)
            }
            value={this.isSubscribedChannelSubscription(item.subscription_id)}
          />
        </View>
      </View>
    );

    // eslint-disable-next-line react/no-unstable-nested-components
    const ContactSubscriptionItem = ({ item }: ItemProp) => (
      <View style={styles.pcCellContainer}>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 0.99 }}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{ true: '#6ca15f', false: null }}
            onValueChange={(value) =>
              this.onPreferenceContactSubscriptionItemToggled(item.subscription_id, [], value)
            }
            value={this.isSubscribedContactSubscription(
              item.subscription_id,
              []
            )}
          />
        </View>
      </View>
    );

    // eslint-disable-next-line react/no-unstable-nested-components
    const ContactSubscriptionGroupItem = ({ item }: ItemProp) => (
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
            }}
          >
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

    // eslint-disable-next-line react/no-unstable-nested-components
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
              component.scopes
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
                component.scopes
              )
            )
          }
        >
          <View style={styles.scopeContainer}>
            <Text>{component.display.name}</Text>
          </View>
        </TouchableHighlight>
      </View>
    );

    const renderItem = ({ item }: ItemProp) => {
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

    const renderSectionHeader = ({ section }: { section: any }) => (
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>{section.title.name}</Text>
        <Text style={styles.sectionSubtitle}>{section.title.description}</Text>
      </View>
    );

    const onRefresh = () => {
      this.startActivityIndicator();
      this.fillInSubscriptionList();
      this.refreshPreferenceCenterConfig();
      return;
    };

    return (
      <View style={styles.pcContainer}>
        {this.state.isFetching === true ? (
          <View style={[styles.centerContainer, {padding: 16}]}>
            <ActivityIndicator size="large" color="#004bff" animating={this.state.isFetching} />
          </View>
        ) : this.state.preferenceCenterData.length > 0 ? (
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
        ) : (
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>Preference Center Unavailable</Text>
            <Text style={styles.warningText}>
              No preference center found. Try refreshing or check your configuration.
            </Text>
          </View>
        )}
      </View>
    );
  }
}
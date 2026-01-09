/* Copyright Airship and Contributors */

import {Component} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Switch,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import Airship, {SubscriptionScope} from '@ua/react-native-airship';
import { Colors } from '../Styles';

interface PreferenceCenterProps {
  route?: {
    params?: {
      goBack?: () => void;
    };
  };
}

interface PreferenceCenterData {
  title: any;
  data: any[];
}

interface PreferenceCenterState {
  preferenceCenterId: string;
  isFetching: boolean;
  activeChannelSubscriptions: string[] | undefined;
  activeContactSubscriptions: Record<string, SubscriptionScope[]> | undefined;
  preferenceCenterData: PreferenceCenterData[];
}

export default class PreferenceCenterScreen extends Component<
  PreferenceCenterProps,
  PreferenceCenterState
> {
  constructor(props: PreferenceCenterProps) {
    super(props);
    console.log('🚀 [PreferenceCenter] Constructor called!');
    this.state = {
      preferenceCenterId: 'app_default',
      isFetching: true,
      activeChannelSubscriptions: [],
      activeContactSubscriptions: {},
      preferenceCenterData: [],
    };

    this.fillInSubscriptionList();
    this.refreshPreferenceCenterConfig();
  }

  async fillInSubscriptionList() {
    console.log('[PreferenceCenter] Fetching subscription lists...');

    // Check if contact is identified
    try {
      const namedUserId = await Airship.contact.getNamedUserId();
      console.log('[PreferenceCenter] Named User ID:', namedUserId ?? 'NOT SET - THIS IS THE PROBLEM!');
    } catch (e) {
      console.error('[PreferenceCenter] Error getting named user:', e);
    }

    Promise.all([
      Airship.contact.getSubscriptionLists(),
      Airship.channel.getSubscriptionLists(),
    ])
      .then(results => {
        console.log('[PreferenceCenter] Contact subscriptions:', JSON.stringify(results[0], null, 2));
        console.log('[PreferenceCenter] Channel subscriptions:', JSON.stringify(results[1], null, 2));
        this.setState({
          activeContactSubscriptions: results[0],
          activeChannelSubscriptions: results[1],
        });
      })
      .catch((error) => {
        console.error('[PreferenceCenter] Error fetching subscriptions:', error);
      });
  }

  refreshPreferenceCenterConfig() {
    console.log('[PreferenceCenter] Fetching config for:', this.state.preferenceCenterId);
    Airship.preferenceCenter
      .getConfig(this.state.preferenceCenterId)
      .then(config => {
        console.log('[PreferenceCenter] Config received:', JSON.stringify(config, null, 2));
        var sections = config?.sections;
        if (sections && sections.length > 0) {
          var data: PreferenceCenterData[] = [];
          sections.map(section => {
            data = data.concat({title: section.display, data: section.items});
          });
          this.setState({preferenceCenterData: data});
          this.stopActivityIndicator();
        } else {
          console.warn('[PreferenceCenter] No sections found in config');
          this.stopActivityIndicator();
        }
      })
      .catch((error) => {
        console.error('[PreferenceCenter] Error fetching config:', error);
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
          scopes.every(item => activeContactSubscriptionsScopes?.includes(item))
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
    console.log('[PreferenceCenter] Channel toggle:', subscriptionId, 'subscribe:', subscribe);
    var editor = Airship.channel.editSubscriptionLists();
    var updatedArray = this.state.activeChannelSubscriptions!;
    if (subscribe) {
      editor.subscribe(subscriptionId);
      updatedArray = updatedArray.concat(subscriptionId);
    } else {
      editor.unsubscribe(subscriptionId);
      updatedArray = updatedArray.filter(item => item !== subscriptionId);
    }
    editor.apply();
    console.log('[PreferenceCenter] Channel subscriptions updated:', updatedArray);
    this.setState({
      activeChannelSubscriptions: updatedArray,
    });
  }

  onPreferenceContactSubscriptionItemToggled(
    subscriptionId: string,
    scopes: SubscriptionScope[],
    subscribe: boolean,
  ) {
    console.log('[PreferenceCenter] Contact toggle:', subscriptionId, 'scopes:', scopes, 'subscribe:', subscribe);
    var editor = Airship.contact.editSubscriptionLists();
    scopes.forEach(scope => {
      console.log('[PreferenceCenter] Processing scope:', scope);
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
    console.log('[PreferenceCenter] applyContactSubscription:', subscriptionId, 'scopes:', scopes, 'subscribe:', subscribe);
    var currentScopes =
      this.state.activeContactSubscriptions![subscriptionId] ?? [];
    console.log('[PreferenceCenter] Current scopes for', subscriptionId, ':', currentScopes);
    var updatedArray = this.state.activeContactSubscriptions;
    if (subscribe) {
      currentScopes = currentScopes.concat(scopes);
    } else {
      currentScopes = currentScopes.filter(e => !scopes.includes(e));
    }
    console.log('[PreferenceCenter] Updated scopes for', subscriptionId, ':', currentScopes);
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
    const goBack = this.props.route?.params?.goBack;
    const isCosmoApp = true;
    const styles = getStyles(isCosmoApp);

    interface ItemProp {
      item: {
        display: {
          name: string;
          description: string;
        };
        subscription_id: string;
        scopes: SubscriptionScope[];
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

    const ChannelSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.cellContainer}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1}}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{
              true: isCosmoApp ? Colors.cosmoBlack : Colors.peach,
              false: Colors.gray300,
            }}
            thumbColor={Colors.white}
            onValueChange={value =>
              this.onPreferenceChannelItemToggled(item.subscription_id, value)
            }
            value={this.isSubscribedChannelSubscription(item.subscription_id)}
          />
        </View>
      </View>
    );

    const ContactSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.cellContainer}>
        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 0.99}}>
            <SampleItem item={item} />
          </View>
          <Switch
            trackColor={{
              true: isCosmoApp ? Colors.cosmoBlack : Colors.peach,
              false: Colors.gray300,
            }}
            thumbColor={Colors.white}
            onValueChange={value =>
              this.onPreferenceContactSubscriptionItemToggled(
                item.subscription_id,
                item.scopes,
                value,
              )
            }
            value={this.isSubscribedContactSubscription(
              item.subscription_id,
              item.scopes,
            )}
          />
        </View>
      </View>
    );

    const ContactSubscriptionGroupItem = ({item}: ItemProp) => (
      <View style={styles.cellContainer}>
        <View>
          <SampleItem item={item} />
          <View style={styles.scopesRow}>
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
            this.isSubscribedContactSubscription(subscriptionId, component.scopes)
              ? styles.subscribedScopeButton
              : styles.unsubscribedScopeButton,
          ]}
          underlayColor={isCosmoApp ? Colors.gray200 : Colors.cream}
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
            <Text
              style={[
                styles.scopeText,
                this.isSubscribedContactSubscription(subscriptionId, component.scopes) &&
                  styles.subscribedScopeText,
              ]}>
              {component.display.name}
            </Text>
          </View>
        </TouchableHighlight>
      </View>
    );

    const renderItem = ({item}: ItemProp) => {
      if (item.type === 'channel_subscription') {
        return <ChannelSubscriptionItem item={item} />;
      } else if (item.type === 'contact_subscription') {
        return <ContactSubscriptionItem item={item} />;
      } else if (item.type === 'contact_subscription_group') {
        return <ContactSubscriptionGroupItem item={item} />;
      } else if (item.type === 'alert') {
        return <AlertItem item={item} />;
      } else {
        return null;
      }
    };

    const renderSectionHeader = ({ section }: { section: any }) => {
      /*
      const { title } = section;
      if (!title.name && !title.description) {
        return <View style={styles.sectionSpacer} />;
      }
      return (
        <View style={styles.sectionHeaderContainer}>
          {title.name ? <Text style={styles.sectionTitle}>{title.name}</Text> : null}
          {title.description ? (
            <Text style={styles.sectionSubtitle}>{title.description}</Text>
          ) : null}
        </View>
      );*/
      return <View style={styles.sectionSpacer} />;
    };

    const onRefresh = () => {
      this.startActivityIndicator();
      this.fillInSubscriptionList();
      this.refreshPreferenceCenterConfig();
      return;
    };

    return (
      <View style={styles.container}>
        {this.state.isFetching === true ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator
              size="large"
              color={isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack}
              animating={this.state.isFetching}
            />
          </View>
        ) : this.state.preferenceCenterData.length > 0 ? (
          <SectionList
            sections={this.state.preferenceCenterData}
            keyExtractor={(item, _index) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isFetching}
                onRefresh={onRefresh}
              />
            }
          />
        ) : (
          <View style={styles.warningContainer}>
            <Text style={styles.warningTitle}>
              Preference Center Unavailable
            </Text>
            <Text style={styles.warningText}>
              No preference center found. Try refreshing or check your
              configuration.
            </Text>
          </View>
        )}
      </View>
    );
  }
}

const getStyles = (isCosmoApp: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.gray100,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 32,
    },
    cellContainer: {
      backgroundColor: Colors.white,
      padding: 16,
      borderRadius: isCosmoApp ? 4 : 8,
      marginBottom: 8,
    },
    cellTitle: {
      fontSize: 16,
      fontFamily: isCosmoApp ? 'Jost-SemiBold' : 'FoundersGrotesk-Medium',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
      marginBottom: 4,
    },
    cellSubtitle: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: Colors.gray600,
    },
    sectionHeaderContainer: {
      paddingVertical: 12,
      paddingHorizontal: 4,
    },
    sectionTitle: {
      fontSize: 20,
      fontFamily: isCosmoApp ? 'Jost-SemiBold' : 'FoundersGrotesk-Semibold',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
      marginBottom: 4,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: Colors.gray600,
    },
    alertContainer: {
      backgroundColor: Colors.alertInfoBg,
      padding: 16,
      borderRadius: isCosmoApp ? 4 : 8,
      marginBottom: 8,
      flex: 1,
    },
    scopesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingTop: 10,
      paddingBottom: 10,
    },
    scopeContainer: {
      marginRight: 4,
      marginBottom: 4,
    },
    subscribedScopeButton: {
      backgroundColor: isCosmoApp ? Colors.cosmoBlack : Colors.peach,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    unsubscribedScopeButton: {
      backgroundColor: Colors.white,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: Colors.gray300,
    },
    scopeText: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Medium' : 'FoundersGrotesk-Medium',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
    },
    subscribedScopeText: {
      color: isCosmoApp ? Colors.white : Colors.sallyBlack,
    },
    warningContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    warningTitle: {
      fontSize: 18,
      fontFamily: isCosmoApp ? 'Jost-SemiBold' : 'FoundersGrotesk-Semibold',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
      marginBottom: 8,
      textAlign: 'center',
    },
    warningText: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: Colors.gray600,
      textAlign: 'center',
    },
  });
/* Copyright Airship and Contributors */

import  {Component} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Switch,
  Text,
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
  navigation?: any;
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
  private focusListener: any;

  constructor(props: PreferenceCenterProps) {
    super(props);
    console.log('[PreferenceCenter] Constructor called!');
    this.state = {
      preferenceCenterId: 'my_preference_center',
      isFetching: true,
      activeChannelSubscriptions: [],
      activeContactSubscriptions: {},
      preferenceCenterData: [],
    };
  }

  componentDidMount() {
    console.log('[PreferenceCenter] componentDidMount called');
    this.onRefresh();

    this.focusListener = this.props.navigation?.addListener?.('focus', () => {
      console.log('[PreferenceCenter] Screen focused - refreshing data');
      this.onRefresh();
    });
  }

  componentWillUnmount() {
    this.focusListener?.remove?.();
  }

  async fillInSubscriptionList() {
    console.log('[PreferenceCenter] Fetching subscription lists...');

    try {
      const namedUserId = await Airship.contact.getNamedUserId();
      console.log('[PreferenceCenter] Named User ID:', namedUserId ?? 'NOT SET');
    } catch (e) {
      console.error('[PreferenceCenter] Error getting named user:', e);
    }

    try {
      const [contactSubs, channelSubs] = await Promise.all([
        Airship.contact.getSubscriptionLists(),
        Airship.channel.getSubscriptionLists(),
      ]);
      console.log('[PreferenceCenter] Contact subscriptions:', JSON.stringify(contactSubs, null, 2));
      console.log('[PreferenceCenter] Channel subscriptions:', JSON.stringify(channelSubs, null, 2));
      this.setState({
        activeContactSubscriptions: contactSubs,
        activeChannelSubscriptions: channelSubs,
      });
    } catch (error) {
      console.error('[PreferenceCenter] Error fetching subscriptions:', error);
    }
  }

  async refreshPreferenceCenterConfig() {
    console.log('[PreferenceCenter] Fetching config for:', this.state.preferenceCenterId);
    try {
      const config = await Airship.preferenceCenter.getConfig(this.state.preferenceCenterId);
      console.log('[PreferenceCenter] Config received:', JSON.stringify(config, null, 2));
      const sections = config?.sections;
      if (sections && sections.length > 0) {
        const data: PreferenceCenterData[] = [];
        sections.forEach(section => {
          data.push({title: section.display, data: section.items});
        });
        this.setState({preferenceCenterData: data});
      } else {
        console.warn('[PreferenceCenter] No sections found in config');
      }
    } catch (error) {
      console.error('[PreferenceCenter] Error fetching config:', error);
    }
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

  async onPreferenceChannelItemToggled(subscriptionId: string, subscribe: boolean) {
    console.log('[PreferenceCenter] Channel toggle:', subscriptionId, 'subscribe:', subscribe);
    this.startActivityIndicator();
    var editor = Airship.channel.editSubscriptionLists();
    var updatedArray = this.state.activeChannelSubscriptions!;
    if (subscribe) {
      editor.subscribe(subscriptionId);
      updatedArray = updatedArray.concat(subscriptionId);
    } else {
      editor.unsubscribe(subscriptionId);
      updatedArray = updatedArray.filter(item => item !== subscriptionId);
    }
    await editor.apply();
    console.log('[PreferenceCenter] Channel subscriptions updated:', updatedArray);
    this.setState({
      activeChannelSubscriptions: updatedArray,
    });
    this.stopActivityIndicator();
  }

  async onPreferenceContactSubscriptionItemToggled(
    subscriptionId: string,
    scopes: SubscriptionScope[],
    subscribe: boolean,
  ) {
    console.log('[PreferenceCenter] Contact toggle:', subscriptionId, 'scopes:', scopes, 'subscribe:', subscribe);
    this.startActivityIndicator();
    try {
      var editor = Airship.contact.editSubscriptionLists();
      scopes.forEach(scope => {
        console.log('[PreferenceCenter] Processing scope:', scope);
        if (subscribe) {
          editor.subscribe(subscriptionId, scope);
        } else {
          editor.unsubscribe(subscriptionId, scope);
        }
      });
      await editor.apply();
      console.log('[PreferenceCenter] Contact subscription apply() SUCCESS for:', subscriptionId);

      // Verify by re-fetching from Airship
      const verifySubscriptions = await Airship.contact.getSubscriptionLists();
      console.log('[PreferenceCenter] Verified subscriptions after apply:', JSON.stringify(verifySubscriptions, null, 2));

      this.applyContactSubscription(subscriptionId, scopes, subscribe);
    } catch (error) {
      console.error('[PreferenceCenter] Contact subscription apply() FAILED:', error);
    } finally {
      this.stopActivityIndicator();
    }
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

  onRefresh = async () => {
    this.startActivityIndicator();
    try {
      await this.fillInSubscriptionList();
      await this.refreshPreferenceCenterConfig();
    } catch (error) {
      console.error('[PreferenceCenter] Error during refresh:', error);
    } finally {
      this.stopActivityIndicator();
    }
  };

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

    const ChannelSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.cellContainer}>
        <Text style={styles.cellTitle}>{item.display.name}</Text>
        <AppSwitch
          onValueChange={value =>
            this.onPreferenceChannelItemToggled(item.subscription_id, value)
          }
          value={this.isSubscribedChannelSubscription(item.subscription_id)}
        />
      </View>
    );

    const ContactSubscriptionItem = ({item}: ItemProp) => (
      <View style={styles.cellContainer}>
        <Text style={styles.cellTitle}>{item.display.name}</Text>
        <AppSwitch
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
    );

    const ContactSubscriptionGroupItem = ({item}: ItemProp) => (
      <View style={styles.groupContainer}>
        <Text style={styles.groupTitle}>{item.display.name}</Text>
        {item.components.map((component: any) => (
          <View style={styles.cellContainer} key={component.uniqueId}>
            <Text style={styles.cellTitle}>{component.display.name}</Text>
            <Switch
              onValueChange={(value: boolean) =>
                this.onPreferenceContactSubscriptionItemToggled(
                  item.subscription_id,
                  component.scopes,
                  value,
                )
              }
              value={this.isSubscribedContactSubscription(
                item.subscription_id,
                component.scopes,
              )}
            />
          </View>
        ))}
      </View>
    );

    const AlertItem = ({item}: ItemProp) => (
      <View style={styles.alertContainer}>
        <Text style={styles.alertText}>{item.display.name}</Text>
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

    const ListHeaderComponent = () => (
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}> My Interests </Text>
        <Text style={styles.pageSubtitle}>
          My Interests
        </Text>
      </View>
    );

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
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isFetching}
                onRefresh={this.onRefresh}
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
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    pageHeader: {
      paddingTop: 24,
      paddingBottom: 16,
    },
    pageTitle: {
      fontSize: 24,
      fontFamily: isCosmoApp ? 'Jost-SemiBold' : 'FoundersGrotesk-Semibold',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
      marginBottom: 8,
    },
    pageSubtitle: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: Colors.gray600,
      lineHeight: 20,
    },
    sectionHeaderContainer: {
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: isCosmoApp ? 'Jost-SemiBold' : 'FoundersGrotesk-Semibold',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
    },
    cellContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: Colors.white,
      paddingVertical: 16,
      paddingHorizontal: 16,
      marginBottom: 8,
      borderRadius: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    cellTitle: {
      fontSize: 16,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
      flex: 1,
    },
    groupContainer: {
      marginTop: 8,
    },
    groupTitle: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Medium' : 'FoundersGrotesk-Medium',
      color: Colors.gray600,
      marginBottom: 8,
    },
    alertContainer: {
      backgroundColor: Colors.alertInfoBg,
      padding: 16,
      borderRadius: 4,
      marginVertical: 8,
    },
    alertText: {
      fontSize: 14,
      fontFamily: isCosmoApp ? 'Jost-Regular' : 'FoundersGrotesk-Regular',
      color: isCosmoApp ? Colors.cosmoBlack : Colors.sallyBlack,
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
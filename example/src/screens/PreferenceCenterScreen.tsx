/* Copyright Airship and Contributors */

'use strict';

import { useState, useEffect, useCallback } from 'react';

import {
  Text,
  View,
  ActivityIndicator,
  Switch,
  SectionList,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from 'react-native';
import Airship, { SubscriptionScope } from '@ua/react-native-airship';

import styles, { Colors } from '../Styles';

interface PreferenceCenterProps {
  navigation?: any;
}

interface SectionDisplay {
  name?: string;
  description?: string;
}

interface PreferenceCenterSection {
  title: SectionDisplay;
  data: any[];
}

interface ItemProps {
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

export default function PreferenceCenterScreen(_props: PreferenceCenterProps) {
  const [preferenceCenterId] = useState('app_default');
  const [isFetching, setIsFetching] = useState(true);
  const [activeChannelSubscriptions, setActiveChannelSubscriptions] = useState<string[]>([]);
  const [activeContactSubscriptions, setActiveContactSubscriptions] = useState<Record<string, SubscriptionScope[]>>({});
  const [preferenceCenterData, setPreferenceCenterData] = useState<PreferenceCenterSection[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));

  const fillInSubscriptionList = useCallback(async () => {
    try {
      const [contactSubs, channelSubs] = await Promise.all([
        Airship.contact.getSubscriptionLists(),
        Airship.channel.getSubscriptionLists(),
      ]);
      setActiveContactSubscriptions(contactSubs || {});
      setActiveChannelSubscriptions(channelSubs || []);
    } catch {
      // Expected error when subscription lists are not available
    }
  }, []);

  const refreshPreferenceCenterConfig = useCallback(async () => {
    try {
      const config = await Airship.preferenceCenter.getConfig(preferenceCenterId);
      const sections = config?.sections;
      if (sections && sections.length > 0) {
        const data: PreferenceCenterSection[] = sections.map((section) => ({
          title: section.display || {},
          data: section.items,
        }));
        setPreferenceCenterData(data);
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      // Expected error when preference center is not available
    } finally {
      setIsFetching(false);
    }
  }, [preferenceCenterId, fadeAnim]);

  useEffect(() => {
    fillInSubscriptionList();
    refreshPreferenceCenterConfig();
  }, [fillInSubscriptionList, refreshPreferenceCenterConfig]);

  const isSubscribedChannelSubscription = useCallback(
    (subscriptionId: string) => {
      return activeChannelSubscriptions.includes(subscriptionId);
    },
    [activeChannelSubscriptions]
  );

  const isSubscribedContactSubscription = useCallback(
    (subscriptionId: string, scopes: SubscriptionScope[]) => {
      if (scopes.length === 0) {
        return subscriptionId in activeContactSubscriptions;
      }

      const activeScopes = activeContactSubscriptions[subscriptionId];
      if (activeScopes) {
        return scopes.every((item) => activeScopes.includes(item));
      }
      return false;
    },
    [activeContactSubscriptions]
  );

  const onPreferenceChannelItemToggled = useCallback(
    (subscriptionId: string, subscribe: boolean) => {
      const editor = Airship.channel.editSubscriptionLists();
      if (subscribe) {
        editor.subscribe(subscriptionId);
        setActiveChannelSubscriptions((prev) => [...prev, subscriptionId]);
      } else {
        editor.unsubscribe(subscriptionId);
        setActiveChannelSubscriptions((prev) =>
          prev.filter((item) => item !== subscriptionId)
        );
      }
      editor.apply();
    },
    []
  );

  const onPreferenceContactSubscriptionItemToggled = useCallback(
    (subscriptionId: string, scopes: SubscriptionScope[], subscribe: boolean) => {
      const editor = Airship.contact.editSubscriptionLists();
      scopes.forEach((scope) => {
        if (subscribe) {
          editor.subscribe(subscriptionId, scope);
        } else {
          editor.unsubscribe(subscriptionId, scope);
        }
      });
      editor.apply();

      // Update local state
      setActiveContactSubscriptions((prev) => {
        const currentScopes = prev[subscriptionId] ?? [];
        let updatedScopes: SubscriptionScope[];
        if (subscribe) {
          updatedScopes = [...new Set([...currentScopes, ...scopes])];
        } else {
          updatedScopes = currentScopes.filter((e) => !scopes.includes(e));
        }
        return { ...prev, [subscriptionId]: updatedScopes };
      });
    },
    []
  );

  const onRefresh = useCallback(() => {
    setIsFetching(true);
    fillInSubscriptionList();
    refreshPreferenceCenterConfig();
  }, [fillInSubscriptionList, refreshPreferenceCenterConfig]);

  // Item display component
  const ItemDisplay = ({ item }: ItemProps) => (
    <View style={styles.pcItemTextContainer}>
      <Text style={styles.pcItemTitle}>{item.display.name}</Text>
      {item.display.description ? (
        <Text style={styles.pcItemDescription}>{item.display.description}</Text>
      ) : null}
    </View>
  );

  // Alert item component
  const AlertItem = ({ item }: ItemProps) => (
    <View style={styles.pcAlertCard}>
      <View style={styles.pcAlertIconContainer}>
        <Text style={styles.pcAlertIcon}>ℹ️</Text>
      </View>
      <View style={styles.pcAlertContent}>
        <Text style={styles.pcAlertTitle}>{item.display.name}</Text>
        {item.display.description ? (
          <Text style={styles.pcAlertDescription}>{item.display.description}</Text>
        ) : null}
      </View>
    </View>
  );

  // Channel subscription item component
  const ChannelSubscriptionItem = ({ item }: ItemProps) => {
    const isSubscribed = isSubscribedChannelSubscription(item.subscription_id);
    return (
      <View style={styles.pcSubscriptionCard}>
        <View style={styles.pcSubscriptionContent}>
          <ItemDisplay item={item} />
          <View style={styles.pcSwitchContainer}>
            <Text style={[styles.pcSwitchLabel, isSubscribed && styles.pcSwitchLabelActive]}>
              {isSubscribed ? 'On' : 'Off'}
            </Text>
            <Switch
              trackColor={{
                true: Colors.switchTrackActive,
                false: Colors.switchTrackInactive,
              }}
              thumbColor={Colors.cardBackground}
              ios_backgroundColor={Colors.switchTrackInactive}
              onValueChange={(value) =>
                onPreferenceChannelItemToggled(item.subscription_id, value)
              }
              value={isSubscribed}
            />
          </View>
        </View>
      </View>
    );
  };

  // Contact subscription item component
  const ContactSubscriptionItem = ({ item }: ItemProps) => {
    const isSubscribed = isSubscribedContactSubscription(item.subscription_id, []);
    return (
      <View style={styles.pcSubscriptionCard}>
        <View style={styles.pcSubscriptionContent}>
          <ItemDisplay item={item} />
          <View style={styles.pcSwitchContainer}>
            <Text style={[styles.pcSwitchLabel, isSubscribed && styles.pcSwitchLabelActive]}>
              {isSubscribed ? 'On' : 'Off'}
            </Text>
            <Switch
              trackColor={{
                true: Colors.switchTrackActive,
                false: Colors.switchTrackInactive,
              }}
              thumbColor={Colors.cardBackground}
              ios_backgroundColor={Colors.switchTrackInactive}
              onValueChange={(value) =>
                onPreferenceContactSubscriptionItemToggled(item.subscription_id, [], value)
              }
              value={isSubscribed}
            />
          </View>
        </View>
      </View>
    );
  };

  // Scope button component
  const ScopeButton = ({
    subscriptionId,
    component,
  }: {
    subscriptionId: string;
    component: any;
  }) => {
    const isActive = isSubscribedContactSubscription(subscriptionId, component.scopes);
    return (
      <TouchableOpacity
        style={[styles.pcScopeButton, isActive && styles.pcScopeButtonActive]}
        onPress={() =>
          onPreferenceContactSubscriptionItemToggled(
            subscriptionId,
            component.scopes,
            !isActive
          )
        }
        activeOpacity={0.7}
      >
        <Text style={[styles.pcScopeButtonText, isActive && styles.pcScopeButtonTextActive]}>
          {component.display.name}
        </Text>
        {isActive && <Text style={styles.pcScopeCheckmark}>✓</Text>}
      </TouchableOpacity>
    );
  };

  // Contact subscription group item component
  const ContactSubscriptionGroupItem = ({ item }: ItemProps) => (
    <View style={styles.pcSubscriptionCard}>
      <ItemDisplay item={item} />
      <View style={styles.pcScopeContainer}>
        {item.components.map((component: any) => (
          <ScopeButton
            subscriptionId={item.subscription_id}
            component={component}
            key={component.uniqueId || component.display?.name}
          />
        ))}
      </View>
    </View>
  );

  // Render item based on type
  const renderItem = ({ item }: ItemProps) => {
    switch (item.type) {
      case 'channel_subscription':
        return <ChannelSubscriptionItem item={item} />;
      case 'contact_subscription':
        return <ContactSubscriptionItem item={item} />;
      case 'contact_subscription_group':
        return <ContactSubscriptionGroupItem item={item} />;
      case 'alert':
        return <AlertItem item={item} />;
      default:
        return null;
    }
  };

  // Render section header
  const renderSectionHeader = ({ section }: { section: PreferenceCenterSection }) => {
    const { title } = section;
    if (!title.name && !title.description) {
      return <View style={styles.pcSectionSpacer} />;
    }
    return (
      <View style={styles.pcSectionHeader}>
        {title.name ? <Text style={styles.pcSectionTitle}>{title.name}</Text> : null}
        {title.description ? (
          <Text style={styles.pcSectionDescription}>{title.description}</Text>
        ) : null}
      </View>
    );
  };

  // Empty state component
  const EmptyState = () => (
    <View style={styles.pcEmptyContainer}>
      <View style={styles.pcEmptyIconContainer}>
        <Text style={styles.pcEmptyIcon}>⚙️</Text>
      </View>
      <Text style={styles.pcEmptyTitle}>Preference Center Unavailable</Text>
      <Text style={styles.pcEmptyDescription}>
        No preference center configuration found. Pull down to refresh or check your setup.
      </Text>
      <TouchableOpacity style={styles.pcRetryButton} onPress={onRefresh}>
        <Text style={styles.pcRetryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isFetching && preferenceCenterData.length === 0) {
    return (
      <View style={styles.pcLoadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.pcLoadingText}>Loading preferences...</Text>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.pcContainer}>
      {preferenceCenterData.length > 0 ? (
        <Animated.View style={[styles.pcListContainer, { opacity: fadeAnim }]}>
          <SectionList
            sections={preferenceCenterData}
            keyExtractor={(item, index) => item.id || `item-${index}`}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.pcListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
            ItemSeparatorComponent={() => <View style={styles.pcItemSeparator} />}
            SectionSeparatorComponent={() => <View style={styles.pcSectionSeparator} />}
          />
        </Animated.View>
      ) : (
        <EmptyState />
      )}
    </View>
  );
}

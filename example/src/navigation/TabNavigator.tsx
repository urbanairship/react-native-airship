/* Copyright Airship and Contributors */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from '@react-native-vector-icons/material-icons';

import HomeScreen from '../screens/HomeScreen';
import MessageCenterScreen from '../screens/MessageCenterScreen';
import PreferenceCenterScreen from '../screens/PreferenceCenterScreen';
import MessageDetailsScreen from '../screens/MessageDetailsScreen';
import EmbeddedViewsScreen from '../screens/EmbeddedViewsScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Enum for tab navigation
enum TabScreens {
  HOME = 'Home',
  MESSAGE_CENTER = 'MessageCenter',
  PREFERENCE_CENTER = 'PreferenceCenter',
  EMBEDDED_VIEWS = 'EmbeddedViews',
  MESSAGE_DETAILS = 'MessageDetails',
}

export type TabNavigatorProps = {
  initialScreen?: TabScreens;
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ 
  initialScreen = TabScreens.HOME,
}) => {
  const [activeScreen, setActiveScreen] = useState<TabScreens>(initialScreen);
  const [params, setParams] = useState<Record<string, any>>({});

  // Simple navigation functions
  const navigate = (screen: TabScreens, screenParams?: Record<string, any>) => {
    setActiveScreen(screen);
    if (screenParams) {
      setParams(screenParams);
    }
  };

  const goBack = () => {
    // Default back behavior is to return to home
    setActiveScreen(TabScreens.HOME);
  };

  // Create a mock navigation object for screens - must exactly match what screens expect
  const navigation = {
    navigate: (routeName: string, params?: Record<string, any>) => {
      if (routeName === 'MessageDetails') {
        setActiveScreen(TabScreens.MESSAGE_DETAILS);
        if (params) {
          setParams(params);
        }
      } else if (Object.values(TabScreens).includes(routeName as TabScreens)) {
        setActiveScreen(routeName as TabScreens);
        if (params) {
          setParams(params);
        }
      }
    },
    goBack: () => {
      // If we're in message details, go back to message center
      if (activeScreen === TabScreens.MESSAGE_DETAILS) {
        setActiveScreen(TabScreens.MESSAGE_CENTER);
      } else {
        // Default back behavior is to return to home
        setActiveScreen(TabScreens.HOME);
      }
    },
    addListener: () => ({ remove: () => {} }),
    push: (routeName: string, params?: Record<string, any>) => {
      navigate(routeName as TabScreens, params);
    },
    replace: (routeName: string, params?: Record<string, any>) => {
      navigate(routeName as TabScreens, params);
    },
    setParams: (newParams: Record<string, any>) => {
      setParams({...params, ...newParams});
    },
    setOptions: () => {},
  };
  const insets = useSafeAreaInsets();

  // Create a mock route object for screens
  const route = {
    params,
    name: activeScreen,
    key: activeScreen,
  };

  // Render the current screen based on activeScreen state
  const renderScreen = () => {
    switch (activeScreen) {
      case TabScreens.HOME:
        return <HomeScreen navigation={navigation} />;
      case TabScreens.MESSAGE_CENTER:
        return <MessageCenterScreen navigation={navigation} route={route} />;
      case TabScreens.PREFERENCE_CENTER:
        return <PreferenceCenterScreen navigation={navigation} route={route} />;
      case TabScreens.EMBEDDED_VIEWS:
        return <EmbeddedViewsScreen navigation={navigation} />;
      case TabScreens.MESSAGE_DETAILS:
        return (
          <MessageDetailsScreen 
            navigation={navigation} 
            messageId={params.messageId}
            title={params.title}
          />
        );
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  // Hide tab bar when showing message details or embedded views
  const shouldShowTabBar = activeScreen !== TabScreens.MESSAGE_DETAILS && activeScreen !== TabScreens.EMBEDDED_VIEWS;
  const shouldShowBackButton = activeScreen === TabScreens.MESSAGE_DETAILS || activeScreen === TabScreens.EMBEDDED_VIEWS;

  const getHeaderTitle = () => {
    switch (activeScreen) {
      case TabScreens.EMBEDDED_VIEWS:
        return 'Embedded Views';
      case TabScreens.MESSAGE_DETAILS:
        return 'Message Details';
      default:
        return 'Airship Example';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        {shouldShowBackButton ? (
          <TouchableOpacity style={styles.headerBackButton} onPress={goBack}>
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <Image 
            source={require('../img/airship-mark.png')} 
            style={styles.headerImage}
          />
        )}
        <Text style={styles.headerText}>{getHeaderTitle()}</Text>
        {shouldShowBackButton && <View style={styles.headerBackButton} />}
      </View>
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      {shouldShowTabBar && (
        <View style={[styles.tabBar, { paddingBottom: insets.bottom }]}>
        <Pressable
          style={({pressed}) => [
            styles.tabItem,
            activeScreen === TabScreens.HOME && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => navigate(TabScreens.HOME)}
        >
          <Icon name="home" size={26} color={activeScreen === TabScreens.HOME ? '#004bff' : '#666666'} />
          <Text
            style={[
              styles.tabText,
              activeScreen === TabScreens.HOME && styles.activeTabText,
            ]}
          >
            Home
          </Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.tabItem,
            activeScreen === TabScreens.MESSAGE_CENTER && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => navigate(TabScreens.MESSAGE_CENTER)}
        >
          <Icon name="email" size={26} color={activeScreen === TabScreens.MESSAGE_CENTER ? '#004bff' : '#666666'} />
          <Text
            style={[
              styles.tabText,
              activeScreen === TabScreens.MESSAGE_CENTER && styles.activeTabText,
            ]}
          >
            Messages
          </Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.tabItem,
            activeScreen === TabScreens.PREFERENCE_CENTER && styles.activeTab,
            pressed && styles.tabPressed
          ]}
          onPress={() => navigate(TabScreens.PREFERENCE_CENTER)}
        >
          <Icon name="settings" size={26} color={activeScreen === TabScreens.PREFERENCE_CENTER ? '#004bff' : '#666666'} />
          <Text
            style={[
              styles.tabText,
              activeScreen === TabScreens.PREFERENCE_CENTER && styles.activeTabText,
            ]}
          >
            Preferences
          </Text>
        </Pressable>

      </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001f9e',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 50,
  },
  headerImage: {
    width: 30,
    height: 30,
    marginRight: 10,
    resizeMode: 'contain',
  },
  headerBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    minHeight: 70,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#004bff',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
  },
  activeTabText: {
    color: '#004bff',
    fontWeight: 'bold',
  },
  tabPressed: {
    opacity: 0.7,
    backgroundColor: '#F0F0F0',
  },
});

export default TabNavigator;
/* Copyright Airship and Contributors */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { MessageView } from '@ua/react-native-airship';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

import styles from '../Styles';

type MessageScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'MessageDetails'>;
  route: RouteProp<RootStackParamList, 'MessageDetails'>;
};

const MessageScreen = ({ navigation, route }: MessageScreenProps) => {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 500);

    // Cleanup the timer when the component unmounts
    return () => clearTimeout(timer);
  }, []);

  const startLoading = () => {
    setAnimating(true);
  };

  const finishLoading = () => {
    setAnimating(false);
  };

  const failedLoading = () => {
    setAnimating(false);
    Alert.alert('Error', 'Unable to load message. Please try again later', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const messageId = route.params?.messageId || '';

  return (
    <View style={styles.backgroundContainer}>
      <MessageView
        messageId={messageId}
        onLoadStarted={startLoading}
        onLoadFinished={finishLoading}
        onLoadError={failedLoading}
        style={{ flex: 1 }}
      />
      {animating && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" animating={animating} />
        </View>
      )}
    </View>
  );
};

export default MessageScreen;
/* Copyright Airship and Contributors */
/**
 * Sample React Native App
 *
 * MessageScreen: Contains the selected message to be displayed.
 */
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { MessageView } from '@ua/react-native-airship';

import styles from './../Styles';

const MessageScreen = ({ navigation, route }) => {
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

  const messageId = route.params ? route.params.messageId : '';

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

/* Copyright Airship and Contributors */

import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet } from 'react-native';
import { MessageView } from '@ua/react-native-airship';

type MessageDetailsScreenProps = {
  navigation: any;
  messageId: string;
  title?: string;
};

export default function MessageDetailsScreen({ navigation, messageId, title = 'Message' }: MessageDetailsScreenProps) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 500);

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
    Alert.alert('Unable to load message. Please try again later');
    navigation.goBack();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="← Back" onPress={() => navigation.goBack()} />
        <Text style={styles.title}>{title || 'Message'}</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.messageContainer}>
        <MessageView
          messageId={messageId}
          onLoadStarted={startLoading}
          onLoadFinished={finishLoading}
          onLoadError={failedLoading}
          style={{ flex: 1 }}
        />
        {animating && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" animating={animating} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});
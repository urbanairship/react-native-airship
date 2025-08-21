import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StatusBar, useColorScheme } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Airship, { EventType } from '@ua/react-native-airship';
import TabNavigator from './navigation/TabNavigator';
import styles from './Styles';

export default function App() {
  const [isAirshipReady, setIsAirshipReady] = useState(false);
  const [airshipError, setAirshipError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Airship SDK
    const initAirship = async () => {
      try {
        await Airship.takeOff({
          default: {
            appKey: "",
            appSecret: ""
          },
          site: "us",
          urlAllowList: ["*"],
          android: {
            notificationConfig: {
              icon: "ic_notification",
              accentColor: "#00ff00"
            },
            // Optional: Control log privacy level
            // "private" (default) - redacts sensitive information
            // "public" - logs all information without redaction
            logPrivacyLevel: "private"
          }
        });

        // Set up event listeners
        Airship.addListener(EventType.NotificationResponse, (event) => {
          // Handle notification responses
        });

        Airship.addListener(EventType.PushReceived, (event) => {
          // Handle push received
        });

        Airship.addListener(EventType.ChannelCreated, (event) => {
          // Handle channel creation
        });

        Airship.addListener(EventType.PushNotificationStatusChangedStatus, (event) => {
          // Handle push notification status changes
        });

        setIsAirshipReady(true);
      } catch (error) {
        setAirshipError(error instanceof Error ? error.message : String(error));
      }
    };

    initAirship();
  }, []);
  const isDarkMode = useColorScheme() === 'dark';

  if (airshipError) {
    return (
      <View style={styles.appErrorContainer}>
        <Text style={styles.appErrorTitle}>Airship Initialization Error</Text>
        <Text style={styles.appErrorMessage}>{airshipError}</Text>
      </View>
    );
  }

  if (!isAirshipReady) {
    return (
      <View style={styles.appLoadingContainer}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color="#004bff" />
        <Text style={styles.appLoadingText}>Initializing Airship SDK...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
         <TabNavigator />
    </SafeAreaProvider>
  );
}


import { Text, View, Button, StyleSheet } from 'react-native';
import Airship, {
  AirshipEmbeddedView,
  EventType,
  MessageView,
} from '@ua/react-native-airship';
import HomeScreen from './screens/HomeScreen';

const uiManager = global?.nativeFabricUIManager ? 'Fabric' : 'Paper';

console.log(`Using ${uiManager}`);


Airship.takeOff({
  default: {
    appKey: "",
    appSecret: ""
  }
})

Airship.addListener(EventType.PushNotificationStatusChangedStatus, (event) => {
  console.log('PushNotificationStatusChangedStatus', JSON.stringify(event));
});
Airship.channel.getChannelId().then((channel) => {
  console.log('channel', channel);
});

Airship.messageCenter.getMessages().then((messages) => {
  console.log('messages', messages);
});

export default function App() {
  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <MessageView
        style={{ flex: 1, backgroundColor: "#0FF000" }}
        messageId="I8A4kI_OEe6zxzpQHdTvTg"
        onLoadStarted={(event) => console.log('onLoadStarted', event)}
        onLoadError={(event) => console.log('onLoadError', event)}
        onLoadFinished={(event) => console.log('onLoadFinished', event)}
      />

    <HomeScreen />

    <AirshipEmbeddedView
        style={{ flex: 1, backgroundColor: "#00FF00" }}
        embeddedId="embedded-2"
      />

      <Button
        onPress={async () => {
          Airship.android.liveUpdateManager.start({
            type: 'Example',
            name: 'neat',
            content: {
              emoji: '🙌',
            },
          });
        }}
        title="Cools"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />
    </View>
  );
}


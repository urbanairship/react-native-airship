import { Text, View, StyleSheet } from 'react-native';
import Airship, { MessageView }  from '@ua/react-native-airship'

Airship.takeOff({
  default: {
    appKey: "",
    appSecret: ""
  }
})

Airship.channel.getChannelId().then(channel => {
  console.log("channel", channel)
});

Airship.messageCenter.getMessages().then(messages => {
  console.log("messages", messages)
});

export default function App() {
  return (
    <MessageView style={styles.container} messageId='LfM4YKuBEe-r4-_-Gs6CYg' onLoadFinished={ console.log("nice!")}/>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

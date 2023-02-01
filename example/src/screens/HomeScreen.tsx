import * as React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import Airship, { EventType } from '@ua/react-native-airship';

import styles from '../Styles';

function ChannelCell(props: { channelId: string }) {
  return (
    <Text style={styles.channel}>
      Channel ID {'\n'}
      {props.channelId}
    </Text>
  );
}

export default function HomeScreen() {
  const [channelId, setChannelId] = React.useState<string | null>(null);

  React.useEffect(() => {
    Airship.push.getNotificationStatus().then((id) => {
      console.log(id)
    });

    Airship.channel.getChannelId().then((id) => {
      if (id) {
        setChannelId(id);
      }
    });

    let subscription = Airship.addListener(EventType.ChannelCreated, (event) => {
      setChannelId(event.channelId)
    });

    return subscription.remove
  }, []);

  let channelcell = null;
  if (channelId) {
    channelcell = <ChannelCell channelId={channelId} />;
  }

  return (
    <View style={styles.backgroundContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          style={{
            width: 300,
            height: 38,
            marginTop: 50,
            alignItems: 'center',
          }}
          source={require('./../img/urban-airship-sidebyside.png')}
        />
        <View style={{ height: 75 }} />
        {channelcell}
      </ScrollView>
      <View style={styles.bottom}>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </View>
    </View>
  );
}

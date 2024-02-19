import React from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import styles from '../../Styles';

function ChannelCell({ channelId }) {
  const copyToClipboard = () => {
    Clipboard.setString(channelId);
  };

  return (
    <View style={{ marginLeft: 0, marginRight: 0}}>
      <TouchableHighlight onPress={copyToClipboard} style={{ borderRadius: 8 }}>
        <View style={styles.channelCellContents}>
          <Text style={{ fontWeight: 'bold' }}>Channel ID</Text>
          <Text style={{ marginTop: 0 }}>{channelId}</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
}

export default ChannelCell;

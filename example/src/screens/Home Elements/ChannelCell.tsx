import React from 'react';
import { View, Text, Clipboard, TouchableHighlight } from 'react-native';
import styles from '../../Styles';

function ChannelCell({ channelId }) {
  const copyToClipboard = () => {
    Clipboard.setString(channelId);
  };

  return (
    <View style={{ marginLeft: 0, marginRight: 0, marginBottom: 4 }}>
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

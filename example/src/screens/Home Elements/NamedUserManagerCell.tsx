import React from 'react';
import { View, Text } from 'react-native';
import NamedUserInputCell from './NamedUserInputCell';
import styles from '../../Styles';

interface NamedUserManagerCellProps {
  namedUserText: string;
  handleNamedUserSet: () => void;
  handleUpdateNamedUserText: (value: string) => void;
  namedUser: string | undefined;
}

const NamedUserManagerCell: React.FC<NamedUserManagerCellProps> = ({
  namedUserText,
  handleNamedUserSet,
  handleUpdateNamedUserText,
  namedUser,
}) => (
  <View style={styles.managerCell}>
    <View style={styles.stackRight}>
      <Text style={{ fontWeight: 'bold' }}>Named User</Text>
      <Text style={{ marginRight: 0 }}>
        {namedUser ? `${namedUser}` : 'Not set'}
      </Text>
      <NamedUserInputCell
        namedUserText={namedUserText}
        handleNamedUserSet={handleNamedUserSet}
        handleUpdateNamedUserText={handleUpdateNamedUserText}
        placeholder={namedUser ? `` : 'Named user'}
      />
    </View>
  </View>
);

export default NamedUserManagerCell;

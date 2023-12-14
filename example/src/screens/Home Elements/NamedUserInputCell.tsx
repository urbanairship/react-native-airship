import React from 'react';
import { View, TextInput, Button } from 'react-native';
import styles from '../../Styles';

interface NamedUserInputCellProps {
  namedUserText: string;
  handleNamedUserSet: () => void;
  handleUpdateNamedUserText: (value: string) => void;
  placeholder: string;
}

function NamedUserInputCell({
  namedUserText,
  handleNamedUserSet,
  handleUpdateNamedUserText,
  placeholder,
}: NamedUserInputCellProps) {
  return (
    <View style={styles.namedUserCellContainer}>
      <TextInput
        style={styles.textInput}
        autoCorrect={false}
        autoCapitalize="none"
        onSubmitEditing={handleNamedUserSet}
        onChangeText={handleUpdateNamedUserText}
        value={namedUserText}
        placeholder={placeholder}
        placeholderTextColor={'grey'}
      />
    </View>
  );
}

export default NamedUserInputCell;

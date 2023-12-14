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
      />
      <View>
        <Button
          color="#0d6a83"
          onPress={handleNamedUserSet}
          title="Set Named User"
        />
      </View>
    </View>
  );
}

export default NamedUserInputCell;

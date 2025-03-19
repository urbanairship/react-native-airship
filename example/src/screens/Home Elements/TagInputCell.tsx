import React from 'react';
import { View, TextInput } from 'react-native';
import styles from '../../Styles';

interface TagInputCellProps {
  tagText: string;
  handleTagAdd: () => void;
  handleUpdateTagText: (value: string) => void;
  placeholder: string;
}

const TagInputCell: React.FC<TagInputCellProps> = ({
  tagText,
  handleTagAdd,
  handleUpdateTagText,
  placeholder,
}) => (
  <View style={styles.miniCellContainer}>
    <TextInput
      style={styles.textInput}
      autoCorrect={false}
      autoCapitalize={'none'}
      onSubmitEditing={() => handleTagAdd()}
      onChangeText={handleUpdateTagText}
      value={tagText}
      placeholder={placeholder}
      placeholderTextColor={'grey'}
    />
  </View>
);

export default TagInputCell;
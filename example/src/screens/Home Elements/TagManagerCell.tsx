import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import TagInputCell from './TagInputCell';
import styles from '../../Styles';

interface TagManagerCellProps {
  tagText: string;
  tags: string[];
  handleTagAdd: () => void;
  handleTagRemove: (value: string) => void;
  handleUpdateTagText: (value: string) => void;
}

const TagManagerCell: React.FC<TagManagerCellProps> = ({
  tagText,
  tags,
  handleTagAdd,
  handleTagRemove,
  handleUpdateTagText,
}) => (
  <View style={styles.managerCell}>
    <View style={styles.stackRight}>
      <Text style={{ fontWeight: 'bold' }}>Tags</Text>
      <TagInputCell
        tagText={tagText}
        handleTagAdd={handleTagAdd}
        handleUpdateTagText={handleUpdateTagText}
        placeholder={'Tap here to add a tag'}
      />
      <FlatList
        horizontal={true}
        data={tags}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item}</Text>
            <TouchableOpacity
              style={styles.circle}
              onPress={() => handleTagRemove(item)}
            >
              <View style={styles.dash} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  </View>
);

export default TagManagerCell;

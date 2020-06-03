/* Copyright Airship and Contributors */

// @flow
'use strict';

/** Editor for tag groups. **/
class TagGroupEditor {
  onApply: Function;
  operations: Array;

  constructor(onApply: Function) {
      this.onApply = onApply;
      this.operations = [];
  }

  /**
   * Adds tags to a tag group.
   *
   * @param {string} tagGroup The tag group.
   * @param {array<string>} tags Tags to add.
   * @return {TagGroupEditor} The tag group editor instance.
   */
  addTags(group: string, tags: Array<string>): TagGroupEditor {
    var operation = { "operationType": "add", "group": group, "tags": tags }
    this.operations.push(operation)
    return this;
  }

  /**
   * Removes tags from the tag group.
   * @instance
   * @memberof TagGroupEditor
   * @function removeTags
   *
   * @param {string} tagGroup The tag group.
   * @param {array<string>} tags Tags to remove.
   * @return {TagGroupEditor} The tag group editor instance.
   */
  removeTags(group: string, tags: Array<string>): TagGroupEditor {
    var operation = { "operationType": "remove", "group": group, "tags": tags }
    this.operations.push(operation)
    return this;
  }

  /**
   * Overwrite the current set of tags on the Tag Group
   * @instance
   * @memberof TagGroupEditor
   * @function setTags
   *
   * @param {string} tagGroup The tag group.
   * @param {array<string>} tags Tags to set.
   * @return {TagGroupEditor} The tag group editor instance.
   */
  setTags(group: string, tags: Array<string>): TagGroupEditor {
    var operation = { "operationType": "set", "group": group, "tags": tags }
    this.operations.push(operation)
    return this;
  }

  /**
   * Applies the tag changes.
   * @instance
   * @memberof TagGroupEditor
   * @function apply
   */
  apply() {
    this.onApply(this.operations);
  }
}

module.exports = TagGroupEditor;

// @flow
'use strict';

class TagGroupEditor {
  onApply: Function;
  operations: Array;

  constructor(onApply: Function) {
      this.onApply = onApply;
      this.operations = [];
  }

  addTags(group: string, tags: Array<string>): TagGroupEditor {
    var operation = { "operationType": "add", "group": group, "tags": tags }
    this.operations.push(operation)
    return this;
  }

  removeTags(group: string, tags: Array<string>): TagGroupEditor {
    var operation = { "operationType": "remove", "group": group, "tags": tags }
    this.operations.push(operation)
    return this;
  }

  apply() {
    this.onApply(this.operations);
  }
}

module.exports = TagGroupEditor;

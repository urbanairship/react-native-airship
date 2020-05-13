/* Copyright Airship and Contributors */

// @flow
'use strict';

/** Editor for attributes. **/
class AttributeEditor {
  onApply: Function;
  operations: Array;

  constructor(onApply: Function) {
      this.onApply = onApply;
      this.operations = [];
  }

  /**
   * Adds string attribute.
   * @instance
   * @memberof AttributeEditor
   * @function setString
   *
   * @param {string} value The attribute value.
   * @param {string} name The attribute name.
   * @return {AttributeEditor} The attribute editor instance.
   */
  setAttribute(name: string, value: string|number|date): AttributeEditor {
    let newValue = value;
    if (newValue instanceof Date) {
        newValue = value.toISOString();
    }
    var operation = { "action": "set", "value": newValue, "key": name }
    this.operations.push(operation)
    return this;
  }

  /**
   * Removes the attribute.
   * @instance
   * @memberof AttributeEditor
   * @function removeAttribute
   *
   * @param {string} name The name of the attribute to remove.
   * @return {AttributeEditor} The attribute editor instance.
   */
  removeAttribute(name: string): AttributeEditor {
    var operation = { "action": "remove", "key": name }
    this.operations.push(operation)
    return this;
  }

  /**
   * Applies the attribute operations.
   * @instance
   * @memberof AttributeEditor
   * @function apply
   */
  apply() {
    this.onApply(this.operations);
  }
}

module.exports = AttributeEditor;

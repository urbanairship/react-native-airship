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
   * @param {string|number|Date} name The attribute name.
   * @return {AttributeEditor} The attribute editor instance.
   */
  setAttribute(name: string, value: string|number|date): AttributeEditor {
    var operation = { "action": "set", "value": value, "key": name }
    if (typeof value === "string") {
        operation["type"] = "string"
    } else if (typeof value === "number") {
        operation["type"] = "number"
    } else if (typeof value === "boolean") {
         // No boolean attribute type. Convert value to string.
        operation["type"] = "string"
        operation["value"] = value.toString();
    } else if (value instanceof Date) {
        // JavaScript's date type doesn't pass through the JS to native bridge. Dates are instead serialized as milliseconds since epoch.
        operation["type"] = "date"
        operation["value"] = value.getTime()
    } else {
        throw("Unsupported attribute type: " + typeof value)
    }
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

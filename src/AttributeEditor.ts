/* Copyright Airship and Contributors */

'use strict';

/**
 * Attribute operation
 * @hidden
 */
export interface AttributeOperation {
  /**
   * The operation name.
   */
  action: string;
  /**
   * The attribute key.
   */
  key: string;
  /**
   * The instance id.
   */
  instance_id?: string;
  /**
   * Expiration for json attributes.
   */
  expiration_milliseconds?: number
  /**
   * The attribute value, if available.
   */
  value?: any
  /**
   * The attribute type, if available.
   */
  type?: 'string' | 'number' | 'date' | 'json';
}

/**
 * Editor for attributes.
 */
export class AttributeEditor {
  onApply: (operations: AttributeOperation[]) => Promise<void>;
  operations: AttributeOperation[];

  /**
   * AttributeEditor constructor
   *
   * @hidden
   * @param onApply The apply function
   */
  constructor(onApply: (operations: AttributeOperation[]) => Promise<void>) {
    this.onApply = onApply;
    this.operations = [];
  }

  /**
   * Adds an attribute.
   *
   * @param value The attribute value.
   * @param name The attribute name.
   * @return The attribute editor instance.
   */
  setAttribute(
    name: string,
    value: string | number | boolean | Date
  ): AttributeEditor {
    var attributeValue: string | number | Date;
    var attributeType: 'string' | 'number' | 'date';

    if (typeof value === 'boolean') {
      // No boolean attribute type. Convert value to string.
      attributeValue = value.toString();
      attributeType = 'string';
    } else {
      attributeValue = value;
      if (typeof value === 'string') {
        attributeType = 'string';
      } else if (typeof attributeValue === 'number') {
        attributeType = 'number';
      } else if (value instanceof Date) {
        // JavaScript's date type doesn't pass through the JS to native bridge.
        // Dates are instead serialized as milliseconds since epoch.
        attributeType = 'date';
        attributeValue = value.getTime();
      } else {
        throw 'Unsupported attribute type: ' + typeof attributeValue;
      }
    }

    const operation = {
      action: 'set',
      value: attributeValue,
      key: name,
      type: attributeType,
    };
    this.operations.push(operation);

    return this;
  }

   /**
   * Adds a JSON attribute.
   * 
   * @param name The attribute name.
   * @param value The attribute value.
   * @param instanceId The instance ID.
   * @param json The json value. Must not contain `exp` as top level key.
   * @param expiration: Optional expiration.  
   * @return The attribute editor instance.
   */
   setJsonAttribute(
    name: string,
    instanceId: string,
    json: Record<string, any>,
    expiration?: Date,
  ): AttributeEditor {
    var operation: AttributeOperation = {
      action: 'set',
      value: json,
      key: name,
      instance_id: instanceId,
      type: 'json'
    }

    if (expiration != null) {
      operation.expiration_milliseconds = expiration.getTime()
    }
    
    this.operations.push(operation);
    return this;
  }


  /**
   * Removes an attribute.
   * @param name The name of the attribute to remove.
   * @return The attribute editor instance.
   */
  removeAttribute(name: string): AttributeEditor {
    const operation = { action: 'remove', key: name };
    this.operations.push(operation);
    return this;
  }

  /**
   * Removes a JSON attribute.
   * @param name The name of the attribute to remove.
   * @param instanceId The instance ID.
   * @return The attribute editor instance.
   */
  removeJsonAttribute(name: string, instanceId: string): AttributeEditor {
    const operation = { action: 'remove', key: name, instance_id: instanceId };
    this.operations.push(operation);
    return this;
  }

  /**
   * Applies the attribute operations.
   */
  apply(): Promise<void> {
    return this.onApply(this.operations);
  }
}

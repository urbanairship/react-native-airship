/* Copyright Airship and Contributors */

'use strict';

import {JsonObject, JsonValue} from './Json'

/**
 * Custom event
 */
export class CustomEvent {

  _name: string;
  _value?: number;
  _properties: JsonObject;
  _transactionId?: string;

  /**
   * Custom event constructor.
   *
   * @param name The event name.
   * @param value The event value.
   */
  constructor(name: string, value?: number) {
    this._name = name;
    this._value = value;
    this._properties = {};
  }

  /**
   * Gets the event's transaction ID.
  */
  get transactionId(): string | undefined {
    return this._transactionId;
  }

  /**
   * Sets the event's transaction ID.
   */
  set transactionId(value: string | undefined) {
    this._transactionId = value;
  }

  /**
   * Adds a property to the custom event.
   *
   * @param name The property name.
   * @param value The property value.
   */
  addProperty(name: string, value: JsonValue) {
    this._properties[name] = value;
  }
}

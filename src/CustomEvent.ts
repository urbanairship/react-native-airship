/* Copyright Airship and Contributors */

'use strict';

import { JsonObject, JsonValue } from './types';

/**
 * Custom event
 */
export class CustomEvent {
  _name: string;
  _value?: number;
  _properties: JsonObject;
  _transactionId?: string;
  _interactionId?: string;
  _interactionType?: string;

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
   * Gets the event's interaction ID.
   */
  get interactionId(): string | undefined {
    return this._interactionId;
  }

  /**
   * Sets the event's interaction ID.
   */
  set interactionId(value: string | undefined) {
    this._interactionId = value;
  }

  /**
   * Gets the event's interaction Type.
   */
  get interactionType(): string | undefined {
    return this._interactionType;
  }

  /**
   * Sets the event's interaction Type.
   */
  set interactionType(value: string | undefined) {
    this._interactionType = value;
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

  /**
   * Converts a CustomEvent into a JsonValue.
   * 
   * @returns A JsonValue.
   */
  toJsonValue(): JsonValue {
    let jsonObject: JsonObject = {};
    jsonObject.eventName = this._name;
    if (this._value) {
      jsonObject.eventValue = this._value;
    }
    jsonObject.properties = this._properties;
    if (this._transactionId) {
      jsonObject.transactionId = this._transactionId;
    }
    if (this._interactionId) {
      jsonObject.interactionId = this._interactionId;
    }
    if (this._interactionType) {
      jsonObject.interactionType = this._interactionType;
    }
    return jsonObject;
  }
}

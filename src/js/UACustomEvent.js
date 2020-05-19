/* Copyright Airship and Contributors */

// @flow
'use strict';

type JsonValue = string | number | boolean | null | JsonMap | JsonArray;
type JsonMap = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

/**
 * Urban Airship Custom events
 **/
class UACustomEvent {
    _name: string;
    _value: ?number;
    _properties: Object;
    _transactionId: ?string;

    /**
     * Custom event constructor.
     *
     * @param {string} name The event name.
     * @param {number=} value The event value.
     */
    constructor(name: string, value: ?number) {
        this._name = name;
        this._value = value;
        this._properties = {};
    }

    /**
     * The event's transaction ID.
    */
    get transactionId(): ?string {
      return this._transactionId;
    }

    set transactionId(value: ?string) {
      this._transactionId =   value;
    }

    /**
     * Adds a property to the custom event.
     *
     * @param {string} name The property name.
     * @param {JsonValue} value The property value.
     */
    addProperty(name: string, value: JsonValue) {
      this._properties[name] = value;
    }
}

module.exports = UACustomEvent;

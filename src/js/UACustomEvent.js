// @flow
'use strict';

/**
 * Urban Airship Custom events
 **/
class UACustomEvent {
    _name: string;
    _value: number;
    _properties: object;
    _transactionId: transactionId;

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
     * @param {string|number|boolean|string[]} value The property value.
     */
    addProperty(name: string, value: string | number | boolean | Array<string>) {
      this._properties[name] = value;
    }
}

module.exports = UACustomEvent;

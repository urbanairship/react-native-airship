// @flow
'use strict';

class UACustomEvent {
    _name: string;
    _value: number;
    _properties: object;
    _transactionId: transactionId;

    constructor(name: string, value: ?number) {
        this._name = name;
        this._value = value;
        this._properties = {};
    }

    get transactionId(): ?string {
      return this._transactionId;
    }

    set transactionId(value: ?string) {
      this._transactionId =   value;
    }

    addProperty(name: string, value: string | number | boolean | Array<string>) {
      this._properties[name] = value;
    }
}

module.exports = UACustomEvent;

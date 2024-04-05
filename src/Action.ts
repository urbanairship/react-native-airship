/* Copyright Airship and Contributors */

'use strict';

import { JsonValue } from './types';

/**
 * Airship Action Object.
 * This is used to encapsulate the Action name and the Action value.
 */
export class Action {
    _name: string;
    _value?: JsonValue;

    /**
     * Airship Action constructor.
     *
     * @param name The action name.
     * @param value The action value.
     */
    constructor(name: string, value?: JsonValue) {
      this._name = name;
      this._value = value;
    }

    /**
     * Sets the action value.
     *
     * @param value The action value.
     */
    setValue(value?: JsonValue) {
        this._value = value;
    }
}
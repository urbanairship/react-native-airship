/* Copyright Airship and Contributors */

'use strict';

export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export type JsonObject = {
  [key: string]: JsonValue;
};

export type JsonArray = JsonValue[];


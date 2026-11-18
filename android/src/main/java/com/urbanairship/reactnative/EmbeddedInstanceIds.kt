/* Copyright Airship and Contributors */

package com.urbanairship.reactnative

import com.urbanairship.json.JsonValue

/**
 * Reads the requested instances in preference order.
 *
 * The JS side sends a list, and a bare string is accepted as a one-entry
 * list so the config remains readable on its own.
 *
 * @param value the `instanceId` entry of the selection.
 * @return the requested instance IDs, empty entries dropped.
 */
internal fun parseInstanceIds(value: JsonValue): List<String> {
    val values = if (value.isJsonList) value.optList().list else listOf(value)
    return values.mapNotNull { it.string?.takeIf(String::isNotEmpty) }
}
